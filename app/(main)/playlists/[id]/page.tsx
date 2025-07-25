import PlaylistCover from "@/components/ui/playlist-cover";
import { getPlaylistById } from "@/lib/actions/playlist";
import { Play } from "lucide-react";
import Image from "next/image";
import React from "react";
import TrackList from "./track-list";
import PlayerClientButton from "@/components/ui/client-button";
import {
  PlaylistAccessDialog,
  PlaylistDialog,
} from "@/components/dialog/PlaylistDialog";
import { auth } from "@/lib/auth";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playlist = await getPlaylistById(id);

  return {
    title: playlist ? playlist.name : "Playlist",
    description: playlist ? `Playlist: ${playlist.name}` : "Playlist page",
    openGraph: {
      title: playlist ? playlist.name : "Playlist",
      description: playlist ? `Playlist: ${playlist.name}` : "Playlist page",
      images: [
        {
          url: `/uploads/playlists/${id}.jpg`,
          width: 512,
          height: 512,
        },
      ],
    },
  };
}

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playlist = await getPlaylistById(id);
  const session = await auth();

  return (
    <>
      {playlist && session && (
        <>
          {/* Background image */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="w-full h-full scale-110 blur-2xl opacity-40">
              <PlaylistCover playlist={playlist} fill />
            </div>
          </div>

          {/* Small display */}
          <div className="lg:hidden relative z-10 flex p-4 flex-col gap-2 h-full items-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              {playlist.name}
            </h1>
            <div className="w-24 h-24 flex items-center justify-center">
              <PlaylistCover playlist={playlist} width={96} height={96} />
            </div>
            {playlist.owner && (
              <div className="flex flex-row items-center gap-2">
                <Image
                  src={`/uploads/users/${
                    playlist.owner.id
                  }.jpg?updated=${playlist.owner.updatedAt.getTime()}`}
                  alt={playlist.owner.name}
                  className="w-8 h-8 object-contain rounded-md"
                  width={32}
                  height={32}
                />
                <h3 className="text-sm text-stone-600 dark:text-stone-400 hover:underline">
                  {playlist.owner.name}
                </h3>
              </div>
            )}
            <div className="flex flex-row items-center justify-center gap-2">
              <PlaylistAccessDialog playlist={playlist} />
              <PlayerClientButton
                action="play-playlist"
                playlist={playlist}
                className="p-3 rounded-full bg-stone-50 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center justify-center cursor-pointer"
              >
                <Play
                  className="stroke-stone-800 dark:stroke-white"
                  size={24}
                />
              </PlayerClientButton>
              <PlaylistDialog
                playlist={playlist}
                disabled={session.user.id !== playlist.owner?.id}
              />
            </div>
            <div className="flex-1 w-full flex flex-col gap-2 overflow-y-scroll">
              <TrackList playlist={playlist} />
            </div>
          </div>

          {/* Large display */}
          <div className="hidden lg:flex relative z-10 flex-row gap-4 h-full w-full">
            <div className="flex-1 flex flex-col items-center gap-4 sticky top-0 p-8 pt-12 max-w-80 xl:max-w-96">
              {playlist.owner && (
                <Link
                  href={`/profile/${playlist.owner.id}`}
                  className="flex flex-row items-center gap-2 group"
                >
                  <Image
                    src={`/uploads/users/${
                      playlist.owner.id
                    }.jpg?updated=${playlist.owner.updatedAt.getTime()}`}
                    alt={playlist.owner.name}
                    className="w-8 h-8 object-contain rounded-md"
                    width={32}
                    height={32}
                  />
                  <h3 className="text-sm text-stone-600 dark:text-stone-400 group-hover:underline">
                    {playlist.owner.name}
                  </h3>
                </Link>
              )}
              <h1 className="text-3xl font-bold text-stone-800 dark:text-white text-center">
                {playlist.name}
              </h1>
              <div className="relative h-48 w-48 flex items-center justify-center">
                <PlaylistCover playlist={playlist} width={192} height={192} />
              </div>
              <div className="flex flex-row items-center justify-center gap-2">
                <PlaylistAccessDialog playlist={playlist} />
                <PlayerClientButton
                  action="play-playlist"
                  playlist={playlist}
                  className="p-3 rounded-full bg-stone-50 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Play
                    className="stroke-stone-800 dark:stroke-white"
                    size={24}
                  />
                </PlayerClientButton>
                <PlaylistDialog
                  playlist={playlist}
                  disabled={session.user.id !== playlist.owner?.id}
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4 overflow-y-scroll px-6 pt-12 pb-20">
              <TrackList playlist={playlist} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
