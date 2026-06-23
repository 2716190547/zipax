import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

const appEase = [0.2, 0.8, 0.2, 1] as const;

export function PageTransition({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const heading = mainRef.current?.querySelector<HTMLElement>("h1");
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }, []);

  return (
    <motion.main
      ref={mainRef}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
      transition={{
        duration: reduceMotion ? 0.1 : 0.24,
        ease: appEase,
      }}
    >
      {children}
    </motion.main>
  );
}
