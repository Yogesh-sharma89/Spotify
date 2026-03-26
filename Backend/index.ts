import app from "./src/app.ts";
import "dotenv/config";
import ConnectToDb from "./src/config/database.ts";
import { createServer } from "http";
import { InitializeSocket } from "./src/config/socket.ts";
import path from "path";
import fs from "fs/promises";
import "./src/config/cloudinary.ts"

const port  = process.env.PORT;

const httpServer = createServer(app);

InitializeSocket(httpServer);


const startConnection  =  async()=>{
    try{

     await ConnectToDb();
     console.log("Database connected successfully 🎉")

     
     const uploadPath = path.join(process.cwd(),"uploads");
     await fs.mkdir(uploadPath,{recursive:true});
     console.log("Uploads directory created successfully 🎉")

     httpServer.listen(port,()=>{
        console.log("Server is listening on port 3000 ✅")
     })

    }catch(err){
        console.log('Failed to start server ',err);
        process.exit(1);

    }
}

startConnection();