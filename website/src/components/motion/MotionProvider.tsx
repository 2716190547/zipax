import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

const appEase = [0.2, 0.8, 0.2, 1] as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.18, ease: appEase }}>
      {children}
    </MotionConfig>
  );
}
