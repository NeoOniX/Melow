"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Playlist, Track } from "@prisma/client";
import { useSession } from "next-auth/react";

export default function TrackPlaylistDialog({
  track,
  open,
  setOpen,
}: {
  track: Track;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user.id) return;
    if (!open) return;

    const fetchPlaylists = async () => {
      const { getPlaylists } = await import("@/lib/actions/playlist");
      const playlistsData = await getPlaylists(session.user.id);
      setPlaylists(playlistsData);
    };

    fetchPlaylists();
  }, [session?.user.id, open]);

  const addToPlaylist = async (playlistId: string) => {
    const { addTrackToPlaylist } = await import("@/lib/actions/playlist");

    const result = await addTrackToPlaylist(playlistId, track.id);

    if (result.success) {
      setOpen(false);
    } else {
      console.error("Failed to add track to playlist:", result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Add to playlist</DialogTitle>
        {playlists.map((playlist) => (
          <Button
            key={playlist.id}
            variant="outline"
            className="w-full mb-2"
            onClick={() => addToPlaylist(playlist.id)}
          >
            {playlist.name}
          </Button>
        ))}
      </DialogContent>
    </Dialog>
  );
}
