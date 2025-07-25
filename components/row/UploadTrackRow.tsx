import { Check, ChevronsUpDown, Menu, X } from "lucide-react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Artist, Track } from "@prisma/client";
import { cn, formatDuration } from "@/lib/utils";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import Image from "next/image";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

export default function UploadTrackRow({
  index,
  track,
  artists,
  onDelete,
  onTitleChange,
  onArtistChange,
}: {
  index: number;
  track: Track;
  artists: Artist[];
  onDelete: () => void;
  onTitleChange: (title: string) => void;
  onArtistChange: (artistId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: track.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [artistOpen, setArtistOpen] = useState(false);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="flex items-center justify-between bg-stone-800 p-2 rounded text-white my-1 gap-2 group"
    >
      <div className="w-6 flex items-center justify-center">
        <div className="hidden group-hover:flex items-center justify-center text-stone-300">
          <Menu size={18} />
        </div>
        <div className="block group-hover:hidden text-center text-stone-400">
          {index + 1}
        </div>
      </div>
      <input
        type="text"
        value={track.title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="flex-1 bg-transparent text-white outline-none"
        placeholder="Titre de la piste"
      />
      <Popover open={artistOpen} onOpenChange={setArtistOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={artistOpen}
            className={cn(
              "w-[250px] justify-between",
              track.artistId ? "flex items-center justify-start gap-2" : ""
            )}
          >
            {track.artistId ? (
              <>
                <Image
                  height={24}
                  width={24}
                  src={`/uploads/artists/${
                    artists.find((artist) => artist.id === track.artistId)?.id
                  }.jpg?updated=${artists
                    .find((artist) => artist.id === track.artistId)
                    ?.updatedAt.getTime()}`}
                  alt={
                    artists.find((artist) => artist.id === track.artistId)
                      ?.name || "Artist"
                  }
                  className="object-contain rounded-sm"
                />
                <p className="flex-1 truncate text-start">
                  {artists.find((artist) => artist.id === track.artistId)?.name}
                </p>
              </>
            ) : (
              "Select artist..."
            )}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search artist..." className="h-9" />
            <CommandList>
              <CommandEmpty>No artist found.</CommandEmpty>
              <CommandGroup>
                {artists.map((artist) => (
                  <CommandItem asChild key={artist.id} value={artist.name}>
                    <button
                      className="flex items-center gap-2 w-full"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onArtistChange(artist.id);
                        setArtistOpen(false);
                      }}
                    >
                      <Image
                        height={24}
                        width={24}
                        src={`/uploads/artists/${
                          artist.id
                        }.jpg?updated=${artist.updatedAt.getTime()}`}
                        alt={artist.name}
                        className="object-contain rounded-sm"
                      />
                      {artist.name}
                      <Check
                        className={cn(
                          "ml-auto",
                          track.artistId === artist.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </button>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="text-sm text-stone-400">
        {formatDuration(track.duration)}
      </div>
      <button
        type="button"
        onClick={onDelete}
        title="Supprimer"
        className="text-stone-400 hover:text-red-400"
      >
        <X className="pointer-events-none" />
      </button>
    </div>
  );
}
