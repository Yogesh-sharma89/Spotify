import usePlayerStore from "@/store/usePlayerStore";
import {useEffect, useRef } from "react"


const AudioPlayer = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const prevSongRef = useRef<string | null>(null);

   const {currentSong,isPlaying,PlayNext} = usePlayerStore();

   //music play and pause 

   useEffect(()=>{
      if(isPlaying) audioRef.current?.play();
      else audioRef.current?.pause();
   },[isPlaying])

   //music end handle 

   useEffect(()=>{
    const audio = audioRef.current;

    const handleSongEnd = ()=>{
        PlayNext();
    }

    audio?.addEventListener("ended",handleSongEnd)

    return ()=>audio?.removeEventListener('ended',handleSongEnd);

   },[PlayNext])


   //handle music change 

   useEffect(()=>{
    if(!currentSong) return;

    const audio = audioRef.current!;

    const isSongChanged = prevSongRef.current !==currentSong.audioUrl;

    if(isSongChanged){
        //update audio src 
        audio.src = currentSong.audioUrl;

        //set playback to start 
        audio.currentTime = 0;

        prevSongRef.current = currentSong.audioUrl;

        if(isPlaying) audio.play();
    }

   },[currentSong,isPlaying])

  return (
    <audio ref={audioRef} onEnded={()=>usePlayerStore.setState({isPlaying:false})}/>
  )
}

export default AudioPlayer
