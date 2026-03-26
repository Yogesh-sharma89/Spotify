import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Song } from "@/interfaces/song"
import useMusicStore from "@/store/useMusicStore"
import usePlayerStore from "@/store/usePlayerStore"
import { formatDuration } from "@/utils/fomratDuration"
import type { UseMutateFunction } from "@tanstack/react-query"
import { HeadphonesIcon, ImageUpIcon } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

interface updateSongParams {
  open: boolean
  onOpenChange: (open: boolean) => void
  song: Song | null,
  isPending: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateSong:UseMutateFunction<any, Error, {
    songId: string;
    song: FormData;
}, unknown>
}

const UpdateSongDialog = ({ open, onOpenChange, song,isPending,updateSong }: updateSongParams) => {
  const [newSong, setNewSong] = useState<{
    title: string
    artist: string
    albumId: string | null
    duration: number
  }>({
    title: song?.title || "",
    artist: song?.artist || "",
    albumId: song?.albumId || null,
    duration: song?.duration || 0,
  })

  const [files, setFiles] = useState<{
    audio: File | null
    image: File | null
  }>({
    audio: null,
    image: null,
  })

  const previewImageUrl = useMemo(() => {
        return files.image ? URL.createObjectURL(files.image) : null;
      }, [files.image]);
  
  const previewAudioUrl = useMemo(() => {
    return files.audio ? URL.createObjectURL(files.audio) : null;
  }, [files.audio]);

  const audioinputRef = useRef<HTMLInputElement>(null)
  const imageinputRef = useRef<HTMLInputElement>(null)

  const { isMobile } = usePlayerStore()
  const { albums } = useMusicStore()

  const handleSubmit = () => {

   const formData = new FormData()


    if (newSong.title.trim() && newSong.title !== song?.title) {
      formData.append("title", newSong.title.trim())
    }

    if (newSong.artist.trim() && newSong.artist !== song?.artist) {
      formData.append("artist", newSong.artist.trim())
    }

    if (
      newSong.albumId &&
      newSong.albumId !== song?.albumId &&
      newSong.albumId !== "none"
    ) {
      formData.append("albumId", newSong.albumId)
    }

    if (newSong.duration && newSong.duration !== song?.duration) {
      formData.append("duration", newSong.duration.toString())
    }

    // 👇 optional files
    if (files.audio) {
      formData.append("audio", files.audio)
    }

    if (files.image) {
      formData.append("image", files.image)
    }

    updateSong({
      songId: song?._id || "",
      song: formData
    })

    onOpenChange(false);

    setFiles({audio:null,image:null});

    setNewSong({
      title: "",
      artist: "",
      albumId: null,
      duration: 0,
    })


  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audioFile = e.target.files?.[0] || null
    if (!audioFile) return

    setFiles((prev) => ({ ...prev, audio: audioFile }))

    const audio = new Audio()
    audio.src = URL.createObjectURL(audioFile)
    audio.addEventListener("loadedmetadata", () => {
      const duration = Math.floor(audio.duration)
      if (duration < 30) {
        toast.info("Audio duration must be at least 30 seconds")
        setFiles((prev) => ({ ...prev, audio: null }))
        return
      }

      setNewSong((prev) => ({ ...prev, duration }))

      URL.revokeObjectURL(audio.src)
    })
  }

  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl)
      }
      if (previewAudioUrl) {
        URL.revokeObjectURL(previewAudioUrl)
      }
    }
  }, [previewImageUrl, previewAudioUrl])

  useEffect(()=>{
    if(!song) return;
    
    const handleSetSong = ()=>{
        setNewSong({
          title: song.title,
          artist: song.artist,
          albumId: song.albumId || null,
          duration: song.duration,
        })
    }
    handleSetSong();

  }, [song,setNewSong])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit the song</DialogTitle>
            <DialogDescription>Edit the song details</DialogDescription>
          </DialogHeader>

          <div className="-mx-4 no-scrollbar max-h-[80vh] space-y-6 overflow-y-auto px-4 py-4">
            {/* // Song Image*/}
            <label className="block w-full">
              <h2 className="mb-2.5 text-[16px] font-medium">Image File</h2>

              <input
                type="file"
                className="hidden"
                name="image"
                ref={imageinputRef}
                disabled={isPending}
                onChange={(e) =>
                  setFiles((prev) => ({
                    ...prev,
                    image: e.target.files?.[0] || null,
                  }))
                }
                accept="image/*"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (e.dataTransfer.files[0]) {
                    setFiles((prev) => ({
                      ...prev,
                      image: e.dataTransfer.files[0],
                    }))
                  }
                }}
              />

              <div className="flex h-auto cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900 p-3 transition-colors hover:bg-zinc-900/40">
                {files.image && previewImageUrl ? (
                  <img
                    src={previewImageUrl}
                    alt="preview"
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  <>
                    <h2 className="text-medium text-sm text-zinc-400">
                      Upload Song Image
                    </h2>

                    <Button
                      variant={"secondary"}
                      type="button"
                      onClick={() => imageinputRef.current?.click()}
                      className="group inline-flex items-center gap-1.5"
                    >
                      <ImageUpIcon className="size-4 text-zinc-300 transition-colors group-hover:text-zinc-100" />
                      <span className="text-sm text-zinc-300 transition-colors group-hover:text-zinc-100">
                        Choose file
                      </span>
                    </Button>
                  </>
                )}
              </div>
            </label>

            {/* // Song Audio*/}
            <label className="block w-full">
              <h2 className="mb-2.5 text-[16px] font-medium">Audio File</h2>

              <input
                type="file"
                className="hidden"
                name="audio"
                disabled={isPending}
                ref={audioinputRef}
                onChange={handleAudioChange}
                accept="audio/*"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (e.dataTransfer.files[0]) {
                    setFiles((prev) => ({
                      ...prev,
                      audio: e.dataTransfer.files[0],
                    }))
                  }
                }}
              />

              <div className="flex h-auto cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900 p-3 transition-colors hover:bg-zinc-900/40">
                {files.audio && previewAudioUrl ? (
                  <audio controls className="w-full">
                    <source src={previewAudioUrl!} />
                  </audio>
                ) : (
                  <>
                    <h2 className="text-medium text-sm text-zinc-400">
                      Upload Song Audio
                    </h2>

                    <Button
                      variant={"secondary"}
                      type="button"
                      onClick={() => audioinputRef.current?.click()}
                      className="group inline-flex items-center gap-1.5"
                    >
                      <HeadphonesIcon className="size-4 text-zinc-300 transition-colors group-hover:text-zinc-100" />
                      <span className="text-sm text-zinc-300 transition-colors group-hover:text-zinc-100">
                        Choose file
                      </span>
                    </Button>
                  </>
                )}
              </div>
            </label>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  placeholder="Enter the song title"
                  value={newSong.title}
                  disabled={isPending}
                  onChange={(e) =>
                    setNewSong({ ...newSong, title: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="artist">Artist</FieldLabel>
                <Input
                  id="artist"
                  placeholder="Enter the song artist"
                  value={newSong.artist}
                  disabled={isPending}
                  onChange={(e) =>
                    setNewSong({ ...newSong, artist: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="duration">Duration</FieldLabel>
                <Input
                  id="duration"
                  placeholder="Enter the song duration"
                  value={formatDuration(newSong.duration)}
                  readOnly
                  disabled={!newSong.duration}
                  className="pointer-events-none cursor-not-allowed"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="album">
                  Album{" "}
                  <span className="text-xs text-zinc-400">(optional)</span>{" "}
                </FieldLabel>

                <Select
                  value={newSong.albumId || ""}
                  disabled={isPending}
                  onValueChange={(value) =>
                    setNewSong((prev) => ({ ...prev, albumId: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an album" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Albums</SelectLabel>

                      {albums?.map((album) => (
                        <SelectItem key={album._id} value={album._id}>
                          {album.title}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant={"outline"}
                type="button"
                disabled={isPending}
                size={isMobile ? "sm" : "lg"}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant={"default"}
              type="submit"
              disabled={isPending}
              onClick={handleSubmit}
              size={isMobile ? "sm" : "lg"}
            >
              Update Song
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default UpdateSongDialog
