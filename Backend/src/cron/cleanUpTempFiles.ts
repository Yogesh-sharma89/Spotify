import fs from "fs/promises";
import path from "path";

const __dirname = path.resolve();

const tempDir = path.join(__dirname,"uploads");

await fs.mkdir(tempDir,{recursive:true});

export const deleteTempFiles = async()=>{

    try{

        const files = await fs.readdir(tempDir);

        const now = Date.now();

        await Promise.all(
            files.map(async(file)=>{
                try{

                    const filePath = path.join(tempDir,file);

                    const stats = await fs.stat(filePath);

                    const fileAge = now - stats.mtimeMs  //if file is longer than one hour then delete import PropTypes from 'prop-types'
                    
                    if(stats.isFile() && fileAge > 1000*60*60){
                        await fs.unlink(filePath);
                         console.log(`Deleted file: ${filePath}`);
                    }

                }catch(err){
                     console.error("Error deleting file:", err);
                }
            })
        )

    }catch(err){
         console.error("Error reading temp directory:", err);
    }
}