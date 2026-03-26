import express from 'express';
import { protectRoutes, requireAdmin } from '../middleware/auth.middleware.ts';
import { uploadLimiter, uploads } from '../config/multer.ts';
import { checkAdmin, CreateAlbum, CreateSong, deleteAlbum, deleteSong, updateAlbum, updateSong } from '../controller/admin.controller.ts';

const adminRouter = express.Router();

adminRouter.get('/check-admin',checkAdmin);



adminRouter.post('/songs',uploadLimiter,
    protectRoutes,requireAdmin,
    uploads.fields([
        {name:"audio",maxCount:1},
        {name:"image",maxCount:1}
    ])
,CreateSong)

adminRouter.delete('/songs/:songId',protectRoutes,requireAdmin,deleteSong)

adminRouter.post('/albums',uploadLimiter,protectRoutes,requireAdmin,uploads.single("image"),CreateAlbum);
adminRouter.delete('/albums/:albumId',protectRoutes,requireAdmin,deleteAlbum);
adminRouter.patch('/albums/:albumId',uploadLimiter,protectRoutes,requireAdmin,uploads.single("image"),updateAlbum);
adminRouter.put('/songs/:songId',uploadLimiter,
    protectRoutes,requireAdmin,
    uploads.fields([
        {name:"audio",maxCount:1},
        {name:"image",maxCount:1}
    ])
,updateSong)




export default adminRouter;