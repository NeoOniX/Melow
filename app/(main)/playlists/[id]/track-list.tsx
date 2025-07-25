"use client";

import { CustomPointerSensor } from "@/components/dnd/CustomPointerSensor";
import ReorderableTrackRow from "@/components/row/ReorderableTrackRow";
import {
  PlaylistWithTracksAndUsers,
  removeTrackFromPlaylist,
} from "@/lib/actions/playlist";
import { TrackWithAlbumAndArtist } from "@/lib/actions/track";
import {
  Active,
  closestCenter,
  DndContext,
  Over,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { useEffect, useState } from "react";

export default function TrackList({
  playlist,
}: {
  playlist: PlaylistWithTracksAndUsers;
}) {
  const [tracks, setTracks] = useState<TrackWithAlbumAndArtist[]>([]);

  // Methods
  const handleUpdate = (updatedPlaylist: PlaylistWithTracksAndUsers) => {
    setTracks(
      updatedPlaylist.tracks
        .sort((a, b) => a.position - b.position)
        .map((pt) => pt.track)
    );
  };

  useEffect(() => {
    if (playlist) {
      const sortedTracks = playlist.tracks
        .sort((a, b) => a.position - b.position)
        .map((pt) => pt.track);
      setTracks(sortedTracks);
    }
  }, [playlist]);

  const handleRemoveTrack = async (trackId: string) => {
    if (!playlist) return;

    const updatedPlaylistRes = await removeTrackFromPlaylist(
      playlist.id,
      trackId
    );

    if (updatedPlaylistRes.success && updatedPlaylistRes.playlist) {
      handleUpdate(updatedPlaylistRes.playlist);
    } else {
      console.error("Failed to remove track from playlist");
    }
  };

  const handleReorder = async ({
    active,
    over,
  }: {
    active: Active;
    over: Over | null;
  }) => {
    if (active.id !== over?.id) {
      const oldIndex = tracks.findIndex((t) => t.id === active.id);
      const newIndex = tracks.findIndex((t) => t.id === over?.id);

      const newTracks = arrayMove(tracks, oldIndex, newIndex);

      const { reorderTracksInPlaylist } = await import(
        "@/lib/actions/playlist"
      );

      const result = await reorderTracksInPlaylist(
        playlist.id,
        newTracks.map((t) => t.id)
      );

      if (result.success) {
        setTracks(newTracks);
      } else {
        console.error("Failed to reorder tracks in playlist");
      }
    }
  };

  const sensors = useSensors(useSensor(CustomPointerSensor));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleReorder}
    >
      <SortableContext
        items={tracks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tracks.map((track, index) => (
          <ReorderableTrackRow
            action="play-track-individual"
            key={track.id}
            index={index}
            displayAlbum
            displayArtist
            displayCover
            track={track}
            album={track.album}
            artist={track.artist}
            playlist={playlist}
            removeTrackFromPlaylist={handleRemoveTrack}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
