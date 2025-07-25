"use server";

import path from "node:path";
import { existsSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import prisma from "../prisma";

export type Lyrics = {
  type: "lrc" | "text" | "none";
  content: string;
};

export async function reloadLyrics(trackId: string): Promise<Lyrics> {
  // Supprimer le fichier de paroles existant
  const filePath = path.join(
    process.cwd(),
    "public/uploads/lyrics",
    `${trackId}.lrc`
  );
  if (existsSync(filePath)) {
    await unlink(filePath);
  }

  // Récupérer les nouvelles paroles
  const lyrics = await getLyrics(trackId);
  return lyrics;
}

export async function getLyrics(trackId: string): Promise<Lyrics> {
  if (!trackId) return { type: "none", content: "" };

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

  if (!track) return { type: "none", content: "" };

  // Créer le répertoire si nécessaire, retourne null si le répertoire n'existe pas
  const uploadDir = path.join(process.cwd(), "public/uploads/lyrics");
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
    return { type: "none", content: "" };
  }

  // Chemin du fichier de paroles
  const filePath = path.join(uploadDir, `${track.id}.lrc`);

  // Si le fichier n'existe pas : cherche sur LRCLib
  if (!existsSync(filePath)) {
    console.log("Fecthing lyrics from LRCLib for track:", track.title);

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

      if (data.syncedLyrics) {
        // Si des paroles synchronisées (LRC) sont trouvées
        const lyrics: Lyrics = {
          type: "lrc",
          content: data.syncedLyrics,
        };

        // Sauvegarde des paroles dans le fichier
        await writeFile(filePath, JSON.stringify(lyrics), {
          encoding: "utf-8",
          flag: "wx",
        });
        return lyrics;
      } else if (data.plainLyrics) {
        // Si des paroles simples (texte) sont trouvées
        const lyrics: Lyrics = {
          type: "text",
          content: data.plainLyrics,
        };

        // Sauvegarde des paroles dans le fichier
        await writeFile(filePath, JSON.stringify(lyrics), {
          encoding: "utf-8",
          flag: "wx",
        });
        return lyrics;
      }
    }

    // Refaire une requête en mode search, prendre le premier résultat
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

          if (firstResult.syncedLyrics) {
            // Si des paroles synchronisées sont disponibles
            const lyrics: Lyrics = {
              type: "lrc",
              content: firstResult.syncedLyrics,
            };

            await writeFile(filePath, JSON.stringify(lyrics), {
              encoding: "utf-8",
              flag: "wx",
            });
            return lyrics;
          } else if (firstResult.plainLyrics) {
            // Si des paroles simples sont disponibles
            const lyrics: Lyrics = {
              type: "text",
              content: firstResult.plainLyrics,
            };

            await writeFile(filePath, JSON.stringify(lyrics), {
              encoding: "utf-8",
              flag: "wx",
            });
            return lyrics;
          }
        }
      }
    }

    // Si aucune parole n'est trouvée, retourner un type "none"
    const lyrics: Lyrics = { type: "none", content: "" };
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
      return { type: "none", content: "" };
    }
  }
}
