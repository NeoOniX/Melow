import AlbumForm from "@/components/form/AlbumForm";
import { getAllArtists, getArtistById } from "@/lib/actions/artist";
import React from "react";

export async function generateMetadata() {
  return {
    title: "Create Album",
    description: "Create a new album",
  };
}

export default async function AlbumCreationPage({
  searchParams,
}: {
  searchParams: Promise<{ artistId?: string }>;
}) {
  const { artistId } = await searchParams;
  const artist = artistId ? (await getArtistById(artistId)).artist : undefined;

  const artists = (await getAllArtists()).artists || [];

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 overflow-auto">
      <AlbumForm mode="create" artist={artist} artists={artists} withCard />
    </div>
  );
}
