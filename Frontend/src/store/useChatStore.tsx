import type { Message } from "@/interfaces/message"
import type { User } from "@/interfaces/user"
import { create } from "zustand"
import io from "socket.io-client"
import type { Socket } from "socket.io-client";

interface ChatStore{
    users:User[]| null,
    setUsers:(user:User[])=>void,
    socket:Socket | null,
    isConnected:boolean,
    onlineUsers:Set<string>,
    userActivities:Map<string,string>,
    messages:Message[]|null,
    setMessages:(messages:Message[] | ((prev:Message[])=>Message[]))=>void,
    initSocket:(userId:string)=>void,
    closeSocket:()=>void,
    selectedUser:User | null;
    setSelectedUser:(user:User | null)=>void,
    sendMessage:(receiverId:string,senderId:string,content:string)=>void,
}

const baseUrl = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/"

const socket = io(baseUrl,{
    withCredentials:true,
    transports:["websocket"],
    autoConnect:false
})

const useChatStore = create<ChatStore>((set,get)=>({
    users:null,
    selectedUser:null,
    setSelectedUser:(user:User | null)=>set({selectedUser:user}),
    setUsers:(users:User[])=>set({users:users}),
    socket:null,
    isConnected:false,
    onlineUsers:new Set(),
    userActivities:new Map(),
    messages:null,
    setMessages:(messages:Message[] | ((prev:Message[])=>Message[]))=>set((state)=>({messages:typeof messages === "function" ? messages(state.messages || []) : messages})),
    initSocket:(userId:string)=>{
        if(!get().isConnected){
            socket.auth={userId};
            socket.connect();
            console.log(socket)
            socket.emit("user-connected",userId);
            
            socket.on("users-online",(users:string[])=>{
                set({onlineUsers:new Set(users)});
            })
         
            
            socket.on("activities",(activities:Array<[string,string]>)=>{
                set({userActivities:new Map(activities)});
            })

            socket.on("user-connected",(userId:string)=>{
                set({onlineUsers:new Set([...get().onlineUsers,userId])});
            })
            
            socket.on("user-disconnected",(userId:string)=>{
                set({onlineUsers:new Set([...get().onlineUsers].filter((id)=>id!==userId))});
            })

            socket.on("receive-message",(message:Message)=>{
                set({messages: [...get().messages || [], message]});
            })

            socket.on("send-message",(message:Message)=>{
                set({messages: [...get().messages || [], message]});
            })

            socket.on("activity-updated",(({userId,activity})=>{
                set({userActivities:new Map([...get().userActivities, [userId, activity]])});
            }))

            set({isConnected:true,socket: socket});
        }
    },
    closeSocket:()=>{
        if(get().isConnected){
            socket.disconnect();
            set({isConnected:false,socket:null});
        }
    },
    sendMessage:(receiverId:string,senderId:string,content:string)=>{
       const socket = get().socket;

       if(!socket) return;

       socket.emit("send-message",{receiverId,senderId,content});
    },
}))

export default useChatStore
