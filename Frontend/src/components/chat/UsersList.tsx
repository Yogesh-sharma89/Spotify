import useChatStore from "@/store/useChatStore";
import { ScrollArea } from "../ui/scroll-area"
import { useGetAllUsers } from "@/hooks/useUser";
import UserSkeleton from "../skeletons/UserSkeleton";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "../ui/avatar";
import usePlayerStore from "@/store/usePlayerStore";


const UsersList = () => {


   const {users,setSelectedUser,selectedUser,onlineUsers} = useChatStore();
   const {isLoading} = useGetAllUsers()
   const {isMobile} = usePlayerStore();

   
  return (
    <div className="border-r border-r-zinc-800">

        <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 w-full overflow-y-auto">
                <div className="space-y-4 p-4 overflow-y-auto py-6">
                  {
                    isLoading ? (
                        <UserSkeleton/>
                    ):
                    (
                        users?.map((user) => (
                            <div key={user._id} 
                             onClick={()=>setSelectedUser(user)}
                             className={`flex items-center justify-center lg:justify-start  p-3 gap-3 rounded-md cursor-pointer transition-colors duration-300 ${selectedUser?._id === user._id ? "bg-zinc-700/50" : "hover:bg-zinc-700/30"}   `}
                            >
                              
                              <Avatar className={`${isMobile ? "size-8" : "size-12"}  shrink-0`}>
                                <AvatarImage src={user.imageUrl} alt={user.fullname} className="w-full h-full object-cover"/>
                                <AvatarFallback>
                                    {user.fullname.slice(0,2)}
                                </AvatarFallback>
                                <AvatarBadge
                                 className={onlineUsers.has(user.clerkId) ? "bg-green-500" : "bg-zinc-700"}
                                />
                              </Avatar>

                              <div className="flex-1 min-w-0 lg:block hidden">
                                <span className="font-medium truncate capitalize">{user.fullname.trim()}</span>
                              </div>
                               
                            </div>
                        ))
                    )
                  }

                </div>

            </ScrollArea>

        </div>
      
    </div>
  )
}

export default UsersList
