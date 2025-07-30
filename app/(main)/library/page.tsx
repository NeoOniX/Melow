import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAllAlbums } from "@/lib/actions/album";
import { getAllArtists } from "@/lib/actions/artist";
import { Ellipsis, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export async function generateMetadata() {
  return {
    title: "Library",
    description: "Browse your music library",
  };
}

export default async function LibraryPage() {
  const artistsRes = await getAllArtists();
  const artists = artistsRes.artists;

  const albumsRes = await getAllAlbums();
  const albums = albumsRes.albums;

  return (
    <div className="p-4 pt-12 flex flex-col gap-4 h-full overflow-y-auto">
      <div className="flex flex-row gap-2 items-center">
        <div className="flex-1 flex justify-start">
          <Link href={"/library/albums"}>
            <h1 className="text-3xl font-bold text-stone-800 dark:text-white">
              Albums
            </h1>
          </Link>
        </div>
        <Link href="/library/albums/create">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Plus size={24} />
          </Button>
        </Link>
      </div>
      <div className="flex flex-row gap-4">
        <div
          // ref={containerRef}
          className="flex-1 grid gap-4"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))`,
          }}
        >
          {albums?.slice(0, 8).map((album) => (
            <Link key={album.id} href={`/library/albums/${album.id}`}>
              <Card className="p-4 pb-2 h-full">
                <CardContent className="p-0 flex flex-col items-center gap-2">
                  <Image
                    height={132}
                    width={132}
                    src={`/uploads/albums/${
                      album.id
                    }.jpg?updated=${album.updatedAt.getTime()}`}
                    alt={album.title}
                    className="object-contain rounded-md"
                  />
                  <h2 className="text-lg font-bold text-center">
                    {album.title}
                  </h2>
                </CardContent>
              </Card>
            </Link>
          ))}
          {albums && albums.length > 8 && (
            <Link href={"/library/albums"}>
              <Card className="p-4 pb-2 h-full">
                <CardContent className="p-0 h-full flex flex-col items-center justify-center">
                  <Ellipsis size={32} color="white" />
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <div className="flex-1 flex justify-start">
          <Link href={"/library/artists"}>
            <h1 className="text-3xl font-bold text-stone-800 dark:text-white">
              Artists
            </h1>
          </Link>
        </div>
        <Link href="/library/artists/create">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Plus size={24} />
          </Button>
        </Link>
      </div>
      <div className="flex flex-row gap-4">
        <div
          className="flex-1 grid  gap-4"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))`,
          }}
        >
          {artists?.slice(0, 8).map((artist) => (
            <Link key={artist.id} href={`/library/artists/${artist.id}`}>
              <Card className="p-4 pb-2">
                <CardContent className="p-0 flex flex-col items-center gap-2">
                  <Image
                    height={132}
                    width={132}
                    src={`/uploads/artists/${
                      artist.id
                    }.jpg?updated=${artist.updatedAt.getTime()}`}
                    alt={artist.name}
                    className="object-contain rounded-md"
                  />
                  <h2 className="text-lg font-bold text-center">
                    {artist.name}
                  </h2>
                </CardContent>
              </Card>
            </Link>
          ))}
          {artists && artists.length > 8 && (
            <Link href={"/library/artists"}>
              <Card className="p-4 pb-2 h-full">
                <CardContent className="p-0 h-full flex flex-col items-center justify-center">
                  <Ellipsis size={32} color="white" />
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
