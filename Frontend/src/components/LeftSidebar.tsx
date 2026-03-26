import { cn } from "@/lib/utils"
import { HomeIcon, LibraryIcon, MessageCircleIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { buttonVariants } from "./ui/button"
import { useAuth } from "@clerk/react"
import { ScrollArea } from "./ui/scroll-area"
import PlaylistSkeleton from "./skeletons/PlaylistSkeleton"
import useMusicStore from "@/store/useMusicStore"
import { useGetAllAlbums } from "@/hooks/useAlbum"
import { useEffect } from "react"
import usePlayerStore from "@/store/usePlayerStore"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"


const LeftSidebar = () => {

    const {isSignedIn} = useAuth();

    //zustand state
    const {albums,setAlbums} = useMusicStore();

    //react query
    const {data: albumsData, isLoading: albumsLoading} = useGetAllAlbums();
    
    const {isMobile} = usePlayerStore();

    useEffect(()=>{
      if(albumsData?.length){
        setAlbums(albumsData);
      }
      
    },[albumsData,setAlbums])

  return (
    <div className="max-h-[calc(100vh-80px)] h-full  overflow-hidden w-full flex min-h-0 flex-col gap-2">

     {/* navigation menu  */}

     <div className={`rounded-lg bg-zinc-900 p-4 ${isMobile ? "px-2" : "px-4"}`}>

        <div className="space-y-3">

            <Link to={'/'} className={cn(buttonVariants({variant:'ghost'}), `w-full ${isMobile ? "justify-center p-1" : "justify-start"}  hover:bg-zinc-800`)}>
             {isMobile ?  <Tooltip>
                   <TooltipTrigger>
                      <HomeIcon className={`${isMobile?"size-6":"size-5 mr-2"} text-white cursor-pointer`}/>
                   </TooltipTrigger>
                   <TooltipContent side="right">
                    <p>Home</p>
                   </TooltipContent>
              </Tooltip>
             :
              <HomeIcon className={`${isMobile?"size-6":"size-5 mr-2"} text-white cursor-pointer`}/> 
            }
              

              <span className="text-white text-sm hidden md:inline font-semibold">Home</span>
            </Link>

            {
              isSignedIn && (
                <Link to={'/chat'} className={cn(buttonVariants({variant:'ghost'}), `w-full ${isMobile ? "justify-center p-1" : "justify-start"}  hover:bg-zinc-800`)}>
                  {isMobile ?  <Tooltip>
                   <TooltipTrigger >
                    <MessageCircleIcon className={`${isMobile?"size-6":"size-5 mr-2"} text-white cursor-pointer`}/>
                   </TooltipTrigger>
                   <TooltipContent side="right">
                    <p>Messages</p>
                   </TooltipContent>
                  </Tooltip>
                  :
                  <MessageCircleIcon className={`${isMobile?"size-6":"size-5 mr-2"} text-white cursor-pointer`}/>
                }
                  <span className="text-white text-sm hidden md:inline font-semibold">Messages</span>
                </Link>
              )
            }

        </div>

     </div>

     {/* library section  */}

     <div className="flex-1 flex flex-col no-scrollbar min-h-0 bg-zinc-900 rounded-lg p-4">

        <div className="flex items-center justify-between mb-6">

            <div className="flex items-center text-white gap-2.5 ">

                {isMobile ?  <Tooltip>
                  <TooltipTrigger asChild>
                    <LibraryIcon className="size-6 text-white"/>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Albums</p>
                  </TooltipContent>
                </Tooltip>
                :
                 <LibraryIcon className="size-6 text-white"/>
                }
                <span className="text-white hidden md:inline font-semibold">Playlists</span>

            </div>

        </div>

        {/* scrollarea of library items */}

        <ScrollArea className="flex-1 w-full overflow-y-auto">
            <div className="space-y-2 overflow-y-auto">
               {
                albumsLoading ? <PlaylistSkeleton/>
                :
                (
                  albums.map((album)=>(
                    <Link key={album._id} to={`/album/${album._id}`}
                    className={` text-white hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer
                      ${isMobile ? "justify-center p-1.5":"justify-start p-2.5"}
                      `}
                    >

                      <img src={album.imageUrl} alt={album.title} className="size-12 shrink-0 object-cover rounded-md group-hover:scale-110 transition-transform duration-300"/>

                      <div className="flex-1 min-w-0 hidden md:block ">
                        <p className="text-sm font-medium  truncate  text-ellipsis">{album.title}</p>
                        <p className="text-xs text-zinc-400 truncate text-ellipsis">{album.artist}</p>
                      </div>

                    </Link>
                  ))
                )
               }

            </div>

        </ScrollArea>

     </div>

    </div>
  )
}

export default LeftSidebar
