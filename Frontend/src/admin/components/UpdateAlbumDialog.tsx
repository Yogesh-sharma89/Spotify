import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Album } from "@/interfaces/album";
import type { UseMutateFunction } from "@tanstack/react-query";
import { ImageUpIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface UpdateAlbumDialogProps{
    open:boolean;
    onClose:()=>void;
    updateAlbum:UseMutateFunction<Album, Error, {
    albumId: string;
    album: FormData;
}, unknown>
    isPending:boolean;
    album:Album;
}

const UpdateAlbumDialog = ({open,onClose,updateAlbum,isPending,album}:UpdateAlbumDialogProps) => {

    const [newAlbum, setNewAlbum] = useState<{
          title: string,
          artist: string,
          releaseYear: string,
        }>({
          title: '',
          artist: '',
          releaseYear: new Date().getFullYear().toString(),
    })

    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [image,setImage] = useState<File|null>(null);
    
    const previewImageUrl = useMemo(() => {
        return image ? URL.createObjectURL(image) : null;
      }, [image]);

    const handleImageChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        if(e.target.files){
            setImage(e.target.files[0]);
        }
    }

    const handleSubmit = ()=>{

        const formData = new FormData();

        if(image){
            formData.append('image', image);
        }
        if(newAlbum.title.trim()){
            formData.append('title', newAlbum.title.trim());
        }
        if(newAlbum.artist.trim()){
            formData.append('artist', newAlbum.artist.trim());
        }
        if(newAlbum.releaseYear.trim()){
            formData.append('releaseYear', newAlbum.releaseYear.trim());
        }

        updateAlbum({
            albumId: album._id,
            album: formData,
        })

        setNewAlbum({
            title: '',
            artist: '',
            releaseYear: new Date().getFullYear().toString(),
        })
        setImage(null);
        onClose();
    }
  
    useEffect(()=>{
            return ()=>{
                if(previewImageUrl){
                    URL.revokeObjectURL(previewImageUrl);
                }
            }
    },[previewImageUrl])

    useEffect(()=>{
    
        const handleAlbum = ()=>{
            if(album){
               setNewAlbum({
                title: album.title,
                artist: album.artist,
                releaseYear: album.releaseYear,
            })
            }
            
        }
        handleAlbum();

        return ()=>{};
    },[album,setNewAlbum])

  return (
    <Dialog open={open} onOpenChange={onClose}>

        <form>

            <DialogContent className="border-zinc-900 sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Update Album</DialogTitle>
                    <DialogDescription>
                        Please fill in the album details below.
                    </DialogDescription>
                </DialogHeader>


                <div className="space-y-6 py-4 no-scrollbar overflow-y-auto max-h-[80vh] -mx-4 px-4">

                        <label className="block w-full ">

                            <h2 className="text-[16px] font-medium mb-2.5">Image File</h2>

                            <input
                                type="file"
                                className="hidden"
                                name="image"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                onDragOver={(e)=>e.preventDefault()}
                                />

                            <div className="flex bg-zinc-900 rounded-lg flex-col items-center justify-center gap-3 p-3 h-auto border-2 border-dashed border-zinc-700 hover:bg-zinc-900/40 cursor-pointer transition-colors">
                            
                            { image && previewImageUrl ? (
                                <img
                                src={previewImageUrl}
                                alt="preview"
                                className="w-full h-full object-cover rounded-md"
                                />
                                ):
                            (
                                <>
                                    <h2 className=" text-sm text-medium text-zinc-400">Upload Album Image</h2>
                                    
                                    <Button
                                    variant={'secondary'}
                                    type="button"
                                    onClick={()=>fileInputRef.current?.click()}
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

                        <FieldGroup>
                            <Field>
                            <FieldLabel htmlFor="title">Title</FieldLabel>
                            <Input id="title" placeholder="Enter the album title" 
                                value={newAlbum.title}
                                disabled={isPending}
                                onChange={(e)=>setNewAlbum({...newAlbum,title:e.target.value})}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="artist">Artist</FieldLabel>
                            <Input id="artist" placeholder="Enter the album artist"
                                value={newAlbum.artist}
                                disabled={isPending}
                                onChange={(e)=>setNewAlbum({...newAlbum,artist:e.target.value})}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="releaseYear">Release Year</FieldLabel>
                            <Input id="releaseYear" placeholder="Enter the release year"
                                value={newAlbum.releaseYear}
                                disabled={isPending}
                                onChange={(e)=>setNewAlbum({...newAlbum,releaseYear:e.target.value})}
                            />
                        </Field>
                        </FieldGroup>

                </div>

                <DialogFooter>
                    <DialogClose asChild> 
                         <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isPending} onClick={handleSubmit}>
                        Update Album
                    </Button>
                </DialogFooter>
            </DialogContent>
        </form>

    </Dialog>
  )
}

export default UpdateAlbumDialog;
