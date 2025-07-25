import { PlaylistWithTracksAndUsers } from "@/lib/actions/playlist";
import Image from "next/image";
import React from "react";

export default function PlaylistCover({
  playlist,
  width,
  height,
  fill,
}: {
  playlist: PlaylistWithTracksAndUsers;
  width?: number;
  height?: number;
  fill?: boolean;
}) {
  const albums = Array.from(
    new Map(
      playlist.tracks
        .sort((a, b) => a.position - b.position)
        .map(
          (playlistTrack) =>
            [playlistTrack.track.album.id, playlistTrack.track.album] as const
        )
    ).values()
  );

  const albumCovers = albums.map(
    (album) =>
      `/uploads/albums/${album.id}.jpg?updated=${album.updatedAt.getTime()}`
  );

  if (albumCovers.length === 0) {
    // Cas 0 : pas d'albums -> fallback avec initiales de la playlist
    const initials = playlist.name.slice(0, 2).toUpperCase();

    return (
      <>
        {fill ? (
          <div
            className={`h-full w-full bg-stone-700 text-white flex items-center justify-center rounded-md`}
          >
            <span className="text-lg font-bold">{initials}</span>
          </div>
        ) : (
          <div
            className={`h-[${height}px] w-[${width}px] bg-stone-700 text-white flex items-center justify-center rounded-md`}
          >
            <span className="text-lg font-bold">{initials}</span>
          </div>
        )}
      </>
    );
  }

  if (albumCovers.length < 4) {
    // Cas 1 : moins de 4 albums -> couverture unique
    return (
      <>
        {fill ? (
          <div className={`h-full w-full relative rounded-md overflow-hidden`}>
            <Image
              src={albumCovers[0] || "/images/fallback-cover.jpg"}
              alt=""
              className={`h-full w-full object-cover rounded-md`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div
            className={`h-[${height}px] w-[${width}px] relative rounded-md overflow-hidden`}
          >
            <Image
              src={albumCovers[0] || "/images/fallback-cover.jpg"}
              alt=""
              className={`h-[${height}px] w-[${width}px] object-cover rounded-md`}
              width={width}
              height={height}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <div
      className={`h-${fill ? "full" : "[" + height + "px]"} w-${
        fill ? "full" : "[" + width + "px]"
      } grid grid-cols-2 grid-rows-2 rounded-md overflow-hidden`}
    >
      {albumCovers.map((url, index) => (
        <div key={index} className="relative w-full h-full overflow-hidden">
          {fill && (
            <Image
              src={url}
              alt=""
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          {width && height && (
            <Image
              src={url}
              alt=""
              className="object-cover"
              width={width / 2}
              height={height / 2}
            />
          )}
        </div>
      ))}
    </div>
  );
}
