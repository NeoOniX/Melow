import { PlayerContext } from "@/components/context/player-provider";
import { useContext } from "react";

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
