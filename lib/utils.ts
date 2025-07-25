import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function compareArray<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

export function formatDuration(seconds: number): string {
  const totalSeconds = Math.floor(seconds);

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const padded = (num: number) => num.toString().padStart(2, "0");

  if (totalSeconds >= 3600) {
    // hh:mm:ss
    return `${h}:${padded(m)}:${padded(s)}`;
  } else if (totalSeconds >= 600) {
    // mm:ss with leading minute zero
    return `${padded(m)}:${padded(s)}`;
  } else {
    // m:ss
    return `${m}:${padded(s)}`;
  }
}
