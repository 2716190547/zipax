import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const textEase = [0.16, 1, 0.3, 1] as const;

type TextRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function TextReveal({ children, className, delay = 0 }: TextRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`text-reveal ${className ?? ""}`.trim()}
      initial={reduceMotion ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: false, amount: 0.18, margin: "0px 0px -18% 0px" }}
      transition={{ duration: reduceMotion ? 0.01 : 0.72, delay: reduceMotion ? 0 : delay, ease: textEase }}
    >
      {children}
    </motion.div>
  );
}
