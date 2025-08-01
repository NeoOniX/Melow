"use client";

import { Lyrics } from "@/lib/actions/lyrics";
import { TrackWithAlbumAndArtist } from "@/lib/actions/track";
import React, { useEffect, useRef, useState } from "react";
import { BookOpenText, MicVocal, Pencil, RefreshCw } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import LyricsEditDialog from "../dialog/LyricsEditDialog";

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

export default function LyricsWindows({
  track,
  currentTime,
}: {
  track: TrackWithAlbumAndArtist;
  currentTime: number;
}) {
  const [lyrics, setLyrics] = useState<Lyrics | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const activeLineRef = useRef<HTMLParagraphElement | null>(null);

  const { lyricsMode, setLyricsMode, lyricsOffset, setLyricsOffset } =
    usePlayer();

  useEffect(() => {
    if (!track) return;

    const fetchLyrics = async () => {
      const { getLyrics } = await import("@/lib/actions/lyrics");
      const lyrics = await getLyrics(track.id);

      setLyrics(lyrics);
    };

    fetchLyrics();
  }, [track]);

  const handleReloadLyrics = async () => {
    const { reloadLyrics } = await import("@/lib/actions/lyrics");
    const lyrics = await reloadLyrics(track.id);

    setLyrics(lyrics);
  };

  // Display lyrics based on mode
  const showSynced = lyricsMode === "lrc" && lyrics?.syncedLyrics !== undefined;
  const showText =
    (lyricsMode === "lrc" && !showSynced && lyrics?.plainLyrics) ||
    (lyricsMode === "text" && lyrics?.plainLyrics);

  useEffect(() => {
    if (showSynced && lyrics?.syncedLyrics) {
      const parsedLines = parseLRC(lyrics.syncedLyrics);
      setLines(parsedLines);
    } else {
      setLines([]);
    }
  }, [lyrics, showSynced]);

  // Scroll to active line in LRC mode
  useEffect(() => {
    if (lines.length === 0) return;

    const index = lines.findIndex(
      (line) => line.time > currentTime + lyricsOffset
    );

    setCurrentIndex(index === -1 ? lines.length - 1 : index - 1);
  }, [currentTime, lines, lyricsOffset]);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentIndex]);

  // Text lyrics centered or scrollable depending on content height in text mode
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

  // Update lyrics modal
  const handleLyricsUpdated = async (updatedLyrics: Lyrics) => {
    const { updateLyrics } = await import("@/lib/actions/lyrics");
    const lyrics = await updateLyrics(track.id, updatedLyrics);

    setLyrics(lyrics);
    setEditModalOpen(false);
  };

  if (!lyrics) {
    return (
      <div className="text-center text-sm text-gray-500">Loading lyrics...</div>
    );
  }

  return (
    <>
      <LyricsEditDialog
        open={editModalOpen}
        setOpen={setEditModalOpen}
        lyrics={lyrics}
        onLyricsUpdated={handleLyricsUpdated}
      />
      <div className="fixed top-4 right-4 z-20 flex flex-row-reverse gap-2 group @container">
        <div className="flex flex-col items-center border p-0 m-0 rounded">
          <button
            className={
              "w-6 md:w-10 h-6 md:h-10 flex items-center justify-center p-0.5 z-10 hover:bg-[#fd7200] cursor-pointer rounded-none rounded-tl rounded-tr" +
              (lyricsMode === "lrc" ? " bg-[#fd7200]" : "")
            }
            onClick={() => setLyricsMode("lrc")}
          >
            <MicVocal className="h-4 md:h-5 w-4 md:w-5" />
          </button>
          <button
            className={
              "w-6 md:w-10 h-6 md:h-10 flex items-center justify-center p-0.5 z-10 hover:bg-[#fd7200] cursor-pointer rounded-none" +
              (lyricsMode === "text" ? " bg-[#fd7200]" : "")
            }
            onClick={() => setLyricsMode("text")}
          >
            <BookOpenText className="h-4 md:h-5 w-4 md:w-5" />
          </button>
          <button
            className="w-6 md:w-10 h-6 md:h-10 flex items-center justify-center p-0.5 z-10 hover:bg-[#fd7200] cursor-pointer rounded-none rounded-bl rounded-br"
            onClick={() => setEditModalOpen(true)}
          >
            <Pencil className="h-4 md:h-5 w-4 md:w-5" />
          </button>
          <button
            className="w-6 md:w-10 h-6 md:h-10 flex items-center justify-center p-0.5 z-10 hover:bg-[#fd7200] cursor-pointer rounded-none rounded-bl rounded-br"
            onClick={handleReloadLyrics}
          >
            <RefreshCw className="h-4 md:h-5 w-4 md:w-5" />
          </button>
        </div>
        {lyricsMode === "lrc" && (
          <div className="flex flex-col h-min p-2 rounded items-center justify-start gap-2 group-hover:border opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-sm text-stone-500">
              Offset : {lyricsOffset}s
            </span>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.01}
              value={lyricsOffset}
              onChange={(e) => {
                setLyricsOffset(e.target.valueAsNumber);
              }}
              className="w-36 h-1 bg-stone-800 rounded-md cursor-pointer appearance-none
            accent-[#fd7200] 
            [&::-webkit-slider-thumb]:appearance-none
            [&::-moz-range-thumb]:appearance-none
            hover:[&::-webkit-slider-thumb]:appearance-auto
            hover:[&::-moz-range-thumb]:appearance-auto
            hover:[&::-webkit-slider-thumb]:w-3
            hover:[&::-webkit-slider-thumb]:h-3
            hover:[&::-webkit-slider-thumb]:rounded-full
            hover:[&::-webkit-slider-thumb]:shadow
            hover:[&::-moz-range-thumb]:w-3
            hover:[&::-moz-range-thumb]:h-3
            hover:[&::-moz-range-thumb]:rounded-full
            hover:[&::-moz-range-thumb]:shadow"
              style={{
                background: (() => {
                  const percent = ((lyricsOffset + 5) / 10) * 100; // 0% à 100%
                  const center = 50;
                  const orange = "#fd7200";
                  const gray = "#27272a";

                  if (lyricsOffset === 0) {
                    return `linear-gradient(to right, ${gray} 0%, ${gray} 50%, ${gray} 100%)`;
                  }

                  if (lyricsOffset > 0) {
                    return `linear-gradient(to right,
                      ${gray} 0%,
                      ${gray} ${center}%,
                      ${orange} ${center}%,
                      ${orange} ${percent}%,
                      ${gray} ${percent}%,
                      ${gray} 100%
                    )`;
                  } else {
                    return `linear-gradient(to right,
                      ${gray} 0%,
                      ${gray} ${percent}%,
                      ${orange} ${percent}%,
                      ${orange} ${center}%,
                      ${gray} ${center}%,
                      ${gray} 100%
                    )`;
                  }
                })(),
                transition: "background 0.2s ease",
              }}
            />
          </div>
        )}
      </div>
      {showSynced && lines.length > 0 ? (
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
      ) : showText && lyrics?.plainLyrics ? (
        <div
          ref={lyricsTextContainerRef}
          className={`h-full w-full overflow-y-auto px-4 py-12 space-y-1 text-sm md:text-xl lg:text-2xl text-stone-200`}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: isCentered ? "center" : "flex-start",
            alignItems: isCentered ? "center" : "stretch",
          }}
        >
          <div ref={lyricsTextContentRef} className="flex flex-col">
            {lyrics.plainLyrics.split("\n").map((line, index) => (
              <p key={index} className="text-center">
                {line}
              </p>
            ))}
          </div>
        </div>
      ) : (
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
    </>
  );
}
