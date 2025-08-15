import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Deterministic date formatting (UTC based) to avoid SSR/client timezone mismatches
export function formatDateUTC(date: Date | string | number) {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function formatTimeUTC(date: Date | string | number) {
  const d = new Date(date);
  return d.toISOString().substring(11,16); // HH:MM
}

export function formatDateTimeUTC(date: Date | string | number) {
  return `${formatDateUTC(date)} ${formatTimeUTC(date)}`;
}
