import { useCallback, useEffect, useRef, useState } from "react";
import { dispatchZipaxResize } from "@/lib/utils";
import { ManualCompressionConfigTray } from "@/components/ManualCompressionConfig";
import { CompressionDropZone, CompressionResultList, ManualActionBar } from "@/components/ManualCompressionParts";
import { GhostscriptInstallDialog } from "@/components/GhostscriptInstallDialog";
import { useManualCompressionActions } from "@/hooks/useManualCompressionActions";
import { useManualImageInput } from "@/hooks/useManualImageInput";
import { useAppStore } from "@/store/app";

export default function ManualCompression() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const {
    items,
    doneCount,
    requestAutoCompress,
    compressItem,
    saveItem,
    saveAll,
    removeItem,
    clearItems,
  } = useManualCompressionActions();
  const { pasteFromClipboard, selectFiles } = useManualImageInput({ requestAutoCompress });
  const ghostscriptItemId = useAppStore((s) => s.ghostscriptItemId);
  const setGhostscriptItemId = useAppStore((s) => s.setGhostscriptItemId);

  useEffect(() => {
    const timers = dispatchZipaxResize([180, 360]);
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [isConfigOpen]);

  const handleGsInstalled = useCallback(() => {
    const id = ghostscriptItemId;
    setGhostscriptItemId(null);
    if (id) {
      compressItem(id);
    }
  }, [ghostscriptItemId, setGhostscriptItemId, compressItem]);

  return (
    <div ref={contentRef} className="manual-compression-surface view-stack">
      <GhostscriptInstallDialog
        isOpen={!!ghostscriptItemId}
        onClose={() => setGhostscriptItemId(null)}
        onInstalled={handleGsInstalled}
      />

      <CompressionDropZone
        isConfigOpen={isConfigOpen}
        onToggleConfig={() => setIsConfigOpen((open) => !open)}
        onPaste={pasteFromClipboard}
        onSelect={selectFiles}
      />

      {isConfigOpen && <ManualCompressionConfigTray />}

      <CompressionResultList items={items} onSave={saveItem} onRetry={compressItem} onRemove={removeItem} />

      {items.length > 0 && <ManualActionBar doneCount={doneCount} onClear={clearItems} onSaveAll={saveAll} />}
    </div>
  );
}
