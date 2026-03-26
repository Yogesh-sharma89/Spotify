import type { Message } from "@/interfaces/message";
import type { User } from "@/interfaces/user";
import axiosInstance from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"

 export const useGetAllUsers = ()=>{

    const  {data,isLoading} = useQuery({
        queryKey:["users"],
        queryFn:async()=>{

            const res = await axiosInstance.get("/users");

            return res.data.users as User[];
        }
    })

    return{ users:data,isLoading}
}

export const useGetUserMessages = (userId:string)=>{
    return useQuery({
        queryKey:["user-messages",userId],
        queryFn:async()=>{
            const res = await axiosInstance.get(`/users/messages/${userId}`);
            return res.data.messages as Message[];
        },
        enabled:!!userId
    })
}
 