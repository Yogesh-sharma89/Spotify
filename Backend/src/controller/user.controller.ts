import AsyncHandler from "express-async-handler";
import User from "../models/user.model.ts";
import { clerkClient, getAuth } from "@clerk/express";
import Message from "../models/message.model.ts";

export const getAllUsers = AsyncHandler(async(req,res)=>{

    const {userId} = getAuth(req);

    const currentUser = await clerkClient.users.getUser(userId!);

    const users = await User.find({clerkId:{$ne:userId},email:{$ne:currentUser.emailAddresses[0]?.emailAddress}});
    res.status(200).json({
        success:true,
        users
    })
})

export const getUserMessages = AsyncHandler(async(req,res)=>{

    const {userId:myId} = getAuth(req);
    const {userId:otherUserId} = req.params as {userId:string};


    const messages = await Message.find({
        $or:[
            {
                senderId:myId,
                receiverId:otherUserId
            },
            {
                senderId:otherUserId,
                receiverId:myId
            }
        ]
    }).sort({createdAt:1});

    res.status(200).json({
        success:true,
        messages
    })
})