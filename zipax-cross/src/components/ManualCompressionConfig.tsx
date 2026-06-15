import { Button } from "@heroui/react";
import { useAppStore } from "@/store/app";
import { SlidersHorizontal } from "@/components/icons";
import { ConfigPanel } from "@/components/ui";
import { CompressionSettingsEditor, type CompressionSettingsEditorValue } from "./CompressionSettingsEditor";

interface ManualCompressionConfigButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ManualCompressionConfigButton({ isOpen, onToggle }: ManualCompressionConfigButtonProps) {
  return (
    <Button
      isIconOnly
      size="sm"
      variant="tertiary"
      aria-label="压缩设置"
      aria-expanded={isOpen}
      className="tool-icon-button config-toggle-button"
      data-open={isOpen ? "true" : undefined}
      onPress={onToggle}
    >
      <SlidersHorizontal size={20} strokeWidth={1.85} />
    </Button>
  );
}

export function ManualCompressionConfigTray() {
  const {
    mode, format, level, targetSizeKB, targetSizePercent, preserveMetadata, overwrite,
    maxWidth, maxHeight, allowUpscale,
    setMode, setFormat, setLevel, setTargetSizeKB, setTargetSizePercent, setPreserveMetadata, setOverwrite,
    setMaxWidth, setMaxHeight, setAllowUpscale,
  } = useAppStore();

  const value: CompressionSettingsEditorValue = {
    mode,
    format,
    level,
    targetSizeKB,
    targetSizePercent,
    preserveMetadata,
    overwrite,
    maxWidth,
    maxHeight,
    allowUpscale,
  };

  return (
    <div className="config-tray">
      <ConfigPanel>
        <CompressionSettingsEditor
          compact
          embedded
          layout="panel"
          value={value}
          onChange={(patch) => {
            if (patch.mode !== undefined) setMode(patch.mode);
            if (patch.format !== undefined) setFormat(patch.format);
            if (patch.level !== undefined) setLevel(patch.level);
            if (patch.targetSizeKB !== undefined) setTargetSizeKB(patch.targetSizeKB);
            if (patch.targetSizePercent !== undefined) setTargetSizePercent(patch.targetSizePercent);
            if (patch.preserveMetadata !== undefined) setPreserveMetadata(patch.preserveMetadata);
            if (patch.overwrite !== undefined) setOverwrite(patch.overwrite);
            if ("maxWidth" in patch) setMaxWidth(patch.maxWidth);
            if ("maxHeight" in patch) setMaxHeight(patch.maxHeight);
            if (patch.allowUpscale !== undefined) setAllowUpscale(patch.allowUpscale);
          }}
        />
      </ConfigPanel>
    </div>
  );
}
