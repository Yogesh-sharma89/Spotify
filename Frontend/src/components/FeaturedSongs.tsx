
import PLayButton from "./PLayButton";
import type { Song } from "@/interfaces/song";
import FeatureSongSkeletion from "./skeletons/FeatureSong";
import { useState } from "react";
import { useClerk } from "@clerk/react";
import useChatStore from "@/store/useChatStore";
import usePlayerStore from "@/store/usePlayerStore";


const FeaturedSongs = ({songs,isLoading}:{songs:Song[],isLoading:boolean}) => {

  const [activeSongId,setActiveSongId] = useState<string | null>(null);

  const {currentSong,SetCurrentSong,TooglePlay} = usePlayerStore();

  const {openSignIn,isSignedIn,user} = useClerk();
  const socket = useChatStore((state)=>state.socket);

  if(isLoading) return <FeatureSongSkeletion/>


  return (
    <div className="w-full mb-2 overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 ">
      {
        songs.map((song)=>(
            <div key={song._id} 
               className="relative  flex items-center gap-2 group bg-zinc-800/50 hover:bg-zinc-700/50 cursor-pointer rounded-md select-none transition-colors"
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

                <img
                src={song.imageUrl}
                alt={song.title}
                className="rounded-md size-10 md:size-20 object-cover shrink-0 group-hover:scale-105 transition-transform"
                />

                <div className="flex-1 p-4">
                    <p className="truncate text-ellipsis font-medium text-white">{song.title}</p>
                    <p className="truncate text-xs text-zinc-400">{song.artist}</p>
                </div>

                <PLayButton song={song}  activeSongId={activeSongId}/>

            </div>
        ))
      }
    </div>
  )
}

export default FeaturedSongs
