"use client";

import { parseBlob } from "music-metadata";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import { Artist, Track } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import { useEffect, useState } from "react";
import { CustomPointerSensor } from "../dnd/CustomPointerSensor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import UploadTrackRow from "../row/UploadTrackRow";
import {
  AlbumWithTracks,
  createAlbum,
  deleteAlbum,
  updateAlbum,
} from "@/lib/actions/album";

const albumFormSchema = z.object({
  artist: z.any(),
  title: z.string().min(1, "Title is required"),
  image: z
    .instanceof(File)
    .refine(
      (file) =>
        [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/webp",
          "image/svg+xml",
          "image/gif",
        ].includes(file.type),
      { message: "Invalid image file type" }
    )
    .optional(),
  tracks: z.any().optional(),
  // tracks: z.instanceof(FileList).refine((files) => files.length > 0, {
  //   message: "At least one track is required",
  // }),
});

type TrackWithFile = Track & {
  file?: File;
};

export default function AlbumForm({
  onSuccess,
  onCancel,
  mode,
  album,
  artist,
  artists,
  withCard = false,
}: {
  onSuccess?: (album: AlbumWithTracks) => void;
  onCancel?: () => void;
  mode: "edit" | "create";
  album?: AlbumWithTracks;
  artist?: Artist;
  artists: Artist[];
  withCard?: boolean;
}) {
  const form = useForm<z.infer<typeof albumFormSchema>>({
    resolver: zodResolver(albumFormSchema),
    defaultValues: {
      title: mode === "edit" && album ? album.title : "",
      image: undefined,
    },
  });

  const [tracks, setTracks] = useState<TrackWithFile[]>([]);
  const sensors = useSensors(useSensor(CustomPointerSensor));

  // Artist combobox

  const [artistOpen, setArtistOpen] = useState(false);
  const [artistValue, setArtistValue] = useState<string | undefined>(
    artist?.id || undefined
  );

  // On mount effect

  useEffect(() => {
    if (mode === "edit" && album) {
      const sortedTracks = album.tracks
        .slice()
        .sort((a, b) => a.position - b.position);
      setTracks(sortedTracks);
    }
  }, [album, mode]);

  // Form methods

  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof albumFormSchema>) => {
    const formData = new FormData();

    formData.append("title", data.title);

    if (data.image) {
      formData.append("image", data.image);
    }

    if (mode === "create") {
      try {
        const res = await createAlbum(formData, artistValue || "", tracks);

        if (res.success && res.album) {
          onSuccess?.(res.album);
          router.push(`/library/albums/${res.album.id}`);
        }
      } catch (error) {
        console.error("Erreur lors de la création :", error);
      }
    }

    if (mode === "edit" && album) {
      try {
        const res = await updateAlbum(album.id, formData, tracks);

        if (res.success && res.album) {
          onSuccess?.(res.album);
          router.push(`/library/albums/${res.album.id}`);
        }
      } catch (error) {
        console.error("Erreur lors de la création :", error);
      }
    }
  };

  const onDeleteClick = async () => {
    if (album && mode === "edit") {
      try {
        const res = await deleteAlbum(album.id);

        if (res.success) {
          router.push("/library/albums");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
      }
    }
  };

  const onCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  // Tracks

  const handleTrackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { getArtistByName } = await import("@/lib/actions/artist");

    const files = Array.from(e.target.files || []);
    const newTracks: TrackWithFile[] = [];

    for (const file of files) {
      try {
        const metadata = await parseBlob(file);
        const title =
          metadata.common.title || file.name.replace(/\.[^/.]+$/, "");

        let newArtist = artistValue;

        const artistMetadata = metadata.common.artist;
        if (artistMetadata) {
          const artistRes = await getArtistByName(artistMetadata);
          if (artistRes.success && artistRes.artist) {
            newArtist = artistRes.artist.id;
          } else {
            console.warn("Artist not found, using selected artist");
          }
        }

        newTracks.push({
          id: crypto.randomUUID(),
          title,
          artistId: newArtist || "",
          position: tracks.length + newTracks.length + 1,
          albumId: album?.id || "",
          duration: metadata.format.duration || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          file: file,
        });
      } catch (error) {
        console.warn("Erreur lecture métadonnées:", error);
      }
    }

    setTracks((prev) => [...prev, ...newTracks]);
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {mode === "create" && (
          <FormField
            control={form.control}
            name="artist"
            render={({}) => (
              <FormItem>
                <FormLabel>Artist</FormLabel>
                <FormControl>
                  <Popover open={artistOpen} onOpenChange={setArtistOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={artistOpen}
                        className="w-[400px] justify-between"
                      >
                        {artistValue ? (
                          <div className="flex items-center gap-2">
                            <Image
                              height={24}
                              width={24}
                              src={`/uploads/artists/${
                                artists.find(
                                  (artist) => artist.id === artistValue
                                )?.id
                              }.jpg?updated=${artists
                                .find((artist) => artist.id === artistValue)
                                ?.updatedAt.getTime()}`}
                              alt={
                                artists.find(
                                  (artist) => artist.id === artistValue
                                )?.name || "Artist"
                              }
                              className="object-contain rounded-sm"
                            />
                            {
                              artists.find(
                                (artist) => artist.id === artistValue
                              )?.name
                            }
                          </div>
                        ) : (
                          "Select artist..."
                        )}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search artist..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No artist found.</CommandEmpty>
                          <CommandGroup>
                            {artists.map((artist) => (
                              <CommandItem
                                key={artist.id}
                                value={artist.name}
                                onSelect={() => {
                                  setArtistValue(
                                    artist.id === artistValue ? "" : artist.id
                                  );
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
                                    artistValue === artist.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Album title..."
                  {...field}
                  required={mode === "create"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Input
                  required={mode === "create"}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    field.onChange(file);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tracks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tracks</FormLabel>
              <FormControl>
                <Input
                  required={mode === "create"}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    field.onChange(e.target.files);
                    handleTrackUpload(e);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  multiple
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {tracks.length > 0 && (
          <div className="flex flex-col w-full gap-1">
            <h3 className="text-white text-lg">Tracks</h3>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={({ active, over }) => {
                if (active.id !== over?.id) {
                  setTracks((prev) => {
                    const oldIndex = prev.findIndex((t) => t.id === active.id);
                    const newIndex = prev.findIndex((t) => t.id === over?.id);
                    return arrayMove(prev, oldIndex, newIndex);
                  });
                }
              }}
            >
              <SortableContext
                items={tracks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {tracks.map((track, index) => (
                  <UploadTrackRow
                    key={track.id}
                    index={index}
                    track={track}
                    artists={artists}
                    onDelete={() =>
                      setTracks((prev) => prev.filter((t) => t.id !== track.id))
                    }
                    onTitleChange={(newTitle) => {
                      setTracks((prev) =>
                        prev.map((t) =>
                          t.id === track.id ? { ...t, title: newTitle } : t
                        )
                      );
                    }}
                    onArtistChange={(newArtist) => {
                      console.log("Changing artist to:", newArtist);
                      setTracks((prev) =>
                        prev.map((t) =>
                          t.id === track.id ? { ...t, artistId: newArtist } : t
                        )
                      );
                    }}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
        <div className="flex flex-row gap-2 items-center">
          <Button type="submit" className="flex-1">
            Submit
          </Button>
          <Button
            type="button"
            className="flex-1"
            variant="secondary"
            onClick={onCancelClick}
          >
            Cancel
          </Button>
          {mode === "edit" && (
            <Button
              type="button"
              className="flex-1"
              variant="destructive"
              onClick={onDeleteClick}
            >
              Delete
            </Button>
          )}
        </div>
      </form>
    </Form>
  );

  if (!withCard) {
    return formContent;
  }

  return (
    <Card className="w-full max-w-3/5 max-h-5/6 overflow-y-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create album" : "Edit album"}
        </CardTitle>
        <Separator className="mt-4" />
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
