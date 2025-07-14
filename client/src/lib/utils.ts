import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { mkConfig, generateCsv, download } from 'csv-export'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToCsv(data: any[], filename: string) {
  const config = mkConfig({ useKeysAsHeaders: true });
  const csv = generateCsv(config)(data);
  download(config)(csv, filename);
}
