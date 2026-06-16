import { useCallback, useEffect, useRef, useState } from "react";
import { Card, Button, Spinner, Tooltip } from "@heroui/react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useAppStore, isCompressedFile } from "@/store/app";
import { useI18n } from "@/i18n";
import { compressFile, copyFile } from "@/lib/tauri";
import { AlertTriangle, CheckCircle, ClipboardCopy, Download, Plus, Trash2, Upload, X } from "@/components/icons";
import { ManualCompressionConfigButton, ManualCompressionConfigTray } from "@/components/ManualCompressionConfig";

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

const MIN_LOADING_MS = 650;

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function ManualCompression() {
  const { t } = useI18n();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const {
    mode, format, level, targetSizePercent, preserveMetadata, overwrite,
    maxWidth, maxHeight, allowUpscale,
    skipCompressedFiles, autoCopyAfterCompression,
    items, addItem, removeItem, clearItems, updateItem,
    recordCompression,
  } = useAppStore();

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    const setup = async () => {
      try {
        const appWindow = getCurrentWebviewWindow();
        unlisten = await appWindow.onDragDropEvent((event) => {
          if (event.payload.type === "drop") {
            autoCompressRef.current = true;
            for (const path of event.payload.paths) {
              const name = path.split(/[/\\]/).pop() || path;
              if (skipCompressedFiles && isCompressedFile(name)) continue;
              addItem({ name, path, originalBytes: 0 });
            }
          }
        });
      } catch { /* Not in Tauri */ }
    };
    setup();

    // 粘贴支持
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            const name = file.name || "pasted-image.png";
            const itemId = addItem({ name, path: "", originalBytes: file.size, status: "preparing" });
            const reader = new FileReader();
            reader.onload = () => {
              import("@/lib/tauri").then(({ saveTempImage }) => {
                const base64 = (reader.result as string).split(",")[1];
                saveTempImage(base64, name).then((path) => {
                  autoCompressRef.current = true;
                  updateItem(itemId, { path, status: "pending" });
                }).catch((err) => {
                  updateItem(itemId, { status: "error", error: String(err) });
                });
              }).catch((err) => {
                updateItem(itemId, { status: "error", error: String(err) });
              });
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => {
      unlisten?.();
      document.removeEventListener("paste", handlePaste);
    };
  }, [addItem, skipCompressedFiles, updateItem]);

  const selectFiles = useCallback(async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [{ name: "图片", extensions: ["jpg", "jpeg", "png", "webp", "avif", "heic", "tiff", "pdf"] }],
      });
      if (selected) {
        autoCompressRef.current = true;
        const paths = Array.isArray(selected) ? selected : [selected];
        for (const path of paths) {
          const name = path.split(/[/\\]/).pop() || path;
          if (skipCompressedFiles && isCompressedFile(name)) continue;
          addItem({ name, path, originalBytes: 0 });
        }
      }
    } catch { /* cancelled */ }
  }, [addItem, skipCompressedFiles]);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard?.read?.();
      if (!clipboardItems) return;

      for (const clipboardItem of clipboardItems) {
        const imageType = clipboardItem.types.find((type) => type.startsWith("image/"));
        if (!imageType) continue;
        const blob = await clipboardItem.getType(imageType);
        const name = `pasted-image.${imageType.split("/")[1] || "png"}`;
        const itemId = addItem({ name, path: "", originalBytes: blob.size, status: "preparing" });
        const reader = new FileReader();
        reader.onload = () => {
          import("@/lib/tauri").then(({ saveTempImage }) => {
            const base64 = (reader.result as string).split(",")[1];
            saveTempImage(base64, name).then((path) => {
              autoCompressRef.current = true;
              updateItem(itemId, { path, status: "pending" });
            }).catch((err) => {
              updateItem(itemId, { status: "error", error: String(err) });
            });
          }).catch((err) => {
            updateItem(itemId, { status: "error", error: String(err) });
          });
        };
        reader.readAsDataURL(blob);
      }
    } catch {
      // Clipboard read is unavailable in some WebView contexts; paste shortcut still works.
    }
  }, [addItem, updateItem]);

  const compressItem = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item || !item.path) return;
    const startedAt = Date.now();
    updateItem(id, { status: "compressing" });
    try {
      const result = await compressFile({
        path: item.path, mode, format, level,
        target_size_percent: mode === "target" ? targetSizePercent : undefined,
        preserve_metadata: preserveMetadata,
        overwrite,
        max_width: maxWidth || undefined,
        max_height: maxHeight || undefined,
        allow_upscale: allowUpscale,
      });
      const remainingLoadingMs = Math.max(0, MIN_LOADING_MS - (Date.now() - startedAt));
      if (remainingLoadingMs > 0) {
        await wait(remainingLoadingMs);
      }
      if (result.error) {
        updateItem(id, { status: "error", error: result.error });
      } else if (result.compressed_bytes >= result.original_bytes) {
        updateItem(id, { status: "error", error: "压缩后体积变大，已跳过" });
      } else {
        updateItem(id, { status: "done", result, originalBytes: result.original_bytes });
        recordCompression(result.saved_bytes);
        // 自动复制到剪贴板
        if (autoCopyAfterCompression && result.output) {
          try { await navigator.clipboard.writeText(result.output); } catch { /* ignore */ }
        }
      }
    } catch (err) {
      const remainingLoadingMs = Math.max(0, MIN_LOADING_MS - (Date.now() - startedAt));
      if (remainingLoadingMs > 0) {
        await wait(remainingLoadingMs);
      }
      updateItem(id, { status: "error", error: String(err) });
    }
  }, [items, mode, format, level, targetSizePercent, preserveMetadata, overwrite, maxWidth, maxHeight, allowUpscale, updateItem, recordCompression, autoCopyAfterCompression]);



  // 自动压缩：拖入/选择/粘贴后自动开始压缩
  const autoCompressRef = useRef(false);
  useEffect(() => {
    if (autoCompressRef.current) {
      const pending = items.filter((i) => i.status === "pending" && i.path);
      if (pending.length > 0) {
        autoCompressRef.current = false;
        for (const item of pending) {
          compressItem(item.id);
        }
      }
    }
  }, [items, compressItem]);

  // 生成 #C 后缀的文件名
  const outputFileName = useCallback((item: typeof items[0]) => {
    const ext = item.result?.output?.split(".").pop() || item.name.split(".").pop() || "jpg";
    const baseName = item.name.replace(/\.[^.]+$/, "");
    return `${baseName}#C.${ext}`;
  }, []);

  // 单个保存：弹出文件对话框，选择保存位置
  const saveItem = useCallback(async (item: typeof items[0]) => {
    if (!item.result) return;
    try {
      const dest = await save({
        defaultPath: outputFileName(item),
        filters: [{ name: "图片", extensions: [item.result.output.split(".").pop() || "jpg"] }],
      });
      if (dest) {
        await copyFile(item.result.output, dest);
      }
    } catch { /* cancelled */ }
  }, [outputFileName]);

  // 全部导出：选择目录，批量保存所有已完成的文件
  const saveAll = useCallback(async () => {
    const doneItems = items.filter((i) => i.status === "done" && i.result);
    if (doneItems.length === 0) return;
    try {
      const dir = await open({ directory: true, multiple: false });
      if (dir && typeof dir === "string") {
        for (const item of doneItems) {
          const dest = `${dir}/${outputFileName(item)}`;
          await copyFile(item.result!.output, dest);
        }
      }
    } catch { /* cancelled */ }
  }, [items, outputFileName]);

  // 统计
  const doneCount = items.filter((i) => i.status === "done").length;

  useEffect(() => {
    window.dispatchEvent(new Event("zipax:resize"));
    const timers = [
      window.setTimeout(() => window.dispatchEvent(new Event("zipax:resize")), 180),
      window.setTimeout(() => window.dispatchEvent(new Event("zipax:resize")), 360),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [isConfigOpen]);

  return (
    <div ref={contentRef} className="manual-compression-surface view-stack">
      {/* Drop Zone */}
      <Card className="zipax-card">
        <Card.Content className="p-0">
          <div className="relative">
            <div className="drop-toolbar">
              <ManualCompressionConfigButton
                isOpen={isConfigOpen}
                onToggle={() => setIsConfigOpen((open) => !open)}
              />
              <Tooltip delay={350}>
                <Tooltip.Trigger>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="tertiary"
                    className="tool-icon-button"
                    aria-label={t("home.paste")}
                    onPress={pasteFromClipboard}
                  >
                    <ClipboardCopy size={18} strokeWidth={1.75} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>{t("home.paste")}</Tooltip.Content>
              </Tooltip>
              <Tooltip delay={350}>
                <Tooltip.Trigger>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="tertiary"
                    className="tool-icon-button"
                    aria-label={t("home.select")}
                    onPress={selectFiles}
                  >
                    <Plus size={18} strokeWidth={1.75} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>{t("home.select")}</Tooltip.Content>
              </Tooltip>
            </div>

            <div
              className="drop-zone"
              onClick={selectFiles}
            >
              <Upload size={50} strokeWidth={1.35} className="text-default-400" />
              <div>
                <p className="drop-title">{t("home.dropTitle")}</p>
                <p className="drop-subtitle">{t("home.dropSubtitle")}</p>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {isConfigOpen && <ManualCompressionConfigTray />}

      {/* Item List */}
      {items.length > 0 && (
        <Card className="zipax-card compression-list-card">
          <Card.Content className="compression-list-content">
            <div className="compression-result-list">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`compression-result-row is-${item.status}`}
                >
                  <div className="compression-status-icon" aria-hidden="true">
                    {item.status === "done" && <CheckCircle size={18} strokeWidth={2.25} />}
                    {(item.status === "preparing" || item.status === "compressing" || item.status === "pending") && <Spinner size="sm" color="accent" />}
                    {item.status === "error" && <AlertTriangle size={18} strokeWidth={2} />}
                  </div>

                  <div className="compression-result-copy">
                    <p className="surface-title truncate">{item.name}</p>
                    {item.status === "done" && item.result && (
                      <p className="surface-detail">
                        {formatBytes(item.result.original_bytes)} → {formatBytes(item.result.compressed_bytes)}
                      <span>，{t("home.saved")} {formatBytes(item.result.saved_bytes)}</span>
                    </p>
                  )}
                  {item.status === "compressing" && (
                    <p className="surface-detail">{t("home.compressing")}</p>
                  )}
                  {item.status === "preparing" && (
                    <p className="surface-detail">{t("home.reading")}</p>
                  )}
                  {item.status === "pending" && (
                    <p className="surface-detail">{t("home.preparing")}</p>
                  )}
                    {item.status === "error" && (
                      <p className="surface-detail text-danger">{item.error}</p>
                    )}
                  </div>

                  <div className="compression-result-actions">
                    {item.status === "done" && (
                      <Tooltip delay={350}>
                        <Tooltip.Trigger>
                          <Button
                            size="sm"
                            variant="secondary"
                            isIconOnly
                            className="compression-save-button"
                            onPress={() => saveItem(item)}
                          aria-label={t("home.download")}
                        >
                            <Download size={15} strokeWidth={1.9} />
                          </Button>
                        </Tooltip.Trigger>
                      <Tooltip.Content>{t("home.download")}</Tooltip.Content>
                    </Tooltip>
                  )}
                  {item.status === "error" && (
                    <Button size="sm" variant="secondary" onPress={() => compressItem(item.id)}>
                      {t("home.retry")}
                    </Button>
                  )}
                    <Tooltip delay={350}>
                      <Tooltip.Trigger>
                        <Button
                          size="sm"
                          variant="tertiary"
                          isIconOnly
                          className="tool-icon-button compression-delete-button"
                          onPress={() => removeItem(item.id)}
                          aria-label={t("home.delete")}
                        >
                          <X size={15} strokeWidth={1.9} />
                        </Button>
                      </Tooltip.Trigger>
                    <Tooltip.Content>{t("home.delete")}</Tooltip.Content>
                  </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Action Bar */}
      {items.length > 0 && (
        <div className="manual-action-bar">
          <Tooltip delay={350}>
            <Tooltip.Trigger>
              <Button
                size="sm"
                variant="tertiary"
                isIconOnly
                className="manual-clear-button"
                onPress={clearItems}
                aria-label={t("home.clearAll")}
              >
                <Trash2 size={15} strokeWidth={1.85} />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>{t("home.clearAll")}</Tooltip.Content>
          </Tooltip>
          <Button
            size="sm"
            variant="primary"
            onPress={saveAll}
            isDisabled={items.every((i) => i.status !== "done")}
          >
            <Download size={15} strokeWidth={1.9} />
            {t("home.saveAll")}{doneCount > 0 ? ` ${doneCount}` : ""}
          </Button>
        </div>
      )}
    </div>
  );
}
