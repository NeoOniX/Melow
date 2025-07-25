import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TrackRow from "./TrackRow";
import { TrackWithAlbumAndArtist } from "@/lib/actions/track";
import { Album, Artist } from "@prisma/client";
import { PlaylistWithTracksAndUsers } from "@/lib/actions/playlist";

export default function ReorderableTrackRow({
  index,
  track,
  album,
  artist,
  playlist,
  action,
  displayArtist = false,
  displayAlbum = false,
  displayCover = false,
  isPlaying = false,
  removeTrackFromPlaylist,
}: {
  index: number;
  track: TrackWithAlbumAndArtist;
  album?: Album;
  artist?: Artist;
  playlist?: PlaylistWithTracksAndUsers;
  action:
    | "play-track-individual"
    | "play-track-tracklist"
    | "play-album"
    | "play-playlist";
  displayArtist?: boolean;
  displayAlbum?: boolean;
  displayCover?: boolean;
  isPlaying?: boolean;
  removeTrackFromPlaylist?: (trackId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: track.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="flex w-full"
    >
      <TrackRow
        index={index}
        track={track}
        action={action}
        artist={artist}
        album={album}
        playlist={playlist}
        displayArtist={displayArtist}
        displayAlbum={displayAlbum}
        displayCover={displayCover}
        isPlaying={isPlaying}
        removeFromPlaylist={removeTrackFromPlaylist}
      />
    </div>
  );
}
