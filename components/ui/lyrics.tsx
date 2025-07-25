"use client";

import { Lyrics as LyricsType } from "@/lib/actions/lyrics";
import { TrackWithAlbumAndArtist } from "@/lib/actions/track";
import React, { useEffect, useRef, useState } from "react";

type Line = { time: number; text: string };

function parseLRC(lrc: string): Line[] {
  return lrc
    .split("\n")
    .map((line) => {
      const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
      if (!match) return null;
      const minutes = parseInt(match[1]);
      const seconds = parseFloat(match[2]);
      const text = match[3].trim();
      return {
        time: minutes * 60 + seconds,
        text,
      };
    })
    .filter(Boolean) as Line[];
}

export default function Lyrics({
  track,
  currentTime,
}: {
  track: TrackWithAlbumAndArtist;
  currentTime: number;
}) {
  const [lyrics, setLyrics] = useState<LyricsType | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const activeLineRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (!track) return;

    const fetchLyrics = async () => {
      const { getLyrics } = await import("@/lib/actions/lyrics");
      const lyrics = await getLyrics(track.id);

      setLyrics(lyrics);
      if (lyrics.type === "lrc") {
        const parsedLines = parseLRC(lyrics.content);
        setLines(parsedLines);
      } else {
        setLines([]);
      }
    };

    fetchLyrics();
  }, [track]);

  const handleReloadLyrics = async () => {
    const { reloadLyrics } = await import("@/lib/actions/lyrics");
    const lyrics = await reloadLyrics(track.id);

    setLyrics(lyrics);
    if (lyrics.type === "lrc") {
      const parsedLines = parseLRC(lyrics.content);
      setLines(parsedLines);
    } else {
      setLines([]);
    }
  };

  useEffect(() => {
    if (lines.length === 0) return;

    const index = lines.findIndex((line) => line.time > currentTime);

    setCurrentIndex(index === -1 ? lines.length - 1 : index - 1);
  }, [currentTime, lines]);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentIndex]);

  // Text lyrics scroll
  const lyricsTextContainerRef = useRef<HTMLDivElement | null>(null);
  const lyricsTextContentRef = useRef<HTMLDivElement | null>(null);
  const [isCentered, setIsCentered] = useState(true);

  useEffect(() => {
    const container = lyricsTextContainerRef.current;
    const content = lyricsTextContentRef.current;

    if (!container || !content) return;

    const updateCentering = () => {
      setIsCentered(content.offsetHeight <= container.offsetHeight);
    };

    updateCentering();

    // Si le contenu change dynamiquement ou la fenêtre est redimensionnée
    window.addEventListener("resize", updateCentering);
    return () => window.removeEventListener("resize", updateCentering);
  }, [lyrics]);

  if (!lyrics) {
    return (
      <div className="text-center text-sm text-gray-500">Loading lyrics...</div>
    );
  }

  return (
    <>
      {lyrics?.type === "none" && (
        <div className="text-center space-y-1">
          <p className="text-sm text-gray-500">No lyrics available</p>
          <button
            onClick={handleReloadLyrics}
            className="ml-2 text-sm text-blue-500 hover:underline"
          >
            Reload Lyrics
          </button>
        </div>
      )}

      {lyrics?.type === "text" && (
        <div
          ref={lyricsTextContainerRef}
          className={`h-full w-full flex flex-col px-4 py-12 space-y-1 text-sm md:text-xl lg:text-2xl text-stone-200 overflow-y-auto ${
            isCentered ? "justify-center items-center" : "justify-start"
          }`}
        >
          <div ref={lyricsTextContentRef}>
            {lyrics.content.split("\n").map((line, index) => (
              <p key={index} className="text-center">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      {lyrics?.type === "lrc" && lines.length > 0 && (
        <div className="overflow-y-auto h-full py-[50%] sm:h-80 md:h-96 text-center text-sm md:text-xl lg:text-2xl px-4">
          <div className="flex flex-col gap-0.5 md:gap-2 lg:gap-3 leading-relaxed">
            {lines.map((line, index) => (
              <p
                key={index}
                ref={index === currentIndex ? activeLineRef : null}
                className={`transition-all ${
                  index === currentIndex
                    ? "text-[#fd7200] font-semibold text-xl md:text-3xl lg:text-7xl"
                    : "text-stone-500"
                }`}
              >
                {line.text}
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
