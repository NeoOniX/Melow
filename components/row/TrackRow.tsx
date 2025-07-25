"use client";

import { formatDuration } from "@/lib/utils";
import { Album, Artist } from "@prisma/client";
import {
  EllipsisVertical,
  ListEnd,
  ListMinus,
  ListPlus,
  ListVideo,
  Play,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PlayerClientButton from "../ui/client-button";
import { TrackWithAlbumAndArtist } from "@/lib/actions/track";
import { PlaylistWithTracksAndUsers } from "@/lib/actions/playlist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";
import TrackPlaylistDialog from "../dialog/TrackPlaylistDialog";
import { usePlayer } from "@/hooks/use-player";

export default function TrackRow({
  index,
  track,
  album,
  artist,
  playlist,
  action,
  displayArtist = false,
  displayAlbum = false,
  displayCover = false,
  isPlaying = false,
  removeFromPlaylist,
}: {
  index: number;
  track: TrackWithAlbumAndArtist;
  artist?: Artist;
  album?: Album;
  playlist?: PlaylistWithTracksAndUsers;
  action:
    | "play-track-individual"
    | "play-track-tracklist"
    | "play-album"
    | "play-playlist";
  displayArtist?: boolean;
  displayAlbum?: boolean;
  displayCover?: boolean;
  isPlaying?: boolean;
  removeFromPlaylist?: (trackId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const { addNext, addToEnd } = usePlayer();

  return (
    <>
      <div
        className="flex flex-row w-full items-center group @container"
        key={track.id}
      >
        <div className="w-10 h-full text-stone-700 dark:text-stone-300 relative flex justify-center items-center">
          {displayCover && album ? (
            <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden">
              <Image
                src={`/uploads/albums/${
                  album.id
                }.jpg?updated=${album.updatedAt.getTime()}`}
                alt={track.title}
                className="object-cover rounded"
                width={40}
                height={40}
              />
              <div
                className={
                  (isPlaying ? "flex" : "hidden group-hover:flex") +
                  " absolute inset-0 items-center justify-center"
                }
              >
                <div className="w-10 h-10 rounded bg-white dark:bg-black opacity-50"></div>
              </div>
              <PlayerClientButton
                action={action}
                track={track}
                className={
                  (isPlaying ? "flex" : "hidden group-hover:flex") +
                  " h-full absolute inset-0 items-center justify-center cursor-pointer"
                }
              >
                <Play
                  size={20}
                  className="fill-stone-800 dark:fill-white pointer-events-none"
                />
              </PlayerClientButton>
            </div>
          ) : (
            <>
              <span className="group-hover:hidden">{index + 1}</span>
              <PlayerClientButton
                action={action}
                track={track}
                className="hidden group-hover:flex h-full absolute inset-0 items-center justify-center cursor-pointer"
              >
                <Play
                  size={20}
                  className="fill-stone-800 dark:fill-white pointer-events-none"
                />
              </PlayerClientButton>
            </>
          )}
        </div>
        <div className="flex-1 flex flex-row @max-3xl:flex-col">
          <span className="px-2 text-lg flex-1 text-stone-800 dark:text-white">
            {track.title}
          </span>
          {(displayArtist || displayAlbum) && (
            <div className="px-2 text-lg flex-1 text-stone-600 dark:text-stone-300">
              {displayArtist && artist && (
                <Link
                  href={`/library/artists/${artist.id}`}
                  className="hover:underline"
                >
                  {artist.name}
                </Link>
              )}
              {displayArtist && displayAlbum && <span> - </span>}
              {displayAlbum && album && (
                <Link
                  href={`/library/albums/${album.id}`}
                  className="hover:underline"
                >
                  {album.title}
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="relative w-12 h-full flex justify-end items-center">
          <p className="text-stone-600 dark:text-stone-300 group-hover:hidden">
            {formatDuration(track.duration)}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="hidden group-hover:flex h-full items-center justify-end cursor-pointer">
                <EllipsisVertical
                  size={20}
                  className="fill-stone-800 dark:fill-white pointer-events-none"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={12}>
              <DropdownMenuItem asChild>
                <button
                  className="w-full flex items-center justify-start gap-2"
                  role="button"
                  onClick={() => setOpen(true)}
                >
                  <ListPlus color="#969696" size={24} />
                  Add to Playlist
                </button>
              </DropdownMenuItem>
              {playlist && (
                <DropdownMenuItem asChild>
                  <button
                    className="w-full flex items-center justify-start gap-2"
                    role="button"
                    onClick={() => removeFromPlaylist?.(track.id)}
                  >
                    <ListMinus color="#969696" size={24} />
                    Remove from Playlist
                  </button>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <button
                  className="w-full flex items-center justify-start gap-2"
                  role="button"
                  onClick={() => addNext(track)}
                >
                  <ListVideo color="#969696" size={24} />
                  Play next
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  className="w-full flex items-center justify-start gap-2"
                  role="button"
                  onClick={() => addToEnd(track)}
                >
                  <ListEnd color="#969696" size={24} />
                  Add to Queue
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <TrackPlaylistDialog track={track} open={open} setOpen={setOpen} />
    </>
  );
}
