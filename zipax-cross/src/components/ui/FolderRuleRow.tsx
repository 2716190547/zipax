import { Button, Tooltip } from "@heroui/react";
import { useI18n } from "@/i18n";
import { Folder, Info, SlidersHorizontal, X } from "@/components/icons";
import { HeroSwitch } from "./HeroSwitch";

/**
 * FolderRuleRow — folder automation rule row.
 */
export function FolderRuleRow({
  path,
  isEnabled,
  lastProcessedAt,
  onToggle,
  onEdit,
  onDelete,
  isConfigOpen = false,
}: {
  path: string;
  isEnabled: boolean;
  lastProcessedAt?: string;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  isConfigOpen?: boolean;
}) {
  const { t } = useI18n();
  const displayName = path.split(/[/\\]/).pop() || path;

  return (
    <div className={isConfigOpen ? "surface-row folder-rule-row is-open" : "surface-row folder-rule-row"}>
      <Folder size={16} strokeWidth={1.75} className="text-default-500 shrink-0" />
      <div className="surface-copy flex-1">
        <p className="surface-title truncate" title={path}>
          {displayName}
        </p>
      </div>

      {lastProcessedAt && (
        <Tooltip>
          <Tooltip.Trigger>
            <span className="info-button">
              <Info size={14} strokeWidth={2} />
            </span>
          </Tooltip.Trigger>
          <Tooltip.Content>{t("automation.lastProcessed", { time: lastProcessedAt })}</Tooltip.Content>
        </Tooltip>
      )}

      <Button
        size="sm"
        variant="tertiary"
        isIconOnly
        onPress={onEdit}
        className="tool-icon-button config-toggle-button"
        data-open={isConfigOpen ? "true" : undefined}
        aria-label={t("automation.configureFolderRule")}
        aria-expanded={isConfigOpen}
      >
        <SlidersHorizontal size={17} strokeWidth={1.85} />
      </Button>

      <HeroSwitch
        size="sm"
        isSelected={isEnabled}
        onChange={onToggle}
      />

      <Button
        size="sm"
        variant="tertiary"
        isIconOnly
        className="tool-icon-button is-danger"
        onPress={onDelete}
        aria-label={t("automation.deleteFolderRule")}
      >
        <X size={15} strokeWidth={1.9} />
      </Button>
    </div>
  );
}
