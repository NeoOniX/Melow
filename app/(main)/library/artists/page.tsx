import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAllArtists } from "@/lib/actions/artist";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export async function generateMetadata() {
  return {
    title: "Artists",
    description: "Browse all artists in your library",
  };
}

export default async function ArtistsPage() {
  const res = await getAllArtists();
  const artists = res.success ? res.artists : [];

  return (
    <div className="p-4 pt-12 flex flex-col gap-4 h-full">
      <div className="flex flex-row gap-2 items-center">
        <h1 className="flex-1 text-2xl font-bold">Artists</h1>
        <Link href="/library/artists/create">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Plus size={24} />
          </Button>
        </Link>
      </div>
      <ScrollArea>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          }}
        >
          {artists?.map((artist) => (
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
        </div>
      </ScrollArea>
    </div>
  );
}
