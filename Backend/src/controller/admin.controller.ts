import AsyncHandler from "express-async-handler";
import AppError from "../utils/appClass.ts";
import Song from "../models/song.model.ts";
import cloudinary from "../config/cloudinary.ts";
import Album from "../models/album.model.ts";
import fs from "fs";
import User from "../models/user.model.ts";
import { getAuth } from "@clerk/express";

import "dotenv/config";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.ts";

export const CreateSong = AsyncHandler(async (req, res) => {
    if (!req.files) {
        throw new AppError(400, "No files uploaded");
    }

    const files = req.files as {
        image?: Express.Multer.File[],
        audio?: Express.Multer.File[],
    }

    const imageFile = files.image?.[0];
    const audioFile = files.audio?.[0];

    if (!imageFile || !audioFile) {
        throw new AppError(400, "Both image and audio files are required");
    }

    const { title, artist, duration, albumId } = req.body;

    if (!title || !artist || !duration) {
        throw new AppError(400, "Title, artist and duration are required to create a song");
    }

    const validDuration = parseInt(duration);
    if (isNaN(validDuration) || validDuration < 30) {
        throw new AppError(400, "Duration must be at least 30 seconds");
    }

    //upload these audio and image to cloudinary and get the url

    try {
        const [imageResult, audioResult] = await Promise.all([
            uploadToCloudinary(imageFile, "images", "image"),
            uploadToCloudinary(audioFile, "audio", "auto"),
        ]);

        const newSong = await Song.create({
            title,
            artist,
            duration: validDuration,
            albumId,
            imageUrl: imageResult?.secure_url,
            imageId: imageResult?.public_id,
            audioUrl: audioResult?.secure_url,
            audioId: audioResult?.public_id,
        })
    
        if (albumId) {
            await Album.findByIdAndUpdate(albumId, {
                $push: { songs: newSong._id }
            })
        }


        res.status(201).json({
        success: true,
        message: "Song created successfully",
        song: newSong,
        })


    } catch (err) {
        console.error("Cloudinary error:", err);
        throw new AppError(500, "Failed to upload files");
    } finally {
        // always cleanup
        fs.unlinkSync(imageFile.path);
        fs.unlinkSync(audioFile.path);
    }

})

export const deleteSong = AsyncHandler(async (req, res) => {

    const { songId } = req.params as { songId: string };

    if (!songId) {
        throw new AppError(400, "Song ID is required");
    }

    //check if the song exists or not

    const song = await Song.findById(songId);
    if (!song) {
        throw new AppError(404, "Song not found");
    }

    //delete the song files from cloudinary

    if (song.imageId) {
        await cloudinary.uploader.destroy(song.imageId);
    }

    if (song.audioId) {
        await cloudinary.uploader.destroy(song.audioId);
    }

    //now delete the song from album array if it is associated with any album

    await Album.findByIdAndUpdate(song.albumId, {
        $pull: { songs: song._id }
    })

    //now delete the song from database

    await Song.findByIdAndDelete(song._id);

    res.status(200).json({
        success: true,
        message: "Song deleted successfully"
    })
})

export const updateSong = AsyncHandler(async (req, res) => {

    const { songId } = req.params as { songId: string };

    //check if the song exists or not
    const song = await Song.findById(songId);

    if (!song) {
        throw new AppError(404, "Song not found");
    }

    const { title, artist, duration, albumId } = req.body;

    if (title) {
        song.title = title;
    }
    if (artist) {
        song.artist = artist;
    }
    if (duration) {
        const validDuration = parseInt(duration);
        if (isNaN(validDuration) || validDuration < 30) {
            throw new AppError(400, "Duration must be at least 30 seconds");
        }
        song.duration = validDuration;
    }
    if (albumId) {
        song.albumId = albumId;
    }


    //if song image and audio are uploaded then update them
    const files = req.files as {
        image?: Express.Multer.File[],
        audio?: Express.Multer.File[],
    }

    const imageFile = files.image?.[0];
    const audioFile = files.audio?.[0];

    if (imageFile) {
        //delete the old image from cloudinary
        if (song.imageId) {
            await cloudinary.uploader.destroy(song.imageId);
        }
        //now upload the new image to cloudinary
        const uploadImage = await uploadToCloudinary(imageFile, "images", "image");

        //now update the song image url and id
        song.imageUrl = uploadImage.secure_url;
        song.imageId = uploadImage.public_id;

        fs.unlinkSync(imageFile.path);

    }
    if (audioFile) {
        //delete the old audio from cloudinary
        if (song.audioId) {
            await cloudinary.uploader.destroy(song.audioId);
        }
        //now upload the new audio to cloudinary
        const uploadAudio = await uploadToCloudinary(audioFile, "audio", "auto");
        //now update the song audio url and id
        song.audioUrl = uploadAudio.secure_url;
        song.audioId = uploadAudio.public_id;

    }

    //now save the updated song
    await song.save();

    res.status(200).json({
        success: true,
        message: "Song updated successfully",
    })

})

export const CreateAlbum = AsyncHandler(async (req, res) => {

    const file = req.file;

    if (!file) {
        throw new AppError(400, "No image file uploaded for album");
    }

    const { title, artist, releaseYear } = req.body;


    if (!title || !artist || !releaseYear) {
        throw new AppError(400, "Title, artist and release year are required to create an album");
    }

    //now first upload the image to cloudinary and get the url

    const uploadImage = await uploadToCloudinary(file, "album_images", "image");

    //now create the album in database

    const newAlbum = await Album.create({
        title,
        artist,
        releaseYear,
        imageUrl: uploadImage.secure_url,
        imageId: uploadImage.public_id,
    })

    res.status(201).json({
        success: true,
        message: "Album created successfully",
        album: newAlbum,
    })
})

export const deleteAlbum = AsyncHandler(async (req, res) => {

    const { albumId } = req.params as { albumId: string };

    if (!albumId) {
        throw new AppError(400, "Album ID is required");
    }

    const album = await Album.findById(albumId);

    if (!album) {
        throw new AppError(404, "Album not found");
    }

    //now delete the album image from cloudinary

    await cloudinary.uploader.destroy(album?.imageId!);

    //now make album Id to null of all song related to this album

    await Song.updateMany(
        { albumId: album._id },
        { $set: { albumId: null } }
    )

    //now delete the album from database
    await Album.findByIdAndDelete(album._id);

    res.status(200).json({
        success: true,
        message: 'Album deleted successfully'
    })
})

export const updateAlbum = AsyncHandler(async (req, res) => {

    const { albumId } = req.params as { albumId: string };

    if (!albumId) {
        throw new AppError(400, "Album ID is required");
    }

    const album = await Album.findById(albumId);
    if (!album) {
        throw new AppError(404, "Album not found");
    }

    const { title, artist, releaseYear } = req.body;

    const file = req.file;
    let uploadImage;

    if (file) {
        //if there is a new image then delete the old image from cloudinary and upload the new image
        await cloudinary.uploader.destroy(album?.imageId!);

        uploadImage = await uploadToCloudinary(file, "album_images", "image");
    }

    album.title = title || album.title;
    album.artist = artist || album.artist;
    album.releaseYear = releaseYear || album.releaseYear;
    if (uploadImage) {
        album.imageUrl = uploadImage.secure_url;
        album.imageId = uploadImage.public_id;
    }

    await album.save();

    res.status(200).json({
        success: true,
        message: "Album updated successfully",
        album
    })
})

export const checkAdmin = AsyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
        throw new AppError(401, "Authenticated");
    }

    const user = await User.findOne({ clerkId: userId });



    const admin_email = process.env.ADMIN_EMAIL;

    const isAdmin = user?.email === admin_email;

    res.status(200).json({
        success: true,
        isAdmin
    })

})

export const getAllStats = AsyncHandler(async (req, res) => {


    const [songCount, userCount, albumCount, artistCount] = await Promise.all([
        Song.countDocuments(),
        User.countDocuments(),
        Album.countDocuments(),

        Song.aggregate([
            {
                $unionWith: {
                    coll: "albums",
                    pipeline: []
                }
            },
            {
                $group: {
                    _id: "$artist"
                }
            },
            {
                $count: "count"
            }
        ])
    ])

    res.status(200).json({
        success: true,
        message: "Stats fetched successfully",
        totalSongs: songCount,
        totalAlbums: albumCount,
        totalUsers: userCount,
        totalArtists: artistCount[0]?.count || 0,
    })
})

