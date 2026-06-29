import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

const appEase = [0.16, 1, 0.3, 1] as const;
const exitEase = [0.4, 0, 1, 1] as const;

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
      initial={{ opacity: 0, y: reduceMotion ? 0 : 35, filter: reduceMotion ? "none" : "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{
        opacity: 0,
        y: reduceMotion ? 0 : -35,
        filter: reduceMotion ? "none" : "blur(6px)",
        transition: { duration: reduceMotion ? 0.01 : 0.45, ease: exitEase },
      }}
      transition={{
        duration: reduceMotion ? 0.01 : 0.85,
        delay: reduceMotion ? 0 : 0.22,
        ease: appEase,
      }}
    >
      {children}
    </motion.main>
  );
}
