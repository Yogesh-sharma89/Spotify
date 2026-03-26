import express from 'express';
import cors from 'cors';
import userRouter from './routes/user.route.ts';
import authRouter from './routes/auth.route.ts';
import adminRouter from './routes/admin.route.ts';
import songRouter from './routes/song.route.ts';
import albumRouter from './routes/album.route.ts';
import statsRouter from './routes/stats.route.ts';
import { errorHandler } from './utils/errorHandler.ts';
import { serve } from 'inngest/express';
import { inngest,functions } from './inngest/index.ts';
import { clerkMiddleware } from '@clerk/express';
import path from 'path';
import helmet from 'helmet';
import morgan from 'morgan';


const __dirname = path.resolve();


const app  = express();

app.set("trust proxy", 1);

app.use(helmet({
    contentSecurityPolicy:false,
}));

app.use(morgan("combined"));

app.use(express.json());

app.use(cors({
    origin:[process.env.BASE_URL || true , "https://spotify-production-4f14.up.railway.app"],
    credentials:true,
    methods:["GET","POST","PUT","DELETE","PATCH"],
}));

app.use("/api/inngest",serve({client:inngest,functions,streaming:true}))

app.use(clerkMiddleware());

app.use('/api/users',userRouter);
app.use("/api/auth",authRouter);
app.use("/api/admin",adminRouter);
app.use("/api/songs",songRouter);
app.use("/api/albums",albumRouter);
app.use("/api/stats",statsRouter)


if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../Frontend/dist")));

    app.use((req,res)=>{
        res.sendFile(path.join(__dirname,"../Frontend","dist","index.html"))
    })
}

app.use(errorHandler);

export default app;