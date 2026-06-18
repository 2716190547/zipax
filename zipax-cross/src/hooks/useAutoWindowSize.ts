import { useEffect, useRef, type RefObject } from "react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { safeWarn } from "@/lib/utils";

const SIZE_TOLERANCE = 1;
const MIN_CONTENT_WIDTH = 430;
const MAX_CONTENT_WIDTH = 540;
const HEIGHT_CONSTRAINT_FLOOR = 120;
const HEIGHT_CONSTRAINT_CEILING = 900;

function readCssNumber(name: string) {
  const styles = getComputedStyle(document.documentElement);
  return Number.parseFloat(styles.getPropertyValue(name)) || 0;
}

function readContentWidth(element: HTMLElement) {
  const tabList = element.querySelector(".zipax-tab-list");
  const contentGap = readCssNumber("--zipax-gap");

  if (tabList instanceof HTMLElement) {
    return Math.ceil(Math.min(MAX_CONTENT_WIDTH, Math.max(MIN_CONTENT_WIDTH, tabList.scrollWidth + contentGap * 2)));
  }

  return Math.ceil(Math.min(MAX_CONTENT_WIDTH, Math.max(MIN_CONTENT_WIDTH, element.scrollWidth)));
}

function readContentSize(element: HTMLElement) {
  const width = readContentWidth(element);

  document.documentElement.style.setProperty("--zipax-content-width", `${width}px`);

  const shell = element.querySelector(".zipax-shell");
  const target = shell instanceof HTMLElement ? shell : element;
  const rect = target.getBoundingClientRect();
  return {
    width,
    height: Math.ceil(Math.max(rect.height, target.scrollHeight)),
  };
}

export function useAutoWindowSize(
  contentRef: RefObject<HTMLElement | null>,
  dependencies: readonly unknown[] = [],
) {
  const animationFrame = useRef<number | null>(null);
  const resizeTimer = useRef<number | null>(null);
  const isResizing = useRef(false);
  const pendingResize = useRef(false);
  const didShowWindow = useRef(false);
  const lastSize = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const appWindow = getCurrentWindow();
    let isDisposed = false;

    const resizeToContent = async () => {
      if (isResizing.current) {
        pendingResize.current = true;
        return;
      }
      isResizing.current = true;
      const content = contentRef.current;
      if (!content || isDisposed) {
        isResizing.current = false;
        return;
      }

      try {
        const contentSize = readContentSize(content);
        if (isDisposed) return;

        const shouldResize =
          Math.abs(contentSize.width - lastSize.current.width) > SIZE_TOLERANCE ||
          Math.abs(contentSize.height - lastSize.current.height) > SIZE_TOLERANCE;
        const targetSize = {
          width: contentSize.width,
          height: contentSize.height,
        };

        if (shouldResize) {
          await appWindow.setSizeConstraints({
            minWidth: contentSize.width,
            maxWidth: contentSize.width,
            minHeight: HEIGHT_CONSTRAINT_FLOOR,
            maxHeight: HEIGHT_CONSTRAINT_CEILING,
          });
          await appWindow.setSize(new LogicalSize(targetSize.width, targetSize.height));
          await appWindow.setSizeConstraints({
            minWidth: contentSize.width,
            maxWidth: contentSize.width,
            minHeight: targetSize.height,
            maxHeight: targetSize.height,
          });
          lastSize.current = contentSize;
        }

        if (!didShowWindow.current) {
          await appWindow.show();
          didShowWindow.current = true;
          pendingResize.current = true;
        }
      } finally {
        isResizing.current = false;
        if (pendingResize.current && !isDisposed) {
          pendingResize.current = false;
          syncWindowSize();
        }
      }
    };

    const syncWindowSize = () => {
      if (animationFrame.current != null) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (resizeTimer.current != null) {
        window.clearTimeout(resizeTimer.current);
      }

      resizeTimer.current = window.setTimeout(() => {
        animationFrame.current = requestAnimationFrame(() => {
          resizeToContent()
            .catch((error) => {
              safeWarn("Failed to sync zipax window size", error);
              if (!didShowWindow.current) {
                appWindow.show().catch((showError) => {
                  safeWarn("Failed to show zipax window", showError);
                });
                didShowWindow.current = true;
              }
            });
        });
      }, 16);
    };

    const observer = new ResizeObserver(syncWindowSize);
    const content = contentRef.current;
    if (content) {
      observer.observe(content);
      content.addEventListener("animationend", syncWindowSize);
    }

    syncWindowSize();
    window.addEventListener("zipax:resize", syncWindowSize);

    return () => {
      isDisposed = true;
      observer.disconnect();
      content?.removeEventListener("animationend", syncWindowSize);
      window.removeEventListener("zipax:resize", syncWindowSize);
      if (animationFrame.current != null) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (resizeTimer.current != null) {
        window.clearTimeout(resizeTimer.current);
      }
    };
  }, dependencies);
}
