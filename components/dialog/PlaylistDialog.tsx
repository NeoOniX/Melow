"use client";

import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus, SquarePen, Users, X } from "lucide-react";
import { Playlist } from "@prisma/client";
import PlaylistForm from "../form/PlaylistForm";
import { PlaylistWithTracksAndUsers } from "@/lib/actions/playlist";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function PlaylistDialog({
  playlist,
  disabled,
}: {
  playlist: Playlist;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const onSuccess = () => {
    setOpen(false);
  };

  const onCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={disabled}>
        <button
          disabled={disabled}
          className="p-2 rounded-full bg-stone-50 dark:bg-stone-800 disabled:bg-stone-300 disabled:dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center justify-center cursor-pointer disabled:cursor-default"
        >
          <SquarePen className="stroke-stone-800 dark:stroke-white" size={18} />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Edit Playlist</DialogTitle>
        <PlaylistForm
          mode="edit"
          playlist={playlist}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
}

export function PlaylistAccessDialog({
  playlist,
}: {
  playlist: PlaylistWithTracksAndUsers;
}) {
  const [users, setUsers] = useState(playlist.users);
  const [newUser, setNewUser] = useState("");

  const handleAddUserToPlaylist = useCallback(async () => {
    const username = newUser.trim();

    if (!playlist || !username) return;

    const { addUserToPlaylist } = await import("@/lib/actions/playlist");

    const result = await addUserToPlaylist(playlist.id, username);

    if (result.success) {
      setNewUser("");
      setUsers(result.playlist.users);
    } else {
      console.error("Failed to add user to playlist:", result.error);
    }
  }, [newUser, playlist]);

  const handleRemoveUserFromPlaylist = useCallback(
    async (userId: string) => {
      if (!playlist || !userId) return;

      const { removeUserFromPlaylist } = await import("@/lib/actions/playlist");

      const result = await removeUserFromPlaylist(playlist.id, userId);

      if (result.success) {
        setUsers(result.playlist.users);
      } else {
        console.error("Failed to remove user from playlist");
      }
    },
    [playlist]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="p-2 rounded-full bg-stone-50 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center justify-center cursor-pointer">
          <Users className="stroke-stone-800 dark:stroke-white" size={18} />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Playlist Access</DialogTitle>
        <div className="flex flex-col gap-0">
          <div className="flex flex-row gap-2">
            <Input
              placeholder="Username..."
              onChange={(e) => {
                setNewUser(e.target.value);
              }}
            />
            <Button
              variant="outline"
              className="mb-4"
              onClick={handleAddUserToPlaylist}
            >
              <Plus />
              Add User
            </Button>
          </div>

          <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
            Users with access:
          </p>
          <div className="flex flex-col gap-2">
            {users.map((user) => (
              <Card key={user.id} className="px-4 py-2">
                <CardContent className="flex items-center justify-start gap-1 p-0">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={`/uploads/users/${user.id}.jpg`}
                      alt={user.name}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1">{user.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer group"
                    onClick={() => handleRemoveUserFromPlaylist(user.id)}
                  >
                    <X size={18} className="group-hover:stroke-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
