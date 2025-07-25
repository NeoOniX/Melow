"use server";

import { Prisma } from "@prisma/client";
import prisma from "../prisma";

export type TrackWithAlbumAndArtist = Prisma.TrackGetPayload<{
  include: {
    artist: true;
    album: {
      include: {
        artist: true;
      };
    };
  };
}>;

export async function getTrackById(id: string): Promise<{
  success: boolean;
  track?: TrackWithAlbumAndArtist;
  error?: string;
}> {
  try {
    // Fetch the track from the database using Prisma
    const track = await prisma.track.findUnique({
      where: { id },
      include: {
        artist: true,
        album: {
          include: {
            artist: true,
          },
        },
      },
    });

    if (!track) {
      throw new Error(`Track with id ${id} not found`);
    }

    return { success: true, track };
  } catch (error) {
    console.error("Erreur lors de la récupération de la piste :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}
