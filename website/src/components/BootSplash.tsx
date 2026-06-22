import { useEffect, useState } from "react";
import { ZipaxWordmark } from "./ZipaxWordmark";

const minSplashMs = 500;

export function BootSplash() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const started = performance.now();

    const hide = () => {
      const remaining = Math.max(0, minSplashMs - (performance.now() - started));
      window.setTimeout(() => {
        if (!mounted) return;
        setLeaving(true);
        window.setTimeout(() => {
          if (mounted) setVisible(false);
        }, 360);
      }, remaining);
    };

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide, { once: true });
    }

    return () => {
      mounted = false;
      window.removeEventListener("load", hide);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={leaving ? "boot-splash is-leaving" : "boot-splash"} aria-label="zipax loading">
      <ZipaxWordmark className="boot-splash-wordmark" size="display" iconVariant="full" />
    </div>
  );
}
