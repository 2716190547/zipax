import { useCallback, useEffect, useRef } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { copyFile, compressFile } from "@/lib/tauri";
import { sleep } from "@/lib/utils";
import { useAppStore, type CompressionItem } from "@/store/app";

const MIN_LOADING_MS = 650;

function outputFileName(item: CompressionItem) {
  const ext = item.result?.output?.split(".").pop() || item.name.split(".").pop() || "jpg";
  const baseName = item.name.replace(/\.[^.]+$/, "");
  return `${baseName}#C.${ext}`;
}

export function useManualCompressionActions() {
  const autoCompressRef = useRef(false);
  const {
    mode, format, level, targetSizePercent, preserveMetadata, overwrite,
    maxWidth, maxHeight, allowUpscale,
    autoCopyAfterCompression,
    items, removeItem, clearItems, updateItem,
    recordCompression,
  } = useAppStore();

  const requestAutoCompress = useCallback(() => {
    autoCompressRef.current = true;
  }, []);

  const compressItem = useCallback(async (id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (!item?.path) return;

    const startedAt = Date.now();
    updateItem(id, { status: "compressing" });

    try {
      const result = await compressFile({
        path: item.path,
        mode,
        format,
        level,
        target_size_percent: mode === "target" ? targetSizePercent : undefined,
        preserve_metadata: preserveMetadata,
        overwrite,
        max_width: maxWidth || undefined,
        max_height: maxHeight || undefined,
        allow_upscale: allowUpscale,
      });

      const remainingLoadingMs = Math.max(0, MIN_LOADING_MS - (Date.now() - startedAt));
      if (remainingLoadingMs > 0) await sleep(remainingLoadingMs);

      if (result.error) {
        updateItem(id, { status: "error", error: result.error });
      } else if (result.compressed_bytes >= result.original_bytes) {
        updateItem(id, { status: "error", error: "压缩后体积变大，已跳过" });
      } else {
        updateItem(id, { status: "done", result, originalBytes: result.original_bytes });
        recordCompression(result.saved_bytes);
        if (autoCopyAfterCompression && result.output) {
          try {
            await navigator.clipboard.writeText(result.output);
          } catch {
            // Clipboard access can be unavailable.
          }
        }
      }
    } catch (error) {
      const remainingLoadingMs = Math.max(0, MIN_LOADING_MS - (Date.now() - startedAt));
      if (remainingLoadingMs > 0) await sleep(remainingLoadingMs);
      updateItem(id, { status: "error", error: String(error) });
    }
  }, [
    allowUpscale,
    autoCopyAfterCompression,
    format,
    items,
    level,
    maxHeight,
    maxWidth,
    mode,
    overwrite,
    preserveMetadata,
    recordCompression,
    targetSizePercent,
    updateItem,
  ]);

  const saveItem = useCallback(async (item: CompressionItem) => {
    if (!item.result) return;

    try {
      const dest = await save({
        defaultPath: outputFileName(item),
        filters: [{ name: "图片", extensions: [item.result.output.split(".").pop() || "jpg"] }],
      });
      if (dest) await copyFile(item.result.output, dest);
    } catch {
      // Cancelled.
    }
  }, []);

  const saveAll = useCallback(async () => {
    const doneItems = items.filter((item) => item.status === "done" && item.result);
    if (doneItems.length === 0) return;

    try {
      const dir = await open({ directory: true, multiple: false });
      if (!dir || typeof dir !== "string") return;

      for (const item of doneItems) {
        await copyFile(item.result!.output, `${dir}/${outputFileName(item)}`);
      }
    } catch {
      // Cancelled.
    }
  }, [items]);

  useEffect(() => {
    if (!autoCompressRef.current) return;
    const pending = items.filter((item) => item.status === "pending" && item.path);
    if (pending.length === 0) return;

    autoCompressRef.current = false;
    for (const item of pending) {
      compressItem(item.id);
    }
  }, [compressItem, items]);

  return {
    items,
    doneCount: items.filter((item) => item.status === "done").length,
    requestAutoCompress,
    compressItem,
    saveItem,
    saveAll,
    removeItem,
    clearItems,
  };
}
