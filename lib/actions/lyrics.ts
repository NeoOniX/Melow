"use server";

import path from "node:path";
import { existsSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import prisma from "../prisma";

export type LyricsType = "lrc" | "text" | "none";

export type Lyrics = {
  syncedLyrics?: string;
  plainLyrics?: string;
};

export async function reloadLyrics(trackId: string): Promise<Lyrics> {
  // Supprimer le fichier de paroles existant
  const filePath = path.join(process.cwd(), "uploads/lyrics", `${trackId}.lrc`);
  if (existsSync(filePath)) {
    await unlink(filePath);
  }

  // Récupérer les nouvelles paroles
  const lyrics = await getLyrics(trackId);
  return lyrics;
}

export async function getLyrics(trackId: string): Promise<Lyrics> {
  if (!trackId) return {};

  // Récupération des informations de la piste
  const track = await prisma.track.findUnique({
    where: { id: trackId },
    include: {
      artist: true,
      album: {
        include: {
          artist: true,
        },
      },
    },
  });

  if (!track) return {};

  // Créer le répertoire si nécessaire
  const uploadDir = path.join(process.cwd(), "uploads/lyrics");
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  // Chemin du fichier de paroles
  const filePath = path.join(uploadDir, `${track.id}.lrc`);

  // Si le fichier n'existe pas : cherche sur LRCLib
  if (!existsSync(filePath)) {
    console.log("Fetching lyrics (GET) from LRCLib for track:", track.title);

    const getRes = await fetch(
      `https://lrclib.net/api/get?artist_name=${encodeURIComponent(
        track.artist.name
      )}&track_name=${encodeURIComponent(
        track.title
      )}&album_name=${encodeURIComponent(track.album.title)}&duration=${
        track.duration
      }`,
      {
        headers: {
          "User-Agent": "Melow Music Player 0.1",
        },
      }
    );

    // La requête a réussi et des paroles ont été trouvées
    if (getRes.ok) {
      const data = await getRes.json();

      // Créer un objet Lyrics pour stocker les paroles
      const lyrics: Lyrics = {};

      // Si des paroles synchronisées (LRC) sont trouvées, ajouter à l'objet lyrics
      if (data.syncedLyrics) {
        lyrics.syncedLyrics = data.syncedLyrics;
      }

      // Si des paroles simples (texte) sont trouvées
      if (data.plainLyrics) {
        lyrics.plainLyrics = data.plainLyrics;
      }

      // Sauvegarde des paroles dans le fichier
      await writeFile(filePath, JSON.stringify(lyrics), {
        encoding: "utf-8",
        flag: "wx",
      });
      return lyrics;
    }

    // Refaire une requête en mode search, prendre le premier résultat
    console.log("Fetching lyrics (SEARCH) from LRCLib for track:", track.title);
    const searchRes = await fetch(
      `https://lrclib.net/api/search?artist_name=${encodeURIComponent(
        track.artist.name
      )}&q=${encodeURIComponent(track.title)}&album_name=${encodeURIComponent(
        track.album.title
      )}`,
      {
        headers: {
          "User-Agent": "Melow Music Player 0.1",
        },
      }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();

      if (searchData.length > 0) {
        // Chercher si un résultat a le bon nom d'artiste
        const matchingResults = searchData.filter(
          (result: { artistName: string }) =>
            result.artistName.toLowerCase() === track.artist.name.toLowerCase()
        );

        if (matchingResults.length > 0) {
          // Prendre le premier résultat
          const firstResult = matchingResults[0];

          // Créer un objet Lyrics pour stocker les paroles
          const lyrics: Lyrics = {};

          // Si des paroles synchronisées sont disponibles
          if (firstResult.syncedLyrics) {
            lyrics.syncedLyrics = firstResult.syncedLyrics;
          }

          // Si des paroles simples sont disponibles
          if (firstResult.plainLyrics) {
            lyrics.plainLyrics = firstResult.plainLyrics;
          }

          // Sauvegarde des paroles dans le fichier
          await writeFile(filePath, JSON.stringify(lyrics), {
            encoding: "utf-8",
            flag: "wx",
          });
          return lyrics;
        }
      }
    }

    // Si aucune parole n'est trouvée, retourner un type "none"
    const lyrics: Lyrics = {};
    await writeFile(filePath, JSON.stringify(lyrics), {
      encoding: "utf-8",
      flag: "wx",
    });
    return lyrics;
  } else {
    try {
      const lyrics = JSON.parse(await readFile(filePath, "utf-8"));
      return lyrics || null;
    } catch (error) {
      console.error("Erreur lors de la récupération des paroles :", error);
      return {};
    }
  }
}
