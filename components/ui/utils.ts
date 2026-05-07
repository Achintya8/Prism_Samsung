import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes the same way a human would resolve conflicts: keep the meaningful final value.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
