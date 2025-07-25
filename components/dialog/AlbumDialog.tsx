"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { SquarePen } from "lucide-react";
import AlbumForm from "../form/AlbumForm";
import { AlbumWithTracks } from "@/lib/actions/album";
import { Artist } from "@prisma/client";

export default function AlbumDialog({
  album,
  artists,
}: {
  album: AlbumWithTracks;
  artists: Artist[];
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
      <DialogTrigger asChild>
        <button className="p-2 rounded-full bg-stone-50 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center justify-center cursor-pointer">
          <SquarePen className="stroke-stone-800 dark:stroke-white" size={18} />
        </button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-3/5 max-h-5/6 overflow-y-auto">
        <DialogTitle>Edit Album</DialogTitle>
        <AlbumForm
          mode="edit"
          album={album}
          artists={artists}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
