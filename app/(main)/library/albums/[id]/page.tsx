import AlbumDialog from "@/components/dialog/AlbumDialog";
import TrackRow from "@/components/row/TrackRow";
import PlayerClientButton from "@/components/ui/client-button";
import { getAlbumById } from "@/lib/actions/album";
import { getAllArtists } from "@/lib/actions/artist";
import { ListPlus, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const albumRes = await getAlbumById(id);
  const album = albumRes.album;

  return {
    title: album ? album.title : "Album",
    description: album ? `Album: ${album.title}` : "Album page",
    openGraph: {
      title: album ? album.title : "Album",
      description: album ? `Album: ${album.title}` : "Album page",
      images: [
        {
          url: `/uploads/albums/${id}.jpg`,
          width: 512,
          height: 512,
        },
      ],
    },
  };
}

export default async function AlbumDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const albumRes = await getAlbumById(id);
  const album = albumRes.album;

  const artistsRes = await getAllArtists();
  const artists = artistsRes.artists || [];

  return (
    <>
      {album && (
        <>
          {/* Small display */}
          <div className="lg:hidden relative z-10 flex p-4 flex-col gap-2 h-full items-center overflow-y-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              {album.title}
            </h1>
            <Image
              src={`/uploads/albums/${
                album.id
              }.jpg?updated=${album.updatedAt.getTime()}`}
              alt={album.title}
              className="aspect-square object-contain rounded-md"
              width={96}
              height={96}
            />
            {album.artist && (
              <div className="flex flex-row items-center gap-2">
                <Image
                  src={`/uploads/artists/${
                    album.artist.id
                  }.jpg?updated=${album.artist.updatedAt.getTime()}`}
                  alt={album.artist.name}
                  className="object-contain rounded-md"
                  width={32}
                  height={32}
                />
                <Link href={`/library/artists/${album.artist.id}`}>
                  <h3 className="text-sm text-stone-400 hover:underline">
                    {album.artist.name}
                  </h3>
                </Link>
              </div>
            )}
            <div className="flex flex-row items-center justify-center gap-2">
              <button className="p-2 rounded-full bg-stone-50 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center justify-center cursor-pointer">
                <ListPlus
                  className="stroke-stone-800 dark:stroke-white"
                  size={18}
                />
              </button>
              <PlayerClientButton
                action="play-album"
                album={album}
                className="p-3 rounded-full bg-stone-50 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center justify-center cursor-pointer"
              >
                <Play
                  className="stroke-stone-800 dark:stroke-white"
                  size={24}
                />
              </PlayerClientButton>
              <AlbumDialog album={album} artists={artists} />
            </div>
            <div className="flex-1 w-full flex flex-col gap-2">
              {[...album.tracks]
                .sort((a, b) => a.position - b.position)
                .map((track, index) => (
                  <TrackRow
                    index={index}
                    track={{ ...track, album }}
                    displayArtist
                    artist={track.artist}
                    key={track.id}
                    action="play-track-individual"
                  />
                ))}
            </div>
          </div>

          {/* Large display */}
          <div className="hidden lg:flex relative z-10 flex-row gap-4 h-full w-full">
            <div className="flex flex-col items-center gap-4 sticky top-0 p-8 pt-12 max-w-80 xl:max-w-96">
              {album.artist && (
                <Link
                  href={`/library/artists/${album.artist.id}`}
                  className="flex flex-row items-center gap-2 group"
                >
                  <Image
                    src={`/uploads/artists/${
                      album.artist.id
                    }.jpg?updated=${album.artist.updatedAt.getTime()}`}
                    alt={album.artist.name}
                    className="object-contain rounded-md"
                    width={32}
                    height={32}
                  />
                  <h3 className="text-sm text-stone-600 dark:text-stone-400 group-hover:underline">
                    {album.artist.name}
                  </h3>
                </Link>
              )}
              <h1 className="text-3xl font-bold text-stone-800 dark:text-white text-center">
                {album.title}
              </h1>
              <Image
                src={`/uploads/albums/${
                  album.id
                }.jpg?updated=${album.updatedAt.getTime()}`}
                alt={album.title}
                className="aspect-square object-contain rounded-md"
                width={192}
                height={192}
              />
              <div className="flex flex-row items-center justify-center gap-2">
                <button className="p-2 rounded-full bg-stone-50 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center justify-center cursor-pointer">
                  <ListPlus
                    className="stroke-stone-800 dark:stroke-white"
                    size={18}
                  />
                </button>
                <PlayerClientButton
                  action="play-album"
                  album={album}
                  className="p-3 rounded-full bg-stone-50 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Play
                    className="stroke-stone-800 dark:stroke-white"
                    size={24}
                  />
                </PlayerClientButton>
                <AlbumDialog album={album} artists={artists} />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto px-6 pt-12 pb-20">
              {[...album.tracks]
                .sort((a, b) => a.position - b.position)
                .map((track, index) => (
                  <TrackRow
                    index={index}
                    track={{ ...track, album }}
                    displayArtist
                    artist={track.artist}
                    key={track.id}
                    action="play-track-individual"
                  />
                ))}
            </div>
          </div>

          {/* Background image */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <Image
              src={`/uploads/albums/${
                album.id
              }.jpg?updated=${album.updatedAt.getTime()}`}
              alt={album.title}
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
