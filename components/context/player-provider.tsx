"use client";

import React, { createContext, useEffect, useRef, useState } from "react";
import { Howl, Howler } from "howler";
import { TrackWithAlbumAndArtist } from "@/lib/actions/track";

type PlayerData = {
  songId: string;
  state: "playing" | "paused" | "stopped";
  currentTime: number;
  duration: number;
  trackList: TrackWithAlbumAndArtist[];
  currentTrackIndex: number;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
};

type PlayerContextType = {
  player: PlayerData | null;
  view: "minimized" | "immersive" | "tracklist" | "lyrics";
  setView: (view: "minimized" | "immersive" | "tracklist" | "lyrics") => void;
  playTrack: (
    track: TrackWithAlbumAndArtist,
    trackList?: TrackWithAlbumAndArtist[]
  ) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  addNext: (track: TrackWithAlbumAndArtist) => void;
  addToEnd: (track: TrackWithAlbumAndArtist) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  currentTrack: TrackWithAlbumAndArtist | null;
  currentTime: number;
  currentVolume: number;
};

export const PlayerContext = createContext<PlayerContextType | undefined>(
  undefined
);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [currentTrack, setCurrentTrack] =
    useState<TrackWithAlbumAndArtist | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentVolume, setVolume] = useState<number>(1);

  const playerRef = useRef<PlayerData | null>(null);
  const soundRef = useRef<Howl | null>(null);

  const [view, setView] = useState<
    "minimized" | "immersive" | "tracklist" | "lyrics"
  >("minimized");

  // Initial state, loading from localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem("player_volume");
    const savedShuffle = localStorage.getItem("player_shuffle");
    const savedRepeat = localStorage.getItem("player_repeat");

    if (savedVolume !== null) setVolume(parseFloat(savedVolume));
    if (savedShuffle !== null) {
      setPlayer((prev) => ({
        ...(prev || {
          state: "stopped",
          songId: "",
          currentTrackIndex: 0,
          currentTime: 0,
          duration: 0,
          volume: parseFloat(savedVolume ?? "1"),
          trackList: [],
          shuffle: savedShuffle === "true",
          repeat: savedRepeat === "true",
        }),
        shuffle: savedShuffle === "true",
      }));
    }
    if (savedRepeat !== null) {
      setPlayer((prev) => ({
        ...(prev || {
          state: "stopped",
          songId: "",
          currentTrackIndex: 0,
          currentTime: 0,
          duration: 0,
          volume: parseFloat(savedVolume ?? "1"),
          trackList: [],
          shuffle: savedShuffle === "true",
          repeat: savedRepeat === "true",
        }),
        repeat: savedRepeat === "true",
      }));
    }
  }, []);

  // Update playerRef whenever player changes
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // Update currentTIme every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      const time = soundRef.current?.seek() as number;
      if (!isNaN(time)) {
        setCurrentTime(time);
        updatePositionState();
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Player functions
  const playTrack = (
    track: TrackWithAlbumAndArtist,
    trackList?: TrackWithAlbumAndArtist[],
    trackIndex?: number
  ) => {
    soundRef.current?.stop();

    const sound = new Howl({
      src: [`/uploads/tracks/${track.id}`],
      format: ["mp3", "ogg"],
      html5: true,
      volume: currentVolume,
      onend: () => {
        const currentPlayer = playerRef.current;
        if (currentPlayer) {
          // utilise une version modifiée de next avec currentPlayer en argument si besoin
          nextWithPlayer(currentPlayer);
        }
      },
    });

    soundRef.current = sound;
    sound.play();

    setCurrentTrack(track);
    setCurrentTime(0);

    const newTrackList = trackList ?? playerRef.current?.trackList ?? [track];
    const newIndex =
      typeof trackIndex === "number"
        ? trackIndex
        : newTrackList.findIndex((t) => t.id === track.id);

    setPlayer({
      state: "playing",
      songId: track.id,
      duration: track.duration,
      currentTrackIndex: newIndex >= 0 ? newIndex : 0,
      currentTime: 0,
      volume: currentVolume,
      trackList: newTrackList,
      shuffle: playerRef.current?.shuffle || false,
      repeat: playerRef.current?.repeat || false,
    });

    updateMediaSession(track);
  };

  const pause = () => {
    soundRef.current?.pause();
    setPlayer((prev) => (prev ? { ...prev, state: "paused" } : null));
  };

  const resume = () => {
    soundRef.current?.play();
    setPlayer((prev) => (prev ? { ...prev, state: "playing" } : null));
  };

  const next = () => {
    if (!player || player.trackList.length === 0) return;

    const list = [...player.trackList];
    let nextIndex = player.currentTrackIndex;

    if (player.shuffle) {
      do {
        nextIndex = Math.floor(Math.random() * list.length);
      } while (list.length > 1 && nextIndex === player.currentTrackIndex);
    } else {
      nextIndex = player.currentTrackIndex + 1;
    }

    if (nextIndex >= list.length) {
      console.log("reached end of playlist");
      if (player.repeat) {
        nextIndex = 0;
      } else {
        setPlayer({
          ...player,
          state: "stopped",
          songId: "",
          currentTrackIndex: 0,
          currentTime: 0,
        });
        soundRef.current?.stop();
        setCurrentTrack(null);
        setCurrentTime(0);
        return;
      }
    }

    playTrack(list[nextIndex], list, nextIndex);
  };

  const nextWithPlayer = (currentPlayer: PlayerData) => {
    const list = [...currentPlayer.trackList];
    let nextIndex = currentPlayer.currentTrackIndex;

    if (currentPlayer.shuffle) {
      do {
        nextIndex = Math.floor(Math.random() * list.length);
      } while (
        list.length > 1 &&
        nextIndex === currentPlayer.currentTrackIndex
      );
    } else {
      nextIndex = currentPlayer.currentTrackIndex + 1;
    }

    if (nextIndex >= list.length) {
      if (currentPlayer.repeat) {
        nextIndex = 0;
      } else {
        setPlayer({
          ...currentPlayer,
          state: "stopped",
          songId: "",
          currentTrackIndex: 0,
          currentTime: 0,
        });
        soundRef.current?.stop();
        setCurrentTrack(null);
        setCurrentTime(0);
        return;
      }
    }

    playTrack(list[nextIndex], list, nextIndex);
  };

  const previous = () => {
    if (!player || player.trackList.length === 0) return;

    const currentSeek = soundRef.current?.seek() as number;

    if (currentSeek > 10) {
      // Si plus de 10 secondes, on remet au début de la piste
      soundRef.current?.seek(0);
      setCurrentTime(0);
      setPlayer((prev) => (prev ? { ...prev, currentTime: 0 } : null));
      return;
    }

    // Sinon on passe à la piste précédente
    let prevIndex = player.currentTrackIndex - 1;

    if (prevIndex < 0) {
      if (player.repeat) {
        prevIndex = player.trackList.length - 1;
      } else {
        return;
      }
    }

    playTrack(player.trackList[prevIndex], player.trackList, prevIndex);
  };

  const previousWithPlayer = (currentPlayer: PlayerData) => {
    const currentSeek = soundRef.current?.seek() as number;

    if (currentSeek > 10) {
      // Si plus de 10 secondes, on remet au début de la piste
      soundRef.current?.seek(0);
      setCurrentTime(0);
      setPlayer((prev) => (prev ? { ...prev, currentTime: 0 } : null));
      return;
    }

    // Sinon on passe à la piste précédente
    let prevIndex = currentPlayer.currentTrackIndex - 1;

    if (prevIndex < 0) {
      if (currentPlayer.repeat) {
        prevIndex = currentPlayer.trackList.length - 1;
      } else {
        return;
      }
    }

    playTrack(
      currentPlayer.trackList[prevIndex],
      currentPlayer.trackList,
      prevIndex
    );
  };

  const seek = (time: number) => {
    if (soundRef.current?.state() === "loaded") {
      soundRef.current?.seek(time);
      setPlayer((prev) => (prev ? { ...prev, currentTime: time } : null));
      updatePositionState();
    }
  };

  const addNext = (track: TrackWithAlbumAndArtist) => {
    if (!player || player.state === "stopped") {
      // Si le player est arrêté, on joue immédiatement
      playTrack(track, [track], 0);
      return;
    }

    setPlayer((prev) => {
      if (!prev) return null;

      const list = [...prev.trackList];
      list.splice(prev.currentTrackIndex + 1, 0, track);

      return { ...prev, trackList: list };
    });
  };

  const addToEnd = (track: TrackWithAlbumAndArtist) => {
    if (!player || player.state == "stopped") {
      // Si le player est arrêté, on joue immédiatement
      playTrack(track, [track], 0);
      return;
    }

    setPlayer((prev) => {
      if (!prev) return null;

      const list = [...prev.trackList, track];

      return { ...prev, trackList: list };
    });
  };

  const toggleShuffle = () => {
    setPlayer((prev) => {
      const newShuffle = !(prev?.shuffle ?? false);
      localStorage.setItem("player_shuffle", newShuffle.toString());
      return prev ? { ...prev, shuffle: !prev.shuffle } : null;
    });
  };

  const toggleRepeat = () => {
    setPlayer((prev) => {
      const newRepeat = !(prev?.repeat ?? false);
      localStorage.setItem("player_repeat", newRepeat.toString());
      return prev ? { ...prev, repeat: !prev.repeat } : null;
    });
  };

  // Set volume and update localStorage
  useEffect(() => {
    soundRef.current?.volume(currentVolume);
    Howler.volume(currentVolume);
    localStorage.setItem("player_volume", currentVolume.toString());

    setPlayer((prev) => (prev ? { ...prev, volume: currentVolume } : null));
  }, [currentVolume]);

  // Media Session API for better media controls
  const updateMediaSession = (track: TrackWithAlbumAndArtist) => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist.name,
      album: track.album.title || "",
      artwork: [
        {
          src: `/uploads/albums/${track.album.id}.jpg`,
          sizes: "512x512",
          type: "image/jpeg",
        },
      ],
    });

    navigator.mediaSession.setActionHandler("play", resume);
    navigator.mediaSession.setActionHandler("pause", pause);
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      seek(details.seekTime ?? 0);
    });

    navigator.mediaSession.setActionHandler("previoustrack", () => {
      const currentPlayer = playerRef.current;
      if (currentPlayer) {
        previousWithPlayer(currentPlayer);
      }
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      const currentPlayer = playerRef.current;
      if (currentPlayer) {
        nextWithPlayer(currentPlayer);
      }
    });

    updatePositionState();
  };

  const updatePositionState = () => {
    if (
      "mediaSession" in navigator &&
      navigator.mediaSession.setPositionState &&
      soundRef.current
    ) {
      navigator.mediaSession.setPositionState({
        duration: soundRef.current.duration(),
        position: soundRef.current.seek() as number,
        playbackRate: 1,
      });
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        player,
        view,
        setView,
        playTrack,
        pause,
        resume,
        next,
        previous,
        seek,
        setVolume,
        addNext,
        addToEnd,
        toggleShuffle,
        toggleRepeat,
        currentTrack,
        currentTime,
        currentVolume,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
