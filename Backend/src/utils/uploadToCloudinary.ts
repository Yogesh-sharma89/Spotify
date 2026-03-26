
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.ts";

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export const uploadToCloudinary = (
  file: Express.Multer.File,
  folder: string,
  resourceType: "image" | "video" | "auto" = "auto"
) => {
  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as CloudinaryUploadResult);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};