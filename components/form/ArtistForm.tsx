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
import { Artist } from "@prisma/client";
import { createArtist, deleteArtist, updateArtist } from "@/lib/actions/artist";
import { useRouter } from "next/navigation";

const artistFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
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
});

export default function ArtistForm({
  onSuccess,
  onCancel,
  mode,
  artist,
  withCard = false,
}: {
  onSuccess?: (artist: Artist) => void;
  onCancel?: () => void;
  mode: "edit" | "create";
  artist?: Artist;
  withCard?: boolean;
}) {
  const form = useForm<z.infer<typeof artistFormSchema>>({
    resolver: zodResolver(artistFormSchema),
    defaultValues: {
      name: mode === "edit" && artist ? artist.name : "",
      image: undefined,
    },
  });

  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof artistFormSchema>) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.image) {
      formData.append("image", data.image);
    }

    if (mode === "create") {
      try {
        const res = await createArtist(formData);

        if (res.success && res.artist) {
          onSuccess?.(res.artist);
          router.push(`/library/artists/${res.artist.id}`);
        }
      } catch (error) {
        console.error("Erreur lors de la création :", error);
      }
    }

    if (mode === "edit" && artist) {
      try {
        const res = await updateArtist(artist.id, formData);

        if (res.success && res.artist) {
          onSuccess?.(res.artist);
          router.push(`/library/artists/${res.artist.id}`);
        }
      } catch (error) {
        console.error("Erreur lors de la modification :", error);
      }
    }
  };

  const onDeleteClick = async () => {
    if (artist && mode === "edit") {
      try {
        const res = await deleteArtist(artist.id);
        if (res.success) {
          router.push("/library/artists");
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
                <Input placeholder="Artist name..." {...field} required />
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
    <Card className="w-full max-w-md max-h-5/6 overflow-y-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create artist" : "Edit artist"}
        </CardTitle>
        <Separator className="mt-4" />
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
