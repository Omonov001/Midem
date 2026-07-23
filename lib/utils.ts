import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function localization(lng: string) {
  if (lng === "en") return "en-US";
  if (lng === "ru") return "ru-RU";
  if (lng === "tr") return "tr-TR";
  if (lng === "uz") return "uz-UZ";
}
