import type { Song } from "@/interfaces/song"
import usePlayerStore from "@/store/usePlayerStore"
import { Button } from "./ui/button";
import { PauseIcon, PlayIcon } from "lucide-react";
import { useClerk } from "@clerk/react";
import useChatStore from "@/store/useChatStore";


const PLayButton = ({song,activeSongId}:{song:Song,activeSongId:string | null}) => {

    const {currentSong,isPlaying,SetCurrentSong,TooglePlay} = usePlayerStore();

    const {openSignIn,isSignedIn,user} = useClerk();
    const socket = useChatStore((state)=>state.socket);
    const isCurrentSong = currentSong?._id === song._id;

    const handlePlay = () => {
        if(!isSignedIn){
            openSignIn();
            return;
        }
        if(isCurrentSong){
                TooglePlay(user?.id,socket!);
        }else{
             SetCurrentSong(song,user?.id,socket!);
        }
    }

  return (
    <Button onClick={handlePlay}
    className={`absolute bottom-0 right-2 bg-green-500 hover:bg-green-400 hover:scale-105 transition-all translate-y-2 group-hover:translate-y-0  ${isCurrentSong ? "opacity-100":"opacity-0 group-hover:opacity-100"} 
        
        ${activeSongId === currentSong?._id ? "opacity-100":""}
        `}
    >
        {
            isCurrentSong && isPlaying ? 
            (<PauseIcon className="size-4 text-black font-medium"/>)
            :
            (<PlayIcon className="size-4 text-black font-medium"/>)
        }
      
    </Button>
  )
}

export default PLayButton
