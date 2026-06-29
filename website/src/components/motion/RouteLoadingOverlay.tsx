import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ZipaxIcon } from "../ZipaxIcon";

type OverlayMode = "intro" | "route";

type RouteLoadingOverlayProps = {
  routeKey: string;
};

const introDuration = 1560;
const routeDuration = 1280;

export function RouteLoadingOverlay({ routeKey }: RouteLoadingOverlayProps) {
  const reduceMotion = useReducedMotion();
  const firstRun = useRef(true);
  const [visible, setVisible] = useState(true);
  const [mode, setMode] = useState<OverlayMode>(() => {
    const played = sessionStorage.getItem("zipax.introPlayed") === "true";
    return routeKey === "home" && !played ? "intro" : "route";
  });
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const played = sessionStorage.getItem("zipax.introPlayed") === "true";
    const nextMode: OverlayMode = firstRun.current && routeKey === "home" && !played ? "intro" : "route";
    firstRun.current = false;

    setMode(nextMode);
    setVisible(true);
    setCycle((value) => value + 1);
    if (nextMode === "intro") sessionStorage.setItem("zipax.introPlayed", "true");

    const duration = nextMode === "intro" ? introDuration : routeDuration;
    const timer = window.setTimeout(() => setVisible(false), duration);
    return () => window.clearTimeout(timer);
  }, [routeKey, reduceMotion]);

  const particles = useMemo(() => Array.from({ length: 12 }, (_, index) => index), []);
  const shards = useMemo(() => Array.from({ length: 5 }, (_, index) => index), []);
  const layers = useMemo(() => Array.from({ length: 4 }, (_, index) => index), []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="route-loading-overlay"
          data-mode={mode}
          key={cycle}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduceMotion ? 0.08 : 0.24, ease: [0.22, 1, 0.36, 1] } }}
          aria-hidden="true"
        >
          <span className="route-transition-layers">
            {layers.map((item) => <i key={item} style={{ "--layer-index": item } as CSSProperties} />)}
          </span>
          <span className="route-loading-veil" />
          <span className="route-loading-glow" />
          <span className="route-loading-shards">
            {shards.map((item) => <i key={item} style={{ "--shard-index": item } as CSSProperties} />)}
          </span>
          <span className="route-loading-particles">
            {particles.map((item) => <i key={item} style={{ "--particle-index": item } as CSSProperties} />)}
          </span>
          <span className="route-loading-brand">
            <span className="route-loading-logo">
              <ZipaxIcon variant="mono" decorative />
            </span>
            <span className="route-loading-word">zipax</span>
            <span className="route-loading-status">loading</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
