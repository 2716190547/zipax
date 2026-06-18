import { useEffect, useRef, useState } from "react";
import { dispatchZipaxResize } from "@/lib/utils";
import { ManualCompressionConfigTray } from "@/components/ManualCompressionConfig";
import { CompressionDropZone, CompressionResultList, ManualActionBar } from "@/components/ManualCompressionParts";
import { useManualCompressionActions } from "@/hooks/useManualCompressionActions";
import { useManualImageInput } from "@/hooks/useManualImageInput";

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

  useEffect(() => {
    const timers = dispatchZipaxResize([180, 360]);
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [isConfigOpen]);

  return (
    <div ref={contentRef} className="manual-compression-surface view-stack">
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
