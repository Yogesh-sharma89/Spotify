import AlbumSkeleton from "@/components/skeletons/AlbumSkeleton"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useGetAlbumById } from "@/hooks/useAlbum"
import useChatStore from "@/store/useChatStore"
import useMusicStore from "@/store/useMusicStore"
import usePlayerStore from "@/store/usePlayerStore"
import { formatDuration } from "@/utils/fomratDuration"
import {  useClerk } from "@clerk/react"
import { ClockIcon, MusicIcon, PauseIcon, PlayIcon } from "lucide-react"
import { useEffect } from "react"
import {  useParams } from "react-router-dom"

const AlbumPage = () => {
  const { albumId } = useParams<{ albumId: string }>()

  //zustand state

 

  const album = useMusicStore((state) => state.album)
  const setAlbum = useMusicStore((state) => state.setAlbum)

  //fetch album from server
  const { album: AlbumData, albumLoading } = useGetAlbumById(albumId!)

  const { currentSong, isPlaying, PlayAlbum, TooglePlay } = usePlayerStore();

  const {openSignIn,isSignedIn,user} = useClerk();
  const socket = useChatStore((state) => state.socket)

  
  useEffect(() => {
    if (AlbumData) {
      setAlbum(AlbumData)
    }
  }, [AlbumData, setAlbum])


  const handlePlayAlbum = (index: number) => {
     if(!isSignedIn){
        openSignIn();
        return;
    }
    
    if (album) {
      PlayAlbum(album.songs, index,user?.id,socket!)
    }
  }

  const handleToggleAlbum  = ()=>{

    if(!isSignedIn){
        openSignIn();
        return;
    }

    
    const isCurrentAlbumPlaying = currentSong?.albumId === albumId;

    if(isCurrentAlbumPlaying){
        TooglePlay(user?.id,socket!)
    }else{
        handlePlayAlbum(0)
    }
  }

   

  if (albumLoading) {
    return <AlbumSkeleton />
  }

 

  return (
    <div className="h-full">
      <ScrollArea className="h-full w-full rounded-md">
        <div className="relative h-full min-h-full">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#5038a0]/75 via-zinc-900/80 to-zinc-900" />

          {/* main album content  */}

          <div className="relative z-10">
            {/* album header  */}

            <div className="flex w-full gap-6 p-6 pb-8">
              <img
                src={album?.imageUrl}
                alt={album?.title}
                className="size-48 rounded-md object-cover shadow-xl md:size-52"
              />

              <div className="flex flex-col justify-end">
                <p className="text-sm font-medium">Album</p>
                <h1 className="my-2 text-5xl font-bold md:text-7xl">
                  {album?.title}
                </h1>

                <div className="flex items-center gap-1 md:gap-0">
                  <span className="font-white truncate text-xs text-zinc-200 md:text-sm">
                    {album?.artist}
                  </span>
                  <span className="mx-1.5 hidden text-xs font-bold text-zinc-200 md:inline">
                    &bull;
                  </span>
                  <span className="truncate text-xs text-zinc-200 md:text-sm">
                    {album?.songs.length} songs
                  </span>
                  <span className="mx-1.5 hidden text-xs font-bold text-zinc-200 md:inline md:text-sm">
                    &bull;
                  </span>
                  <span className="truncate text-xs text-zinc-200 md:text-sm">
                    {album?.releaseYear}
                  </span>
                </div>
              </div>
            </div>

            {/* play control button  */}

            <div className="flex items-center px-6 pb-6">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size={"icon"}
                            onClick={handleToggleAlbum}
                            className="size-15 rounded-full bg-green-500 transition-transform hover:scale-105 hover:bg-green-400"
                        >
                            {isPlaying && album?.songs.some((s)=>s._id===currentSong?._id) ? <PauseIcon className="size-6 font-bold text-black"/>
                            :<PlayIcon className="size-6 font-bold text-black" />}

                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>Tap this to play or pause music</p>
                    </TooltipContent>
                </Tooltip>
            </div>

            {/* songs table section  */}

            <div className="bg-black/20 backdrop-blur-sm">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="text-zinc-300 **:text-inherit">
                    <TableHead className="w-6">#</TableHead>
                    <TableHead className="w-[50%]">Title</TableHead>
                    <TableHead className="w-[25%]">Released Date</TableHead>
                    <TableHead className="w-[20%]">
                      <Tooltip>
                        <TooltipTrigger>
                          <ClockIcon className="size-5" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Song Duration</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {album?.songs.map((song, index) => {

                    const isCurrentSong = currentSong?._id === song._id;

                    return (
                      <TableRow
                        onClick={()=>handlePlayAlbum(index)}
                        key={song._id}
                        className="group cursor-pointer py-4"
                      >
                        <TableCell className="text-zinc-300">
                            {
                                isCurrentSong && isPlaying ? 
                                <MusicIcon className="size-4 animate-bounce text-green-400" />
                                : 
                                <span className="group-hover:hidden">
                                    {index + 1}
                                </span>

                            }
                          
                          { !isCurrentSong &&  <PlayIcon className="hidden size-3 group-hover:block" />}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <img
                              src={song.imageUrl}
                              alt={song.title}
                              className="size-10 shrink-0 rounded object-cover shadow-sm"
                            />

                            <div className="flex flex-1 flex-col gap-1">
                              <span className="text-sm font-medium text-white">
                                {song.title}
                              </span>
                              <span className="text-xs font-medium text-zinc-400">
                                {song.artist}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm font-medium text-zinc-400">
                            {song.createdAt.split("T")[0]}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm font-medium text-zinc-400">
                            {formatDuration(song.duration)}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}



export default AlbumPage
