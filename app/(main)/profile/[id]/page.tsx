import { getPlaylists } from "@/lib/actions/playlist";
import { getUserById } from "@/lib/actions/user";
import Image from "next/image";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userRes = await getUserById(id);
  const user = userRes.user;

  return {
    title: user ? user.name : "Profile",
    description: user ? `Profile of ${user.name}` : "User profile page",
    openGraph: {
      title: user ? user.name : "Profile",
      description: user ? `Profile of ${user.name}` : "User profile page",
      images: [
        {
          url: `/uploads/users/${id}.jpg`,
          width: 512,
          height: 512,
        },
      ],
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userRes = await getUserById(id);
  const user = userRes.user;

  if (!user) return <></>;

  const playlists = await getPlaylists(user.id);
  const ownedPlaylists = playlists.filter(
    (playlist) => playlist.ownerId === user.id
  );

  return (
    <>
      <div className="relative flex flex-col pt-12 z-20">
        <div className="flex flex-col items-center gap-4">
          <Image
            src={`/uploads/users/${user.id}.jpg`}
            alt={user.name}
            className="rounded-md object-contain"
            width={96}
            height={96}
          />

          <div className="flex flex-row items-center gap-4">
            <div className="text-3xl font-bold text-stone-800 dark:text-white">
              {user.name}
            </div>
          </div>

          {/* Small Display */}
          <div className="flex lg:hidden w-full flex-col items-center gap-2 overflow-y-auto">
            <p className="mt-8 text-lg text-stone-800 dark:text-white">
              {ownedPlaylists.length} playlists owned
            </p>
            <p className="mt-8 text-lg text-stone-800 dark:text-white">
              {playlists.length} playlists accessible
            </p>
          </div>

          {/* Large Display */}
          <div className="hidden lg:flex w-full flex-row gap-2 overflow-y-auto">
            <div className="flex-1 flex flex-col items-center gap-2">
              <p className="mt-8 text-lg text-stone-800 dark:text-white">
                {ownedPlaylists.length} playlists owned
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center gap-2">
              <p className="mt-8 text-lg text-stone-800 dark:text-white">
                {playlists.length} playlists accessible
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background image */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src={`/uploads/users/${user.id}.jpg`}
          alt={user.name}
          className="w-full h-full object-cover scale-110 blur-2xl opacity-40"
          fill
          sizes="100vw"
        />
      </div>
    </>
  );
}
