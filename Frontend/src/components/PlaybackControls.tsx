import usePlayerStore from "@/store/usePlayerStore"
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Laptop2Icon, ListMusicIcon, Mic2Icon, PauseIcon, PlayIcon, RepeatIcon, ShuffleIcon, SkipBackIcon, SkipForwardIcon, Volume1Icon, Volume2Icon, VolumeIcon, VolumeXIcon } from "lucide-react";
import { useClerk } from "@clerk/react";
import { formatDuration } from "@/utils/fomratDuration";
import { Slider } from "./ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import useChatStore from "@/store/useChatStore";


const PlaybackControls = () => {

  const {currentSong,isPlaying,TooglePlay,PlayNext,PlayPrevious,setIsPlaying,shuffleQueue,isLooping,toggleLooping}  = usePlayerStore();

  const [volume,setVolume] = useState(75);
  const [currentTime,setCurrentTime] = useState(0);
  const [duration,setDuration] = useState(0);

  const {isSignedIn,openSignIn,user} = useClerk();
  const socket = useChatStore((state)=>state.socket);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(()=>{
    audioRef.current = document.querySelector("audio");

    const audio = audioRef.current;

    if(!audio) return;

    const handleUpdateTime = ()=>setCurrentTime(audio.currentTime);
    const handleUpdateDuration = ()=>setDuration(audio.duration);
    const handleEnded = ()=>{
        if(isLooping) return;
       setIsPlaying(false);
    }

    audio.addEventListener("timeupdate",handleUpdateTime);
    audio.addEventListener("loadedmetadata", handleUpdateDuration);
    audio.addEventListener("ended",handleEnded);

    return ()=>{
      audio.removeEventListener("timeupdate",handleUpdateTime);
      audio.removeEventListener("loadedmetadata", handleUpdateDuration);
      audio.removeEventListener("ended",handleEnded);
    }

  },[currentSong,audioRef,setIsPlaying,isLooping])

  useEffect(()=>{
    if(audioRef.current){
      audioRef.current.loop = isLooping;
    }
  },[isLooping])

  const handleSeek = (value:number[])=>{
    if(audioRef.current){
        audioRef.current.currentTime = value[0]
    }
  }

  const getVolumeIcon = ()=>{
    if(volume===0) return <VolumeXIcon className="size-4"/>
    if(volume<=30) return <VolumeIcon className="size-4"/>
    if(volume<=60) return <Volume1Icon className="size-4"/>
    return <Volume2Icon className="size-4"/>
  }

  return (
    <footer 
     className="h-20 fixed bottom-0 left-0 z-50 sm:h-22 rounded w-full bg-zinc-900 border-t border-t-zinc-800 px-4"
    >
        <div className="flex items-center justify-between h-full max-w-450 mx-auto">

            {/* current playing song  */}

            <div className="hidden sm:flex items-center gap-2.5 min-w-45 w-[22%]">

                {
                    currentSong && (
                        <>
                         <img
                          src={currentSong.imageUrl}
                          alt={currentSong.title}
                          className="size-14 object-cover rounded-md"
                         />
                         <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold truncate hover:underline cursor-pointer overflow-hidden">
                                {currentSong.title}
                             </p>
                             <p className="text-xs text-zinc-400 truncate hover:underline cursor-pointer font-medium overflow-hidden">
                                {currentSong.artist}
                             </p>
                         </div>
                        </>
                    )
                }

            </div>

            {/* play controls  */}

            <div className="flex flex-col gap-2 items-center flex-1  max-w-full sm:max-w-[42%]">

                <div className="flex items-center gap-4 sm:gap-6">

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                            size={'icon'}
                            disabled={!isSignedIn}
                            onClick={shuffleQueue}
                            variant={'ghost'}
                            className=" hover:text-white text-zinc-400"
                            >

                                <ShuffleIcon className="size-4"/>

                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Shuffle Songs</p>
                        </TooltipContent>
                    </Tooltip>


                   <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size={'icon'}
                                variant={'ghost'}
                                onClick={()=>{
                                    if(isSignedIn){
                                        PlayPrevious(user?.id,socket!);
                                    }else{
                                        openSignIn();
                                    }
                                }}
                                disabled={!currentSong || !isSignedIn}
                                className=" hover:text-white text-zinc-400"
                            >

                                <SkipBackIcon className="size-4"/>

                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Previous Song</p>
                        </TooltipContent>
                   </Tooltip>

                    <Button
                        size={'icon'}
                        className="bg-white disabled:cursor-none disabled:pointer-events-none hover:bg-white/70 rounded-full size-10   text-black"
                        onClick={()=>{
                            if(isSignedIn){
                                TooglePlay(user?.id,socket!);
                            }else{
                                openSignIn();
                            }
                        }}
                        disabled={!isSignedIn}
                    >

                      {
                        isPlaying ? (
                            <PauseIcon className="size-4"/>
                        ) : (
                            <PlayIcon className="size-4"/>
                        )
                      }  

                    </Button>

                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size={'icon'}
                                variant={'ghost'}
                                onClick={()=>{
                                    if(isSignedIn){
                                        PlayNext(user?.id,socket!);
                                    }else{
                                        openSignIn();
                                    }
                                }}
                                disabled={!currentSong || !isSignedIn}
                                className=" hover:text-white text-zinc-400"
                            >

                                <SkipForwardIcon className="size-4"/>

                            </Button>   
                        </TooltipTrigger>
                        <TooltipContent>
                            <p >Next Song</p>
                        </TooltipContent>
                    </Tooltip>


                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                            size={'icon'}
                            variant={'ghost'}
                            className={`text-zinc-400  ${isLooping && 'text-primary'}`}
                            onClick={toggleLooping}
                            disabled={!isSignedIn}
                            >
                                <RepeatIcon className="size-4"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>
                              {
                                isLooping ? "Stop loop":"Loop song"
                              }
                            </p>
                           
                        </TooltipContent>
                    </Tooltip>

                </div>

                <div className="flex items-center gap-2 w-full">

                    <span className="text-xs text-zinc-400">
                        {formatDuration(currentTime)}
                    </span>

                   {/* progress bar  */}

                  <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.01}
                  className="w-full hover:cursor-grab active:cursor-grabbing"
                  onValueChange={handleSeek}
                  disabled={!currentSong || !isSignedIn}
                  />

                  <span className="text-xs text-zinc-400">
                    {formatDuration(duration || 0)}
                  </span>

                </div>

            </div>


            {/* volume controls  */}

            <div className="hidden md:flex items-center gap-4 w-[23%] max-w-75">
                <Button size={'icon'} variant={'ghost'} className="hover:text-white text-zinc-400">
                  <Mic2Icon className="size-4"/>
                </Button>

                <Button size={'icon'} variant={'ghost'} className="hover:text-white text-zinc-400">
                  <ListMusicIcon className="size-4"/>
                </Button>

                <Button size={'icon'} variant={'ghost'} className="hover:text-white text-zinc-400">
                  <Laptop2Icon className="size-4"/>
                </Button>

                <div className="flex items-center gap-2">

                    <Button size={'icon'} variant={'ghost'} className="hover:text-white text-zinc-400">
                      {
                        getVolumeIcon()
                      }
                    </Button> 


                    <Slider
                     defaultValue={[volume]}
                     max={100}
                     step={0.01}
                     className="w-24 hover:cursor-grab active:cursor-grabbing"
                     onValueChange={
                        (value)=>{
                            setVolume(value[0]);
                            if(audioRef.current){
                                audioRef.current.volume = value[0] / 100;
                            }
                        }
                     }
                    />


                </div>

            </div>

        </div>
     
    </footer>
  )
}

export default PlaybackControls
