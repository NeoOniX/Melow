"use server";

import prisma from "@/lib/prisma";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { Prisma, Track } from "@prisma/client";
import sharp from "sharp";

type TrackWithFile = Track & {
  file?: File;
};

export type AlbumWithTracks = Prisma.AlbumGetPayload<{
  include: {
    tracks: true;
  };
}>;

export type AlbumWithTracksAndArtist = Prisma.AlbumGetPayload<{
  include: {
    artist: true;
    tracks: {
      include: {
        artist: true;
      };
      orderBy: { position: "asc" };
    };
  };
}>;

export async function getAllAlbums() {
  try {
    const albums = await prisma.album.findMany({
      orderBy: { title: "asc" },
      include: {
        artist: true,
        tracks: {
          include: {
            artist: true,
          },
          orderBy: { position: "asc" },
        },
      },
    });

    return { success: true, albums };
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération des albums :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}

export async function getAlbumById(id: string) {
  try {
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        tracks: {
          include: {
            artist: true,
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!album) {
      throw new Error("Artist not found");
    }

    return { success: true, album };
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération de l'album :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}

export async function getAlbumByArtistId(artistId: string, withTracks = false) {
  try {
    const albums = await prisma.album.findMany({
      where: { artistId },
      orderBy: { title: "asc" },
      include: {
        tracks: withTracks
          ? {
              orderBy: { position: "asc" },
            }
          : false,
      },
    });

    return { success: true, albums };
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération des albums :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}

export async function createAlbum(
  formData: FormData,
  artistId: string,
  tracks: TrackWithFile[]
) {
  try {
    const title = formData.get("title")?.toString().trim();
    const image = formData.get("image") as File | null;

    if (!title) {
      throw new Error("Title is required");
    }

    if (!image) {
      throw new Error("Cover image is required");
    }

    if (!tracks || tracks.length === 0) {
      throw new Error("At least one track is required");
    }

    // Créer l'album dans la base

    const album = await prisma.album.create({
      data: {
        title,
        artistId,
      },
    });

    // Convertit l’image en buffer
    const imageBuffer = Buffer.from(await image.arrayBuffer());

    // Redimensionne l'image en 512x512, carré, centrée, format JPEG
    const resizedImage = await sharp(imageBuffer)
      .resize(512, 512, { fit: "cover", position: "center" })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Crée le dossier s’il n'existe pas
    const uploadDir = path.join(process.cwd(), "/uploads/albums");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Sauvegarde du fichier
    const filePath = path.join(uploadDir, album.id + ".jpg");
    await writeFile(filePath, resizedImage);

    // Crée les pistes de l'album dans la base

    const trackPromises = tracks.map(async (track, index) => {
      if (!track.file) {
        throw new Error(`Track ${index + 1} file is required`);
      }

      const dbTrack = await prisma.track.create({
        data: {
          title: track.title,
          duration: track.duration,
          artistId: track.artistId,
          position: index + 1,
          albumId: album.id,
        },
      });

      const trackPath = path.join(process.cwd(), "uploads/tracks", dbTrack.id);
      if (!existsSync(path.dirname(trackPath))) {
        await mkdir(path.dirname(trackPath), { recursive: true });
      }
      await writeFile(trackPath, Buffer.from(await track.file.arrayBuffer()));

      return;
    });

    await Promise.all(trackPromises);

    // Renvoie l'album créé avec les pistes et l'artiste

    const createdAlbum = await prisma.album.findUnique({
      where: { id: album.id },
      include: {
        artist: true,
        tracks: {
          orderBy: { position: "asc" },
        },
      },
    });

    return { success: true, album: createdAlbum };
  } catch (error: unknown) {
    console.error("Erreur lors de la création de l'album :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}

export async function updateAlbum(
  albumId: string,
  formData: FormData,
  tracks: TrackWithFile[]
) {
  try {
    const title = formData.get("title")?.toString().trim();
    const image = formData.get("image") as File | null;

    if (!title) {
      throw new Error("Title is required");
    }

    const album = await prisma.album.update({
      where: { id: albumId },
      data: {
        title,
      },
      include: {
        tracks: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (image) {
      // Convertit l’image en buffer
      const imageBuffer = Buffer.from(await image.arrayBuffer());

      // Redimensionne l'image en 512x512, carré, centrée, format JPEG
      const resizedImage = await sharp(imageBuffer)
        .resize(512, 512, { fit: "cover", position: "center" })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Crée le dossier s’il n'existe pas
      const uploadDir = path.join(process.cwd(), "uploads/albums");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Sauvegarde du fichier
      const filePath = path.join(uploadDir, album.id + ".jpg");
      await writeFile(filePath, resizedImage);
    }

    const afterEditTracks = [] as Track[];

    const trackPromises = tracks.map(async (track, index) => {
      // Vérifie si la piste existe déjà
      const existingTrack = await prisma.track.findUnique({
        where: { id: track.id },
      });

      if (existingTrack) {
        // Met à jour la piste existante
        const dbTrack = await prisma.track.update({
          where: { id: existingTrack.id },
          data: {
            title: track.title,
            duration: track.duration,
            position: index + 1,
            artistId: track.artistId,
          },
        });

        afterEditTracks.push(dbTrack);
      } else {
        // Crée une nouvelle piste
        if (!track.file) {
          throw new Error(`Track ${index + 1} file is required`);
        }

        const dbTrack = await prisma.track.create({
          data: {
            title: track.title,
            duration: track.duration,
            position: index + 1,
            artistId: track.artistId,
            albumId: album.id,
          },
        });

        const trackPath = path.join(
          process.cwd(),
          "uploads/tracks",
          dbTrack.id
        );
        if (!existsSync(path.dirname(trackPath))) {
          await mkdir(path.dirname(trackPath), { recursive: true });
        }
        await writeFile(trackPath, Buffer.from(await track.file.arrayBuffer()));

        afterEditTracks.push(dbTrack);
      }

      return;
    });

    await Promise.all(trackPromises);

    // Enlève les pistes qui ne sont plus présentes

    await prisma.track.deleteMany({
      where: {
        albumId: album.id,
        id: {
          notIn: afterEditTracks.map((t) => t.id),
        },
      },
    });

    const updatedAlbum = await prisma.album.findUnique({
      where: { id: album.id },
      include: {
        artist: true,
        tracks: {
          orderBy: { position: "asc" },
        },
      },
    });

    return { success: true, album: updatedAlbum };
  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour de l'album :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}

export async function deleteAlbum(id: string) {
  try {
    // Supprime les pistes de l'album
    const tracks = await prisma.track.findMany({
      where: { albumId: id },
    });

    const trackPromises = tracks.map(async (track) => {
      const trackPath = path.join(process.cwd(), "uploads/tracks", track.id);
      if (existsSync(trackPath)) {
        await unlink(trackPath);
      }
      return prisma.track.delete({ where: { id: track.id } });
    });

    await Promise.all(trackPromises);

    // Supprime l'image de l'album
    const filePath = path.join(process.cwd(), "uploads/albums", id + ".jpg");
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    // Supprime l'album de la base de données
    await prisma.album.delete({ where: { id } });

    return { success: true };
  } catch (error: unknown) {
    console.error("Erreur lors de la suppression de l'album :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}
