import ArtistDialog from "@/components/dialog/ArtistDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getArtistById } from "@/lib/actions/artist";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artistRes = await getArtistById(id);
  const artist = artistRes.artist;

  return {
    title: artist ? artist.name : "Artist",
    description: artist ? `Artist: ${artist.name}` : "Artist page",
    openGraph: {
      title: artist ? artist.name : "Artist",
      description: artist ? `Artist: ${artist.name}` : "Artist page",
      images: [
        {
          url: `/uploads/artists/${id}.jpg`,
          width: 512,
          height: 512,
        },
      ],
    },
  };
}

export default async function ArtistDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artistRes = await getArtistById(id);
  const artist = artistRes.artist;

  return (
    <>
      {artistRes.success && artist && (
        <>
          <div className="relative z-10 flex p-4 flex-col gap-4 h-full items-center">
            <div className="flex flex-row items-center gap-4">
              <h1 className="text-3xl font-bold">{artist.name}</h1>
              <ArtistDialog artist={artist} />
            </div>
            <Image
              src={`/uploads/artists/${
                artist.id
              }.jpg?updated=${artist.updatedAt.getTime()}`}
              alt={artist.name}
              className="h-48 aspect-square object-contain rounded-md"
              width={192}
              height={192}
            />
            <div className="flex w-full flex-row gap-2 items-center mt-8">
              <h1 className="text-3xl font-bold w-full text-left">Albums</h1>

              <Link href={`/library/albums/create?artistId=${artist.id}`}>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <Plus size={24} />
                </Button>
              </Link>
            </div>
            <div
              className="w-full grid gap-2"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              }}
            >
              {artist.albums.map((album) => (
                <Link key={album.id} href={`/library/albums/${album.id}`}>
                  <Card className="p-4 pb-2">
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
            </div>
          </div>

          {/* Background image */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <Image
              src={`/uploads/artists/${
                artist.id
              }.jpg?updated=${artist.updatedAt.getTime()}`}
              alt={artist.name}
              className="w-full h-full object-cover scale-110 blur-2xl opacity-40"
              fill
              sizes="100vw"
            />
          </div>
        </>
      )}
    </>
  );
}
