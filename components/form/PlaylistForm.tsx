"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Playlist } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  createPlaylist,
  deletePlaylist,
  PlaylistWithTracksAndUsers,
  updatePlaylist,
} from "@/lib/actions/playlist";
import { useSession } from "next-auth/react";

const artistFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default function PlaylistForm({
  onSuccess,
  onCancel,
  mode,
  playlist,
  withCard = false,
}: {
  onSuccess?: (playlist: PlaylistWithTracksAndUsers) => void;
  onCancel?: () => void;
  mode: "edit" | "create";
  playlist?: Playlist;
  withCard?: boolean;
}) {
  const form = useForm<z.infer<typeof artistFormSchema>>({
    resolver: zodResolver(artistFormSchema),
    defaultValues: {
      name: mode === "edit" && playlist ? playlist.name : "",
    },
  });

  const { data: session } = useSession();

  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof artistFormSchema>) => {
    if (!session?.user.id) {
      throw new Error("User not authenticated");
    }

    const formData = new FormData();
    formData.append("name", data.name);

    if (mode === "create") {
      try {
        const res = await createPlaylist(session.user.id, formData);

        if (res.success && res.playlist) {
          onSuccess?.(res.playlist);
          router.push(`/playlists/${res.playlist.id}`);
        }
      } catch (error) {
        console.error("Erreur lors de la création :", error);
      }
    }

    if (mode === "edit" && playlist) {
      try {
        const res = await updatePlaylist(playlist.id, formData);

        if (res.success && res.playlist) {
          onSuccess?.(res.playlist);
          router.push(`/playlists/${res.playlist.id}`);
        }
      } catch (error) {
        console.error("Erreur lors de la modification :", error);
      }
    }
  };

  const onDeleteClick = async () => {
    if (playlist && mode === "edit") {
      try {
        const res = await deletePlaylist(playlist.id);
        if (res.success) {
          router.push("/playlists");
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

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Playlist name..." {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
    <Card className="w-full max-w-md overflow-y-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create playlist" : "Edit playlist"}
        </CardTitle>
        <Separator className="mt-4" />
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
