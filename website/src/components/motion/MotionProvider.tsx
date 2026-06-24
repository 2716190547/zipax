import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

const appEase = [0.16, 1, 0.3, 1] as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.24, ease: appEase }}>
      {children}
    </MotionConfig>
  );
}
