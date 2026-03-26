import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateSong } from "@/hooks/useAdmin";
import { useGetAllAlbums } from "@/hooks/useAlbum";
import usePlayerStore from "@/store/usePlayerStore";
import { formatDuration } from "@/utils/fomratDuration";
import {  HeadphonesIcon, ImageUpIcon, LoaderIcon, PlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner";


const AddSongDialog = () => {

  const [open, setOpen] = useState(false);
  const {data:albums} = useGetAllAlbums();
  const {isMobile} = usePlayerStore()
 
  const [newSong, setNewSong] = useState<{
    title: string,
    artist: string,
    albumId: string | null,
    duration: number,
  }>({
    title: '',
    artist: '',
    albumId:null,
    duration:0,
  })

  const [files,setFiles] = useState<{
    audio:File|null,
    image:File|null
  }>({
    audio:null,
    image:null
  })

  const audioinputRef = useRef<HTMLInputElement>(null);
  const imageinputRef = useRef<HTMLInputElement>(null);



  const handleAudioChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const  audioFile = e.target.files?.[0] || null;
    if(!audioFile) return;

    setFiles((prev)=>({...prev,audio:audioFile}));

    const audio = new Audio();
    audio.src = URL.createObjectURL(audioFile);
    audio.addEventListener('loadedmetadata',()=>{
        const duration = Math.floor(audio.duration);
        if(duration<30){
            toast.info('Audio duration must be at least 30 seconds');
            setFiles((prev)=>({...prev,audio:null}));
            return;
        }

        setNewSong((prev)=>({...prev,duration}));


        URL.revokeObjectURL(audio.src);
    })
  }

  const previewImageUrl = files.image ? URL.createObjectURL(files.image) : null;
  const previewAudioUrl = files.audio ? URL.createObjectURL(files.audio) : null;

  const {mutate:createSong,isPending} = useCreateSong();


   const handleSubmit = async () => {
      if(! files.audio || !files.image){
        toast.error("Please select audio and image files");
        return;
      }

      const formData = new FormData();

      formData.append('title',newSong.title);
      formData.append('artist',newSong.artist);
      formData.append("duration",newSong.duration.toString());
      if(newSong.albumId && newSong.albumId !== 'none'){
        formData.append('albumId',newSong.albumId);
      }
      formData.append('audio',files.audio);
      formData.append('image',files.image);

       createSong(formData,{
        onSuccess:()=>{
           setOpen(false);

          setFiles({audio:null,image:null});

            setNewSong({
            title:'',
            artist:'',
            albumId:null,
            duration:0,
            })
        }
       });

      
      

  }

  const handleReset = () => {
    setFiles({audio:null,image:null});
    setNewSong({
        title:'',
        artist:'',
        albumId:null,
        duration:0,
    })
    setOpen(false);
  }

  useEffect(()=>{
    return ()=>{
      if(previewImageUrl){
        URL.revokeObjectURL(previewImageUrl);
      }
      if(previewAudioUrl){
        URL.revokeObjectURL(previewAudioUrl);
      }
    }
  },[previewImageUrl,previewAudioUrl])
  

  return (
    <Dialog
      open={open}
      
      onOpenChange={setOpen}
    >
        <form>
            <DialogTrigger asChild>
                <Button
                    size={isMobile?'sm':'lg'}
                    aria-label="Create song"
                    className="bg-primary-foreground px-3 py-2.5 hover:bg-primary-foreground/90 transition-colors "
                >

                    <PlusIcon className="size-5 text-black mr-1"/>
                    <span className="text-sm font-medium text-black">Add song</span>
            </Button>
            </DialogTrigger>

            <DialogContent className={` border-zinc-800 sm:max-w-sm`}>

                <DialogHeader>
                    <DialogTitle>Add New Song</DialogTitle>
                    <DialogDescription>
                        Please fill in the song details below.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4 no-scrollbar overflow-y-auto max-h-[80vh] -mx-4 px-4">

                    {/* input file  */}

                    <label className="block w-full ">

                        <h2 className="text-[16px] font-medium mb-2.5">Image File</h2>

                        <input
                            type="file"
                            className="hidden"
                            name="image"
                            ref={imageinputRef}
                            disabled={isPending}
                            onChange={(e)=>setFiles((prev)=>({...prev,image:e.target.files?.[0] || null}))}
                            accept="image/*"
                            onDragOver={(e)=>e.preventDefault()}
                            onDrop={(e)=>{
                                e.preventDefault();
                                if(e.dataTransfer.files[0]){
                                    setFiles((prev)=>({...prev,image:e.dataTransfer.files[0]}))
                                }
                        }} />

                        <div className="flex bg-zinc-900 rounded-lg flex-col items-center justify-center gap-3 p-3 h-auto border-2 border-dashed border-zinc-700 hover:bg-zinc-900/40 cursor-pointer transition-colors">
                        
                        { previewImageUrl ? (
                            <img
                            src={previewImageUrl}
                            alt="preview"
                            className="w-full h-full object-cover rounded-md"
                            />
                            ):
                        (
                            <>
                                <h2 className=" text-sm text-medium text-zinc-400">Upload Song Image</h2>
                                
                                <Button
                                variant={'secondary'}
                                type="button"
                                onClick={()=>imageinputRef.current?.click()}
                                className="inline-flex items-center gap-1.5 group"
                                >
                                    <ImageUpIcon className="size-4 text-zinc-300 group-hover:text-zinc-100 transition-colors"/>
                                    <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">Choose file</span>
                                </Button>
                            </>
                            )
                        
                        }
                        

                        </div>


                    </label>

                    {/* audio file  */}
                    <label className="block w-full ">

                        <h2 className="text-[16px] font-medium mb-2.5">Audio File</h2>

                        <input
                            type="file"
                            className="hidden"
                            name="audio"
                            disabled={isPending}
                            ref={audioinputRef}
                            onChange={handleAudioChange}
                            accept="audio/*"
                            onDragOver={(e)=>e.preventDefault()}
                            onDrop={(e)=>{
                                e.preventDefault();
                                if(e.dataTransfer.files[0]){
                                    setFiles((prev)=>({...prev,audio:e.dataTransfer.files[0]}))
                                }
                        }} />

                        <div className="flex bg-zinc-900 rounded-lg flex-col items-center justify-center gap-3 p-3 h-auto border-2 border-dashed border-zinc-700 hover:bg-zinc-900/40 cursor-pointer transition-colors">
                        
                        { previewAudioUrl ? (
                            <audio controls className="w-full">
                                <source src={previewAudioUrl!} />
                            </audio>
                            ):
                        (
                            <>
                                <h2 className=" text-sm text-medium text-zinc-400">Upload Song Audio</h2>
                                
                                <Button
                                variant={'secondary'}
                                type="button"
                                onClick={()=>audioinputRef.current?.click()}
                                className="inline-flex items-center gap-1.5 group"
                                >
                                    <HeadphonesIcon className="size-4 text-zinc-300 group-hover:text-zinc-100 transition-colors"/>
                                    <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">Choose file</span>
                                </Button>
                            </>
                            )
                        
                        }
                        

                        </div>


                    </label>

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="title">Title</FieldLabel>
                            <Input id="title" placeholder="Enter the song title" 
                                value={newSong.title}
                                disabled={isPending}
                                onChange={(e)=>setNewSong({...newSong,title:e.target.value})}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="artist">Artist</FieldLabel>
                            <Input id="artist" placeholder="Enter the song artist"
                                value={newSong.artist}
                                disabled={isPending}
                                onChange={(e)=>setNewSong({...newSong,artist:e.target.value})}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="duration">Duration</FieldLabel>
                            <Input id="duration" placeholder="Enter the song duration"
                                value={formatDuration(newSong.duration)}
                                readOnly 
                                disabled={!newSong.duration}
                                className="cursor-not-allowed pointer-events-none"
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="album">Album <span className="text-xs text-zinc-400">(optional)</span> </FieldLabel>

                            <Select
                                value={newSong.albumId || ""}
                                disabled={isPending}
                                onValueChange={(value)=>setNewSong((prev)=>({...prev,albumId:value}))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select an album" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Albums</SelectLabel>

                                    { albums?.map((album)=>(
                                        <SelectItem key={album._id} value={album._id}>
                                        
                                                {album.title}
                                        
                                        </SelectItem>
                                    ))}
                                    
                                </SelectGroup>

                                </SelectContent>

                            </Select>
                        </Field>

                        <Field className="mt-4" orientation={'horizontal'}>
                            <Button
                            size={isMobile?"sm":'lg'}
                            variant={'default'}  
                            type="submit"
                            onClick={handleSubmit}
                            disabled={!newSong.title || !newSong.artist ||  !files.audio || !files.image || isPending}
                            className="hover:bg-primary/80 transition-colors"
                            >
                        {
                            isPending ? <LoaderIcon className="size-4 animate-spin"/>
                            :
                            "Add song"
                        }
                            </Button>

                            <Button
                            size={isMobile?"sm":'lg'}
                            variant={'secondary'}
                            onClick={handleReset}
                            disabled={isPending}
                            >
                            Cancel
                            </Button>
                        
                        </Field>
                    </FieldGroup>

                    

                </div>

            </DialogContent>
        </form>
      
    </Dialog>
  )
}

export default AddSongDialog


