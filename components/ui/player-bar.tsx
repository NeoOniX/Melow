"use client";

import {
  Disc3,
  ListMusic,
  MicVocal,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useAnimation,
} from "motion/react";
import {
  closestCenter,
  DndContext,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Image from "next/image";
import { usePlayer } from "@/hooks/use-player";
import useThrottle from "@/hooks/useThrottle";
import { CustomPointerSensor } from "../dnd/CustomPointerSensor";
import { formatDuration } from "@/lib/utils";
import Link from "next/link";
import { TrackWithAlbumAndArtist } from "@/lib/actions/track";
import ReorderableTrackRow from "../row/ReorderableTrackRow";
import Lyrics from "./lyrics";

export default function PlayerBar() {
  const {
    view,
    setView,
    player,
    pause,
    resume,
    next,
    previous,
    toggleRepeat,
    toggleShuffle,
    currentTrack,
    currentTime,
    currentVolume,
    setVolume,
    seek,
  } = usePlayer();

  // Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case "l":
            e.preventDefault();
            if (view !== "lyrics") {
              setView("lyrics");
            } else {
              setView("minimized");
            }
            break;
          case "p":
            e.preventDefault();
            if (view !== "tracklist") {
              setView("tracklist");
            } else {
              setView("minimized");
            }
            break;
          case "i":
            e.preventDefault();
            if (view !== "immersive") {
              setView("immersive");
            } else {
              setView("minimized");
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view, setView]);

  // Animation
  const vinylRotate = useMotionValue(0);
  const vinylControls = useAnimation();

  useEffect(() => {
    if (view === "immersive" && player?.state === "playing") {
      vinylControls.start({
        rotate: [0, 360],
        transition: {
          duration: 6,
          repeat: Infinity,
          ease: "linear",
        },
      });
    } else {
      vinylControls.stop();
    }
  }, [player?.state, view, vinylControls]);

  const vinylArmRotate = useMotionValue(2);
  const vinylArmControls = useAnimation();

  useEffect(() => {
    if (player?.state === "playing") {
      const startAngle = 8;
      const endAngle = 28;

      const duration = currentTrack?.duration || 1;
      const progress = currentTime / duration;

      const currentAngle = startAngle + (endAngle - startAngle) * progress;

      vinylArmControls.start({
        rotate: currentAngle,
        transition: {
          type: "tween",
          duration: 0.5,
          ease: "easeOut",
        },
      });
    } else {
      vinylArmControls.start({
        rotate: 2,
        transition: {
          type: "tween",
          duration: 0.5,
          ease: "easeOut",
        },
      });
    }
  }, [player, currentTime, currentTrack, vinylArmControls]);

  // Methods

  const handleViewChange = (
    newView: "minimized" | "immersive" | "tracklist" | "lyrics"
  ) => {
    if (view === newView) {
      setView("minimized");
    } else {
      setView(newView);
    }
  };

  const handlePlayPause = () => {
    if (player) {
      if (player.state === "playing") {
        pause();
      } else if (player.state === "paused") {
        resume();
      }
    }
  };

  // Seeking

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(currentTime);

  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(currentTime);
    }
  }, [currentTime, isSeeking]);

  // Throttle seek updates during drag
  const throttledSeek = useThrottle((value: number) => {
    if (player && currentTrack && value <= currentTrack.duration) {
      seek(value);
    }
  }, 150); // 150ms = ~6fps

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSeekValue(value);
    throttledSeek(value);
  };

  const handleSeekStart = () => setIsSeeking(true);
  const handleSeekEnd = () => {
    if (player && currentTrack && seekValue <= currentTrack.duration) {
      seek(seekValue); // Final update
    }
    setIsSeeking(false);
  };

  // Tracklist

  const sensors = useSensors(useSensor(CustomPointerSensor));

  const [tracklist, setTracklist] = useState<TrackWithAlbumAndArtist[]>([]);

  useEffect(() => {
    if (player) {
      setTracklist(player.trackList);
    }
  }, [player]);

  useEffect(() => {
    // Set player tracklist to the current tracklist
    if (player) {
      player.trackList = tracklist;
    }
  }, [tracklist, player]);

  return (
    <>
      {/* Tracklist view */}
      <AnimatePresence>
        {view === "tracklist" && (
          <motion.div
            className="fixed top-0 bottom-16 left-0 right-0 bg-stone-50 dark:bg-stone-950 z-40 flex items-center justify-center border-t-2 border-stone-200 dark:border-stone-800"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.4 }}
          >
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <Image
                src={`/uploads/albums/${
                  currentTrack?.album.id
                }.jpg?updated=${currentTrack?.album.updatedAt.getTime()}`}
                alt={currentTrack?.album.title || "Album Cover"}
                className="w-full h-full object-cover scale-110 blur-3xl opacity-20"
                fill
                sizes="100vw"
              />
            </div>
            <div className="w-full max-w-4xl h-full flex flex-col gap-2 p-4 items-stretch">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={({ active, over }) => {
                  if (active.id !== over?.id) {
                    setTracklist((prev) => {
                      const oldIndex = prev.findIndex(
                        (t) => t.id === active.id
                      );
                      const newIndex = prev.findIndex((t) => t.id === over?.id);
                      return arrayMove(prev, oldIndex, newIndex);
                    });
                  }
                }}
              >
                <SortableContext
                  items={tracklist.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {tracklist.map((track, index) => (
                    <ReorderableTrackRow
                      key={track.id}
                      index={index}
                      action="play-track-tracklist"
                      isPlaying={currentTrack?.id === track.id}
                      displayAlbum
                      displayArtist
                      displayCover
                      track={track}
                      album={track.album}
                      artist={track.artist}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lyrics view */}
      <AnimatePresence>
        {view === "lyrics" && (
          <motion.div
            className="fixed top-0 bottom-16 left-0 right-0 bg-stone-50 dark:bg-stone-950 z-40 flex items-center justify-center border-t-2 border-stone-200 dark:border-stone-800"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.4 }}
          >
            {currentTrack && (
              <>
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                  <Image
                    src={`/uploads/albums/${
                      currentTrack?.album.id
                    }.jpg?updated=${currentTrack?.album.updatedAt.getTime()}`}
                    alt={currentTrack?.album.title || "Album Cover"}
                    className="w-full h-full object-cover scale-110 blur-3xl opacity-20"
                    fill
                    sizes="100vw"
                  />
                </div>
                <Lyrics currentTime={currentTime} track={currentTrack} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extended player view */}
      <AnimatePresence>
        {view === "immersive" && (
          <motion.div
            className="fixed top-0 bottom-16 left-0 right-0 bg-stone-50 dark:bg-stone-950 z-40 flex items-center justify-center border-t-2 border-stone-200 dark:border-stone-800"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.4 }}
          >
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <Image
                src={`/uploads/albums/${
                  currentTrack?.album.id
                }.jpg?updated=${currentTrack?.album.updatedAt.getTime()}`}
                alt={currentTrack?.album.title || ""}
                className="w-full h-full object-cover scale-110 blur-3xl opacity-20"
                fill
                sizes="100vw"
              />
            </div>
            <div className="flex flex-col items-center justify-center gap-2 w-full h-full mx-auto px-12">
              <div className="relative aspect-square w-[85%] max-w-[800px]">
                {/* Bras du tourne-disque */}
                <motion.img
                  src="/svgs/record-player-arm.svg"
                  alt="Vinyl arm"
                  className="absolute top-[-3%] left-[96%] -translate-x-1/2 origin-[66%_21%] z-20 w-[95%] h-[95%] pointer-events-none"
                  style={{ rotate: vinylArmRotate }}
                  animate={vinylArmControls}
                />

                {/* Disque vinyle */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{ rotate: vinylRotate }}
                  animate={vinylControls}
                >
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-[110%] h-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full z-0 pointer-events-none"
                    animate={{
                      scale: [1, 1.05, 1],
                      background: [
                        "radial-gradient(circle, #fda400 0%, transparent 75%)",
                        "radial-gradient(circle, #fd7200 0%, transparent 85%)",
                        "radial-gradient(circle, #fda400 0%, transparent 75%)",
                      ],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      filter: "blur(20px)",
                    }}
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full ">
                    <Image
                      src="/svgs/record.svg"
                      alt="Vinyl record"
                      className="object-contain"
                      fill
                      unoptimized
                    />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[43%] h-[43%]">
                    <Image
                      className="object-contain rounded-full"
                      src={`/uploads/albums/${
                        currentTrack?.album.id
                      }.jpg?updated=${currentTrack?.album.updatedAt.getTime()}`}
                      alt={currentTrack?.album.title || ""}
                      fill
                      sizes="100vw"
                    />
                  </div>
                </motion.div>
              </div>
              <div className="flex flex-col items-center justify-center z-30 gap-1 mt-2">
                {currentTrack && (
                  <>
                    <p className="text-stone-800 dark:text-white text-lg">
                      {currentTrack?.title}
                    </p>
                    <div className="flex flex-row items-center gap-1">
                      <Link
                        href={`/library/artists/${currentTrack?.artist.id}`}
                        className="text-stone-700 dark:text-stone-300 hover:underline cursor-pointer"
                        onClick={() => setView("minimized")}
                      >
                        {currentTrack?.artist.name}
                      </Link>
                      <p className="text-stone-700 dark:text-stone-300">•</p>
                      <Link
                        href={`/library/albums/${currentTrack?.album.id}`}
                        className="text-stone-700 dark:text-stone-300 hover:underline cursor-pointer"
                        onClick={() => setView("minimized")}
                      >
                        {currentTrack?.album.title}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-16 left-0 right-0 h-0.5 z-50 px-0.5 flex items-center justify-center bg-stone-50 dark:bg-stone-950 border-t-2 border-stone-200 dark:border-stone-800 group">
        <input
          type="range"
          min={0}
          max={currentTrack?.duration || 1}
          step={0.1}
          value={currentTime}
          onMouseDown={handleSeekStart}
          onTouchStart={handleSeekStart}
          onMouseUp={handleSeekEnd}
          onTouchEnd={handleSeekEnd}
          onChange={handleSeekChange}
          className="w-full h-1 bg-stone-800 rounded-md appearance-none cursor-pointer accent-[#fd7200] 
          [&::-webkit-slider-thumb]:appearance-none
          [&::-moz-range-thumb]:appearance-none
          group-hover:[&::-webkit-slider-thumb]:appearance-auto
          group-hover:[&::-moz-range-thumb]:appearance-auto
          group-hover:[&::-webkit-slider-thumb]:w-3
          group-hover:[&::-webkit-slider-thumb]:h-3
          group-hover:[&::-webkit-slider-thumb]:rounded-full
          group-hover:[&::-webkit-slider-thumb]:shadow
          group-hover:[&::-moz-range-thumb]:w-3
          group-hover:[&::-moz-range-thumb]:h-3
          group-hover:[&::-moz-range-thumb]:rounded-full
          group-hover:[&::-moz-range-thumb]:shadow"
          style={{
            background: `linear-gradient(to right, #fd7200 ${
              (currentTime / (currentTrack?.duration || 1)) * 100
            }%, #27272a 0%)`,
          }}
        />
      </div>
      <div className="fixed bottom-0 left-0 right-0 h-16 z-40 bg-stone-50 dark:bg-stone-950 border-t-2 border-stone-200 dark:border-stone-800 flex items-stretch p-2">
        {/* Song Controls */}
        <div className="flex items-center gap-1 ml-4">
          <button
            className="flex items-center justify-center text-white text-xl cursor-pointer p-2"
            onClick={toggleShuffle}
          >
            <Shuffle
              size={20}
              className={
                player?.shuffle
                  ? "stroke-[#fd7200]"
                  : "stroke-stone-800 dark:stroke-white"
              }
            />
          </button>
          <button
            className="flex items-center justify-center text-white text-xl cursor-pointer p-2"
            onClick={previous}
          >
            <SkipBack
              size={20}
              className="stroke-stone-800 dark:stroke-white"
            />
          </button>
          <button
            className="flex items-center justify-center text-white text-xl cursor-pointer p-2"
            onClick={handlePlayPause}
          >
            {player?.state === "playing" && (
              <Pause size={28} className="stroke-stone-800 dark:stroke-white" />
            )}
            {player?.state !== "playing" && (
              <Play size={28} className="stroke-stone-800 dark:stroke-white" />
            )}
          </button>
          <button
            className="flex items-center justify-center text-white text-xl cursor-pointer p-2"
            onClick={next}
          >
            <SkipForward
              size={20}
              className="stroke-stone-800 dark:stroke-white"
            />
          </button>
          <button
            className="flex items-center justify-center text-white text-xl cursor-pointer p-2"
            onClick={toggleRepeat}
          >
            <Repeat
              size={20}
              className={
                player?.repeat
                  ? "stroke-[#fd7200]"
                  : "stroke-stone-800 dark:stroke-white"
              }
            />
          </button>
          {player && currentTrack && (
            <>
              <p className="text-stone-600 dark:text-stone-300 text-sm ms-4">
                {formatDuration(currentTime)}
              </p>
              <p className="text-stone-600 dark:text-stone-300 text-sm">:</p>
              <p className="text-stone-600 dark:text-stone-300 text-sm me-2">
                {formatDuration(currentTrack.duration)}
              </p>
            </>
          )}
        </div>

        {/* Album details */}
        <div className="hidden sm:flex flex-1 items-center justify-center gap-4">
          {currentTrack && (
            <>
              <Image
                src={`/uploads/albums/${
                  currentTrack.album.id
                }.jpg?updated=${currentTrack?.album.updatedAt.getTime()}`}
                alt=""
                className="aspect-square object-contain rounded"
                width={48}
                height={48}
              />
              <div className="flex flex-col items-start justify-center text-md">
                <p className="text-stone-800 dark:text-white text-sm font-semibold">
                  {currentTrack.title}
                </p>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/library/artists/${currentTrack.artist.id}`}
                    className="text-stone-600 dark:text-stone-300 text-sm hover:underline cursor-pointer"
                  >
                    {currentTrack.artist.name}
                  </Link>
                  <p className="text-stone-600 dark:text-stone-300">•</p>
                  <Link
                    href={`/library/albums/${currentTrack.album.id}`}
                    className="text-stone-600 dark:text-stone-300 text-sm hover:underline cursor-pointer"
                  >
                    {currentTrack.album.title}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex sm:hidden flex-1"></div>

        {/* Display  */}
        <div className="flex items-center justify-end">
          <button className="flex items-center cursor-pointer p-2">
            <Volume size={20} className="stroke-stone-800 dark:stroke-white" />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={currentVolume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              setVolume(newVolume);
            }}
            className="w-24 h-1 bg-stone-800 rounded-md cursor-pointer appearance-none
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
              background: `linear-gradient(to right, #fd7200 ${
                currentVolume * 100
              }%, #27272a 0%)`,
            }}
          />
          <button
            className="flex items-center text-white text-xl cursor-pointer p-2 ms-4"
            onClick={() => handleViewChange("tracklist")}
          >
            <ListMusic
              size={24}
              className={
                view === "tracklist"
                  ? "stroke-[#fd7200]"
                  : "stroke-stone-800 dark:stroke-white"
              }
            />
          </button>
          <button
            className="flex items-center text-white text-xl cursor-pointer p-2"
            onClick={() => handleViewChange("lyrics")}
          >
            <MicVocal
              size={24}
              className={
                view === "lyrics"
                  ? "stroke-[#fd7200]"
                  : "stroke-stone-800 dark:stroke-white"
              }
            />
          </button>
          <button
            className="flex items-center text-white text-xl cursor-pointer p-2"
            onClick={() => handleViewChange("immersive")}
          >
            <Disc3
              size={24}
              className={
                view === "immersive"
                  ? "stroke-[#fd7200]"
                  : "stroke-stone-800 dark:stroke-white"
              }
            />
          </button>
        </div>
      </div>
    </>
  );
}
