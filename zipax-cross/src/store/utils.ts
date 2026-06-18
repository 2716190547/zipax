import type { CompressionMode } from "./types";

let nextId = 0;

export const compressionDefaultLevels: Record<CompressionMode, number> = {
  quality: 1,
  balanced: 3,
  size: 6,
  advanced: 3,
  target: 3,
};

export const genId = () => `item-${Date.now().toString(36)}-${nextId++}`;

export function isCompressedFile(name: string): boolean {
  const baseName = name.replace(/\.[^.]+$/, "");
  return baseName.endsWith("#C") || /#C-\d+$/.test(baseName);
}
