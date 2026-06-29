import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const appEase = [0.16, 1, 0.3, 1] as const;

type SectionRevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
  delay?: number;
  "aria-label"?: string;
};

export function SectionReveal(props: SectionRevealProps) {
  const { children, className, as = "section", delay = 0, "aria-label": ariaLabel } = props;
  const reduceMotion = useReducedMotion();
  const Component = as === "div" ? motion.div : motion.section;

  return (
    <Component
      className={className}
      aria-label={ariaLabel}
      initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.08, margin: "12% 0px -22% 0px" }}
      transition={{ duration: reduceMotion ? 0.01 : 0.66, delay: reduceMotion ? 0 : delay, ease: appEase }}
    >
      {children}
    </Component>
  );
}
