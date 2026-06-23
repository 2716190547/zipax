import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const appEase = [0.2, 0.8, 0.2, 1] as const;

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
      initial={{ opacity: reduceMotion ? 1 : 0.2, y: reduceMotion ? 0 : 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14, margin: "0px 0px -8% 0px" }}
      transition={{ duration: reduceMotion ? 0.01 : 0.32, delay: reduceMotion ? 0 : delay, ease: appEase }}
    >
      {children}
    </Component>
  );
}
