import { invoke } from "@tauri-apps/api/core";

// --- Types matching Rust backend ---

export interface CompressRequest {
  path: string;
  mode?: string;
  format?: string;
  level?: number;
  target_size_kb?: number;
  target_size_percent?: number;
  preserve_metadata?: boolean;
  overwrite?: boolean;
  max_width?: number;
  max_height?: number;
  allow_upscale?: boolean;
}

export interface CompressResponse {
  source: string;
  output: string;
  original_bytes: number;
  compressed_bytes: number;
  saved_bytes: number;
  ratio: number;
  used_output: boolean;
  error: string | null;
}

export interface AppInfo {
  version: string;
  core_version: string;
  supported_formats: string[];
}

export interface WatchFolderRequest {
  path: string;
  auto_compress: boolean;
  mode?: string;
  format?: string;
  level?: number;
  target_size_kb?: number;
  target_size_percent?: number;
  preserve_metadata?: boolean;
  overwrite?: boolean;
  max_width?: number;
  max_height?: number;
  allow_upscale?: boolean;
}

// --- Tauri command wrappers ---

export async function compressFile(
  request: CompressRequest
): Promise<CompressResponse> {
  return invoke<CompressResponse>("compress_file", { request });
}

export async function compressBatch(
  requests: CompressRequest[]
): Promise<CompressResponse[]> {
  return invoke<CompressResponse[]>("compress_batch", { requests });
}

export async function getAppInfo(): Promise<AppInfo> {
  return invoke<AppInfo>("get_app_info");
}

export async function watchFolder(request: WatchFolderRequest): Promise<void> {
  return invoke<void>("watch_folder", { request });
}

export async function stopAllWatchers(): Promise<void> {
  return invoke<void>("stop_all_watchers");
}

export async function saveTempImage(base64Data: string, filename: string): Promise<string> {
  return invoke<string>("save_temp_image", { base64Data, filename });
}

export async function copyFile(source: string, destination: string): Promise<void> {
  return invoke<void>("copy_file", { source, destination });
}

export async function enableAutostart(): Promise<void> {
  await invoke<void>("set_autostart_enabled", { enabled: true });
}

export async function disableAutostart(): Promise<void> {
  await invoke<void>("set_autostart_enabled", { enabled: false });
}

export async function isAutostartEnabled(): Promise<boolean> {
  return invoke<boolean>("get_autostart_enabled");
}
