import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useEffect } from "react";
import { isCompressedFile, useAppStore } from "@/store/app";
import { saveTempImage } from "@/lib/tauri";

const imageExtensions = ["jpg", "jpeg", "png", "webp", "avif", "heic", "tiff", "pdf"];

interface ManualImageInputOptions {
  requestAutoCompress: () => void;
}

function fileNameFromPath(path: string) {
  return path.split(/[/\\]/).pop() || path;
}

function readBlobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function useManualImageInput({ requestAutoCompress }: ManualImageInputOptions) {
  const skipCompressedFiles = useAppStore((s) => s.skipCompressedFiles);
  const addItem = useAppStore((s) => s.addItem);
  const updateItem = useAppStore((s) => s.updateItem);

  const addPath = useCallback((path: string) => {
    const name = fileNameFromPath(path);
    if (skipCompressedFiles && isCompressedFile(name)) return;
    requestAutoCompress();
    addItem({ name, path, originalBytes: 0 });
  }, [addItem, requestAutoCompress, skipCompressedFiles]);

  const addBlob = useCallback(async (blob: Blob, name: string) => {
    const itemId = addItem({ name, path: "", originalBytes: blob.size, status: "preparing" });
    try {
      const base64 = (await readBlobAsDataUrl(blob)).split(",")[1];
      const path = await saveTempImage(base64, name);
      requestAutoCompress();
      updateItem(itemId, { path, status: "pending" });
    } catch (error) {
      updateItem(itemId, { status: "error", error: String(error) });
    }
  }, [addItem, requestAutoCompress, updateItem]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    const setupDropListener = async () => {
      try {
        const appWindow = getCurrentWebviewWindow();
        unlisten = await appWindow.onDragDropEvent((event) => {
          if (event.payload.type !== "drop") return;
          event.payload.paths.forEach(addPath);
        });
      } catch {
        // Drag/drop is only available in Tauri.
      }
    };

    const handlePaste = (event: ClipboardEvent) => {
      const clipboardItems = event.clipboardData?.items;
      if (!clipboardItems) return;

      Array.from(clipboardItems).forEach((item) => {
        if (item.kind !== "file") return;
        const file = item.getAsFile();
        if (!file) return;
        addBlob(file, file.name || "pasted-image.png");
      });
    };

    setupDropListener();
    document.addEventListener("paste", handlePaste);
    return () => {
      unlisten?.();
      document.removeEventListener("paste", handlePaste);
    };
  }, [addBlob, addPath]);

  const selectFiles = useCallback(async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [{ name: "图片", extensions: imageExtensions }],
      });
      if (!selected) return;
      (Array.isArray(selected) ? selected : [selected]).forEach(addPath);
    } catch {
      // cancelled
    }
  }, [addPath]);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard?.read?.();
      if (!clipboardItems) return;

      for (const clipboardItem of clipboardItems) {
        const imageType = clipboardItem.types.find((type) => type.startsWith("image/"));
        if (!imageType) continue;
        const blob = await clipboardItem.getType(imageType);
        await addBlob(blob, `pasted-image.${imageType.split("/")[1] || "png"}`);
      }
    } catch {
      // Clipboard read is unavailable in some WebView contexts; paste shortcut still works.
    }
  }, [addBlob]);

  return { pasteFromClipboard, selectFiles };
}
