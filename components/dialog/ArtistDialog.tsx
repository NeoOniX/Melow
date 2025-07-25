"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { SquarePen } from "lucide-react";
import ArtistForm from "../form/ArtistForm";
import { Artist } from "@prisma/client";

export default function ArtistDialog({ artist }: { artist: Artist }) {
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
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <SquarePen size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Edit Artist</DialogTitle>
        <ArtistForm
          mode="edit"
          artist={artist}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
