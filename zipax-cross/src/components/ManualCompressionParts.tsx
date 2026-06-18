import { Button, Card, Spinner, Tooltip } from "@heroui/react";
import { useI18n } from "@/i18n";
import type { CompressionItem } from "@/store/app";
import {
  AlertTriangle,
  CheckCircle,
  ClipboardCopy,
  Download,
  Plus,
  Trash2,
  Upload,
  X,
} from "@/components/icons";
import { ManualCompressionConfigButton } from "@/components/ManualCompressionConfig";
import { formatBytes } from "@/lib/format";

interface DropZoneProps {
  isConfigOpen: boolean;
  onToggleConfig: () => void;
  onPaste: () => void;
  onSelect: () => void;
}

interface ResultListProps {
  items: CompressionItem[];
  onSave: (item: CompressionItem) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

interface ManualActionBarProps {
  doneCount: number;
  onClear: () => void;
  onSaveAll: () => void;
}

export function CompressionDropZone({ isConfigOpen, onToggleConfig, onPaste, onSelect }: DropZoneProps) {
  const { t } = useI18n();

  return (
    <Card className="zipax-card">
      <Card.Content className="p-0">
        <div className="relative">
          <div className="drop-toolbar">
            <ManualCompressionConfigButton isOpen={isConfigOpen} onToggle={onToggleConfig} />
            <Tooltip delay={350}>
              <Tooltip.Trigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="tertiary"
                  className="tool-icon-button"
                  aria-label={t("home.paste")}
                  onPress={onPaste}
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
                  onPress={onSelect}
                >
                  <Plus size={18} strokeWidth={1.75} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>{t("home.select")}</Tooltip.Content>
            </Tooltip>
          </div>

          <div className="drop-zone" onClick={onSelect}>
            <Upload size={50} strokeWidth={1.35} className="text-default-400" />
            <div>
              <p className="drop-title">{t("home.dropTitle")}</p>
              <p className="drop-subtitle">{t("home.dropSubtitle")}</p>
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

export function CompressionResultList({ items, onSave, onRetry, onRemove }: ResultListProps) {
  const { t } = useI18n();

  if (items.length === 0) return null;

  return (
    <Card className="zipax-card compression-list-card">
      <Card.Content className="compression-list-content">
        <div className="compression-result-list">
          {items.map((item) => (
            <div key={item.id} className={`compression-result-row is-${item.status}`}>
              <div className="compression-status-icon" aria-hidden="true">
                {item.status === "done" && <CheckCircle size={18} strokeWidth={2.25} />}
                {(item.status === "preparing" || item.status === "compressing" || item.status === "pending") && (
                  <Spinner size="sm" color="accent" />
                )}
                {item.status === "error" && <AlertTriangle size={18} strokeWidth={2} />}
              </div>

              <div className="compression-result-copy">
                <p className="surface-title truncate">{item.name}</p>
                {item.status === "done" && item.result && (
                  <p className="surface-detail">
                    {formatBytes(item.result.original_bytes)} &rarr; {formatBytes(item.result.compressed_bytes)}
                    <span>，{t("home.saved")} {formatBytes(item.result.saved_bytes)}</span>
                  </p>
                )}
                {item.status === "compressing" && <p className="surface-detail">{t("home.compressing")}</p>}
                {item.status === "preparing" && <p className="surface-detail">{t("home.reading")}</p>}
                {item.status === "pending" && <p className="surface-detail">{t("home.preparing")}</p>}
                {item.status === "error" && <p className="surface-detail text-danger">{item.error}</p>}
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
                        onPress={() => onSave(item)}
                        aria-label={t("home.download")}
                      >
                        <Download size={15} strokeWidth={1.9} />
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>{t("home.download")}</Tooltip.Content>
                  </Tooltip>
                )}
                {item.status === "error" && (
                  <Button size="sm" variant="secondary" onPress={() => onRetry(item.id)}>
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
                      onPress={() => onRemove(item.id)}
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
  );
}

export function ManualActionBar({ doneCount, onClear, onSaveAll }: ManualActionBarProps) {
  const { t } = useI18n();

  return (
    <div className="manual-action-bar">
      <Tooltip delay={350}>
        <Tooltip.Trigger>
          <Button
            size="sm"
            variant="tertiary"
            isIconOnly
            className="manual-clear-button"
            onPress={onClear}
            aria-label={t("home.clearAll")}
          >
            <Trash2 size={15} strokeWidth={1.85} />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>{t("home.clearAll")}</Tooltip.Content>
      </Tooltip>
      <Button size="sm" variant="primary" onPress={onSaveAll} isDisabled={doneCount === 0}>
        <Download size={15} strokeWidth={1.9} />
        {t("home.saveAll")}{doneCount > 0 ? ` ${doneCount}` : ""}
      </Button>
    </div>
  );
}
