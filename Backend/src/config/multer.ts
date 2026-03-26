import multer from 'multer';
import rateLimit from "express-rate-limit"


export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20, // max 20 uploads
  message: "Too many uploads, try later",
})

const storage = multer.memoryStorage();

const fileFilter = (req:Express.Request,file:Express.Multer.File,cb:multer.FileFilterCallback)=>{
    if(file.mimetype.startsWith("image/") || file.mimetype.startsWith("audio/")){
        cb(null,true);
    }else{
        cb(null,false);
    }
}

export const uploads = multer({
    storage,
    fileFilter,
    limits:{
        fileSize: 30 * 1024 * 1024, //10MB
    },

})