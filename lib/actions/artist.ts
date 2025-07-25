"use server";

import prisma from "@/lib/prisma";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import sharp from "sharp";
import { deleteAlbum } from "./album";

export async function getAllArtists() {
  try {
    const artists = await prisma.artist.findMany({
      orderBy: { name: "asc" },
    });

    return { success: true, artists };
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération des artistes :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}

export async function getArtistById(id: string) {
  try {
    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        albums: {
          orderBy: { title: "asc" },
        },
      },
    });

    if (!artist) {
      throw new Error("Artist not found");
    }

    return { success: true, artist };
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération de l'artiste :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}

export async function getArtistByName(name: string) {
  try {
    const artist = await prisma.artist.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (!artist) {
      throw new Error("Artist not found");
    }

    return { success: true, artist };
  } catch (error: unknown) {
    console.error(
      "Erreur lors de la récupération de l'artiste par nom :",
      error
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}

export async function createArtist(formData: FormData) {
  try {
    const name = formData.get("name")?.toString().trim();
    const image = formData.get("image") as File | null;

    if (!name) {
      throw new Error("Name is required");
    }

    if (!image) {
      throw new Error("File is required");
    }

    // Crée l'artiste dans la base
    const artist = await prisma.artist.create({
      data: { name },
    });

    try {
      // Convertit l’image en buffer
      const imageBuffer = Buffer.from(await image.arrayBuffer());

      // Redimensionne l'image en 512x512, carré, centrée, format JPEG
      const resizedImage = await sharp(imageBuffer)
        .resize(512, 512, { fit: "cover", position: "center" })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Crée le dossier s’il n'existe pas
      const uploadDir = path.join(process.cwd(), "public/uploads/artists");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Sauvegarde du fichier
      const filePath = path.join(uploadDir, artist.id + ".jpg");
      await writeFile(filePath, resizedImage, { flag: "wx" });

      return { success: true, artist };
    } catch (fileError) {
      // En cas d'erreur d'écriture : rollback
      await prisma.artist.delete({ where: { id: artist.id } });
      console.error("Erreur lors de l'écriture du fichier :", fileError);
      return { success: false, error: "Failed to save image" };
    }
  } catch (error: unknown) {
    console.error("Erreur lors de la création de l'artiste :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}

export async function updateArtist(id: string, formData: FormData) {
  try {
    const name = formData.get("name")?.toString().trim();
    const image = formData.get("image") as File | null;

    if (!name) {
      throw new Error("Name is required");
    }

    // Met à jour l'artiste dans la base
    const artist = await prisma.artist.update({
      where: { id },
      data: { name },
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
      const uploadDir = path.join(process.cwd(), "public/uploads/artists");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Sauvegarde du fichier
      const filePath = path.join(uploadDir, artist.id + ".jpg");
      await writeFile(filePath, resizedImage, { flag: "wx" });
    }

    return { success: true, artist };
  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour de l'artiste :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}

export async function deleteArtist(id: string) {
  try {
    // Supprime les albums associés
    const albums = await prisma.album.findMany({ where: { artistId: id } });
    const deletePromises = albums.map(
      async (album) => await deleteAlbum(album.id)
    );

    await Promise.all(deletePromises);

    // Supprime l'image de l'artiste
    const filePath = path.join(
      process.cwd(),
      "public/uploads/artists",
      id + ".jpg"
    );
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    // Supprime l'artiste de la base
    await prisma.artist.delete({ where: { id } });

    return { success: true };
  } catch (error: unknown) {
    console.error("Erreur lors de la suppression de l'artiste :", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message || "Unknown error"
          : "Unknown error",
    };
  }
}
