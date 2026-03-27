import type { Song } from "@/interfaces/song"
import { Button } from "./ui/button"
import { ChevronRightIcon } from "lucide-react"
import RemainingSongSkeleton from "./skeletons/RemainingSongSkeleton"
import PLayButton from "./PLayButton"
import { useState } from "react"
import usePlayerStore from "@/store/usePlayerStore"
import { useClerk } from "@clerk/react"
import useChatStore from "@/store/useChatStore"


const RemainingSong = ({title,songs,isLoading}:{title:string,songs:Song[],isLoading:boolean}) => {

  const [activeSongId,setActiveSongId] = useState<string | null>(null);

  const {currentSong,SetCurrentSong,TooglePlay} = usePlayerStore();

  const {openSignIn,isSignedIn,user} = useClerk();
  const socket = useChatStore((state)=>state.socket);

    if(isLoading){
     <RemainingSongSkeleton/>
    }
  return (
    <div className="w-full overflow-hidden ">
        <div className="flex items-center justify-between mb-6">
           <h2 className="font-medium text-white text-lg lg:text-xl">{title}</h2>
           <Button size={'default'} variant={'outline'} className="flex items-center">
            <span>Show all</span>
            <ChevronRightIcon className="size-4 "/>
           </Button>
        </div>
       
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {
                songs?.map((song)=>(
                    <div key={song._id}
                     className="bg-zinc-800/40 rounded-md cursor-pointer p-4 group hover:bg-zinc-700/40 transition-all"
                     onClick={()=>{
                        setActiveSongId(song._id); // 👈 mobile ke liye

                        if (!isSignedIn) {
                          openSignIn();
                          return;
                        }

                        if (currentSong?._id === song._id) {
                          TooglePlay(user?.id, socket!);
                        } else {
                          SetCurrentSong(song, user?.id, socket!);
                        }
                      }} 
                    >
                      
                      <div className="relative mb-4">

                        <div className="aspect-square shadow-xl">

                            <img
                                src={song.imageUrl}
                                alt={song.audioUrl}
                                className="object-cover rounded-md  w-full h-full transition-transform group-hover:scale-105"
                            />

                        </div>

                        {/* todo : add play button  */}

                        <PLayButton song={song } activeSongId={activeSongId}/>

                      </div>

                      <div className="mt-3">
                         <h3 className="font-medium text-white  truncate">
                           {song.title}
                         </h3>
                        <p className="text-sm text-zinc-400 truncate">
                            {song.artist}
                        </p>
                      </div>

                     
                    </div>
                ))
            }

        </div>

      
    </div>
  )
}

export default RemainingSong
