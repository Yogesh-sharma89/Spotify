import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateAlbum } from "@/hooks/useAdmin";
import usePlayerStore from "@/store/usePlayerStore";
import { ImageUpIcon, LoaderIcon, PlusIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";


const AddAlbumDialog = () => {
    const [open, setOpen] = useState(false);
    const {isMobile} = usePlayerStore();

    const [newAlbum, setNewAlbum] = useState<{
        title: string,
        artist: string,
        releaseYear: string,
      }>({
        title: '',
        artist: '',
        releaseYear: new Date().getFullYear().toString(),
    })

    const {mutate:createAlbum,isPending} = useCreateAlbum();
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
        if(!image){
            toast.info("Please select an image");
        }
        if(!newAlbum.title || !newAlbum.artist || !newAlbum.releaseYear){
            toast.info("All fields are required");
        }

        const formData = new FormData();
        formData.append('title',newAlbum.title);
        formData.append('artist',newAlbum.artist);
        formData.append('releaseYear',newAlbum.releaseYear);
        formData.append('image',image!);

        createAlbum(formData,{
            onSuccess:()=>{
                setOpen(false);
                setNewAlbum({
                    title: '',
                    artist: '',
                    releaseYear: new Date().getFullYear().toString(),
                })
               setImage(null);
            }
        });

    }

    const handleReset = () => {
        setImage(null);
        setNewAlbum({
            title:'',
            artist:'',
            releaseYear: new Date().getFullYear().toString(),
        })
        setOpen(false);
     }

    useEffect(()=>{
        return ()=>{
            if(previewImageUrl){
                URL.revokeObjectURL(previewImageUrl);
            }
        }
    },[previewImageUrl])

  return (
    <Dialog
    onOpenChange={setOpen}
    open={open}
    >
        <DialogTrigger asChild>
            <Button
                size={isMobile?'sm':'lg'}
                aria-label="Create album"
                className="bg-primary-foreground px-3 py-2.5 hover:bg-primary-foreground/90 transition-colors "
            >

                <PlusIcon className="size-5 text-black mr-1"/>
                <span className="text-sm font-medium text-black">Add album</span>
           </Button>

        </DialogTrigger>

        <DialogContent className="border-zinc-900">
             <DialogHeader>
                 <DialogTitle>Add New Album</DialogTitle>
                <DialogDescription>
                    Please fill in the album details below.
                </DialogDescription>
             </DialogHeader>

             <div className="space-y-6 py-4 no-scrollbar   overflow-y-auto max-h-[80vh] -mx-4 px-4">

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
                      
                       {image && previewImageUrl ? (
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

                     <Field className="mt-4" orientation={'horizontal'}>
                        <Button
                        size={isMobile?"sm":'lg'}
                        variant={'default'}  
                        type="submit"
                        onClick={handleSubmit}
                        disabled={!newAlbum.title || !newAlbum.artist ||   isPending || !image}
                        className="hover:bg-primary/80 transition-colors"
                        >
                       {
                        isPending ? <LoaderIcon className="size-4 animate-spin"/>
                        :
                        "Add Album"
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
      
    </Dialog>
  )
}

export default AddAlbumDialog
