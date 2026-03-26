
import PLayButton from "./PLayButton";
import type { Song } from "@/interfaces/song";
import FeatureSongSkeletion from "./skeletons/FeatureSong";


const FeaturedSongs = ({songs,isLoading}:{songs:Song[],isLoading:boolean}) => {

  if(isLoading) return <FeatureSongSkeletion/>

  return (
    <div className="w-full mb-2 overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 ">
      {
        songs.map((song)=>(
            <div key={song._id} 
               className="relative  flex items-center gap-2 group bg-zinc-800/50 hover:bg-zinc-700/50 cursor-pointer rounded-md select-none transition-colors"
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

                <PLayButton song={song}/>

            </div>
        ))
      }
    </div>
  )
}

export default FeaturedSongs
