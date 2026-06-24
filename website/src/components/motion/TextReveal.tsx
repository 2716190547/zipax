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
      initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.56, delay: reduceMotion ? 0 : delay, ease: textEase }}
    >
      {children}
    </motion.div>
  );
}
