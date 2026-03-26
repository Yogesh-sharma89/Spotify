import {Server, Socket} from 'socket.io'
import http from 'http';
import Message from '../models/message.model.ts';



export const InitializeSocket = (server:http.Server)=>{

    const io = new Server(server,{
        cors:{
            origin:"http://localhost:5173",
            credentials:true
        }
    })

    const userSocket:Map<string,string[]> = new Map();
    const userActivity:Map<string,string> = new Map();

    io.on("connection",(socket:Socket)=>{

        socket.on("user-connected",(userId)=>{
             const sockets = userSocket.get(userId) || [];
            userSocket.set(userId,[...sockets,socket.id]);
            userActivity.set(userId,"Idle");

            //then broadcast to all users that this user is connected
            io.emit("user-connected",userId);

            socket.emit("users-online",Array.from(userSocket.keys()));

            io.emit("activities",Array.from(userActivity.entries()));
        })

        socket.on("update-activity",({userId,activity})=>{
            userActivity.set(userId,activity);

            //broadcast to all users that this user's activity is updated

            io.emit("activity-updated",{userId,activity});
        })

        socket.on("send-message",async(data)=>{
            const {receiverId,senderId,content} = data;

            try{

                const message = await Message.create({
                    senderId,
                    receiverId,
                    content
                })

                //then emit this message to receiver
                const receiverSocketIds = userSocket.get(receiverId) || [];

                    receiverSocketIds?.forEach((id:string) => {
                        io.to(id).emit("receive-message", message);
                    });

                //then emit this message to sender
                socket.emit("receive-message",message);

            }catch(err:any){ 
                console.log("Error while sending message ",err);
                socket.emit("error",err.message);

            }
        })

        socket.on("disconnect",()=>{
            //then broadcast to all users that this user is disconnected
            let disconnectedUserId: string | undefined; 

            for(const [userId,socketIds] of userSocket){
                if(socketIds.includes(socket.id)){
                    disconnectedUserId = userId;
                     userSocket.set(userId,socketIds.filter((id) => id !== socket.id));
                      userActivity.delete(userId);
                      break;
                }
            }

            if(disconnectedUserId){
                io.emit("user-disconnected",disconnectedUserId);
            }
        })
    })


}