import cron from 'node-cron';
import { deleteTempFiles } from './cleanUpTempFiles.ts';

const startCronJob  = ()=>{

    cron.schedule("0 * * * *",async()=>{

        console.log("Running cron job to delete temp files");
        await deleteTempFiles();
    })
}

export default startCronJob;