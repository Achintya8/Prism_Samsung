import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes the same way a human would resolve conflicts: last useful value wins.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
