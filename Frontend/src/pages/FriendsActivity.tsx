
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetAllUsers } from "@/hooks/useUser";
import useChatStore from "@/store/useChatStore";
import usePlayerStore from "@/store/usePlayerStore";
import { useAuth } from "@clerk/react"
import { HeadphonesIcon, MusicIcon, UsersIcon } from "lucide-react";
import { useEffect } from "react";


const FriendsActivity = () => {

  const {isSignedIn,isLoaded} = useAuth();

  const {users:allUsers} = useGetAllUsers();

  const {users,setUsers,userActivities} = useChatStore((state)=>state);
   const {isMobile} = usePlayerStore((state)=>state);

  useEffect(()=>{
    if(allUsers?.length){
      setUsers(allUsers);
    }
  },[setUsers,allUsers])

  if(!isLoaded) return null;

  if(!isSignedIn) return (
    <div className="w-full h-full bg-zinc-900 overflow-hidden rounded-md">
       <LoginPrompt />
    </div>
  )


  return (

    <div className={`w-full h-full bg-zinc-900 overflow-hidden rounded-md ${isMobile && "min-h-125 h-full"}`}>
      <div className="w-full flex flex-col">

        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <UsersIcon className="size-5 shrink-0 text-zinc-400"/>
            <h2 className="font-semibold">What they're listening to</h2>
          </div>
        </div>

        <ScrollArea className="flex-1 h-full rounded-md">

          <div className="p-4 space-y-4">

            {
              users?.map((user)=>{
                const activity = userActivities.get(user.clerkId);
                const isPlaying = activity && activity!=="Idle";
                return(
                <div key={user._id} className="cursor-pointer hover:bg-zinc-800/50 p-3 rounded-md transition-colors group">
                   
                   <div className="flex items-start gap-3">
                     <Avatar className="size-10 border border-zinc-800">
                       <AvatarImage src={user.imageUrl}/>
                       <AvatarFallback>
                        {user.fullname.slice(0,2).toUpperCase()}
                       </AvatarFallback>
                       <AvatarBadge className={`text-white size-2.5 rounded-full ${isPlaying ? "bg-emerald-500" :"bg-zinc-600"}`}/>
                     </Avatar>

                     <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[16px] font-medium">
                        {user.fullname}
                       </span>
                       {isPlaying &&<MusicIcon className="size-5 shrink-0 text-blue-400"/>}
                      </div>
                      {
                        isPlaying ? 
                        (
                          <div className="mt-1">
                             <div className="text-sm tracking-wide text-white font-medium truncate">
                               {
                                activity.replace("Playing ","").split(" by ")[0]
                               }
                             </div>
                             <div className="text-xs text-zinc-400 text-medium truncate">
                               by {
                                activity.replace("Playing ","").split(" by ")[1]
                               }
                             </div>

                          </div>
                        )
                        :
                        (
                         <div className="text-xs text-zinc-400 font-medium">
                           Idle
                         </div>
                        )
                      }
                     </div>

                   </div>
                </div>
                 )
               })
            }

          </div>

        </ScrollArea>

      </div>
    </div>
  )
}

export default FriendsActivity



const LoginPrompt = ()=>{
  return(
    <div className="pointer-events-auto select-none w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-8">

      <div className=" relative">

        <div
        className="absolute -inset-1 rounded-full blur-md bg-linear-to-r from-emerald-500 to-sky-500  opacity-75 animte-pulse"
        />

        <div className="relative rounded-full bg-zinc-900  p-4">
          <HeadphonesIcon className="size-10 text-emerald-300"/>
        </div>

      </div>

      <div className="space-y-2 max-w-[250px]">

        <p className="text-lg font-semibold">See what others are listening</p>
        <p className="text-sm text-zinc-400">Sign in to see what your friends are listening to</p>

      </div>

    </div>
  )
}
