import { UserDialog } from "@/components/dialog/UserDialog";
import { Card, CardContent } from "@/components/ui/card";
import PlaylistCover from "@/components/ui/playlist-cover";
import { UserImage, UserName } from "@/components/ui/user-details";
import { getPlaylists } from "@/lib/actions/playlist";
import { auth } from "@/lib/auth";
import Link from "next/link";
import React from "react";

export async function generateMetadata() {
  return {
    title: "My Profile",
    description: "User profile page",
  };
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) return <></>;

  const playlists = await getPlaylists(session.user.id);
  const ownedPlaylists = playlists.filter(
    (playlist) => playlist.ownerId === session.user.id
  );

  return (
    <>
      <div className="relative flex flex-col pt-12 z-20">
        <div className="flex flex-col items-center gap-4">
          <UserImage
            className="rounded-md object-contain"
            width={96}
            height={96}
          />

          <div className="flex flex-row items-center gap-4">
            <UserName className="text-3xl font-bold text-stone-800 dark:text-white" />
            <UserDialog mode="edit-user" user={session.user} />
          </div>

          {/* Small Display */}
          <div className="flex lg:hidden w-full flex-col items-center gap-2 overflow-y-auto">
            <p className="mt-8 text-lg text-stone-800 dark:text-white">
              {ownedPlaylists.length} playlists owned :
            </p>
            <div className="flex flex-col items-center w-full gap-2">
              {ownedPlaylists.map((playlist) => (
                <Link
                  href={`/playlists/${playlist.id}`}
                  key={playlist.id}
                  className="w-4/5"
                >
                  <Card className="px-4 py-2 w-full">
                    <CardContent className="flex items-center justify-start gap-1 p-0">
                      <div className="relative h-8 w-8">
                        <PlaylistCover
                          playlist={playlist}
                          width={32}
                          height={32}
                        />
                      </div>
                      <span className="flex-1">{playlist.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <p className="mt-8 text-lg text-stone-800 dark:text-white">
              {playlists.length} playlists accessible :
            </p>
            <div className="flex flex-col items-center w-full gap-2">
              {playlists.map((playlist) => (
                <Link
                  href={`/playlists/${playlist.id}`}
                  key={playlist.id}
                  className="w-4/5"
                >
                  <Card className="px-4 py-2 w-full">
                    <CardContent className="flex items-center justify-start gap-1 p-0">
                      <div className="relative h-8 w-8">
                        <PlaylistCover
                          playlist={playlist}
                          width={32}
                          height={32}
                        />
                      </div>
                      <span className="flex-1">{playlist.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Large Display */}
          <div className="hidden lg:flex w-full flex-row gap-2 overflow-y-auto">
            <div className="flex-1 flex flex-col items-center gap-2">
              <p className="mt-8 text-lg text-stone-800 dark:text-white">
                {ownedPlaylists.length} playlists owned :
              </p>
              {ownedPlaylists.map((playlist) => (
                <Link
                  href={`/playlists/${playlist.id}`}
                  key={playlist.id}
                  className="w-1/2"
                >
                  <Card className="px-4 py-2 w-full">
                    <CardContent className="flex items-center justify-start gap-1 p-0">
                      <div className="relative h-8 w-8">
                        <PlaylistCover
                          playlist={playlist}
                          width={32}
                          height={32}
                        />
                      </div>
                      <span className="flex-1">{playlist.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="flex-1 flex flex-col items-center gap-2">
              <p className="mt-8 text-lg text-stone-800 dark:text-white">
                {playlists.length} playlists accessible :
              </p>
              {playlists.map((playlist) => (
                <Link
                  href={`/playlists/${playlist.id}`}
                  key={playlist.id}
                  className="w-1/2"
                >
                  <Card className="px-4 py-2 w-full">
                    <CardContent className="flex items-center justify-start gap-1 p-0">
                      <div className="relative h-8 w-8">
                        <PlaylistCover
                          playlist={playlist}
                          width={32}
                          height={32}
                        />
                      </div>
                      <span className="flex-1">{playlist.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background image */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <UserImage
          className="w-full h-full object-cover scale-110 blur-2xl opacity-40"
          fill
        />
      </div>
    </>
  );
}
