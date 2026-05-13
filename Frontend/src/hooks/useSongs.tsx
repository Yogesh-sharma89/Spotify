import type { Song } from "@/interfaces/song"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

const production_url = import.meta.env.PRODUCTION_URL;

interface songsResponse {
  success: boolean
  songs: Song[]
  message: string
}

export const useGetSpecificSongs = (size: number, url: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ["songs", size, url],
    queryFn: async () => {
      const res = await axios.get(
        `${production_url}/api/songs/${url}`,
        {
          withCredentials: true,
          params: {
            size,
          },
        }
      )

      return res.data as songsResponse
    },
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 5,
  })

  return { songs: data?.songs, isLoading }
}
