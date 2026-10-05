import { Button, Tooltip } from "@heroui/react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, X } from "@/components/icons";

export function WindowControls() {
  const appWindow = getCurrentWindow();

  return (
    <div className="window-controls" aria-label="窗口控制">
      <Tooltip delay={350}>
        <Tooltip.Trigger>
          <Button
            isIconOnly
            size="md"
            variant="tertiary"
            className="window-control-button"
            aria-label="最小化"
            onPress={() => {
              appWindow.minimize().catch((error) => {
                console.warn("Failed to minimize window", error);
              });
            }}
          >
            <Minus size={16} strokeWidth={2.1} />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>最小化</Tooltip.Content>
      </Tooltip>
      <Tooltip delay={350}>
        <Tooltip.Trigger>
          <Button
            isIconOnly
            size="md"
            variant="tertiary"
            className="window-control-button"
            aria-label="关闭"
            onPress={() => {
              appWindow.close().catch((error) => {
                console.warn("Failed to close window", error);
              });
            }}
          >
            <X size={16} strokeWidth={2.1} />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>关闭</Tooltip.Content>
      </Tooltip>
    </div>
  );
}
