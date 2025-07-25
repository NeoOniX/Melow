"use client";

import { usePlayer } from "@/hooks/use-player";
import { AlbumWithTracksAndArtist } from "@/lib/actions/album";
import { PlaylistWithTracksAndUsers } from "@/lib/actions/playlist";
import { TrackWithAlbumAndArtist } from "@/lib/actions/track";

export default function PlayerClientButton({
  track,
  album,
  playlist,
  action,
  children,
  className,
}: {
  track?: TrackWithAlbumAndArtist;
  album?: AlbumWithTracksAndArtist;
  playlist?: PlaylistWithTracksAndUsers;
  action:
    | "play-track-individual"
    | "play-track-tracklist"
    | "play-album"
    | "play-playlist";
  children: React.ReactNode;
  className?: string;
}) {
  const { playTrack, player } = usePlayer();

  const handleClick = () => {
    console.log("Client button clicked");
    if (track && action === "play-track-individual") {
      playTrack(track, [track]);
    } else if (track && action === "play-track-tracklist") {
      playTrack(track, player?.trackList || [track]);
    } else if (album && action === "play-album") {
      playTrack(
        { ...album.tracks[0], album: album },
        album.tracks.map((t) => ({ ...t, album: album }))
      );
    } else if (playlist && action === "play-playlist") {
      playTrack(
        playlist.tracks[0].track,
        playlist.tracks.map((pt) => pt.track)
      );
    }
  };

  return (
    <button className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
