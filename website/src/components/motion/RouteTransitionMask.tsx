import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type RouteTransitionMaskProps = {
  active: boolean;
  transitionId: number;
};

export function RouteTransitionMask({ active, transitionId }: RouteTransitionMaskProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={transitionId}
          className="route-transition-mask"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.08 } }}
          aria-hidden="true"
        >
          <span className="editorial-veil editorial-veil-front" />
          <span className="editorial-veil editorial-veil-back" />
          <span className="editorial-veil-grain" />
          <span className="editorial-veil-logo" aria-hidden="true">
            <span className="editorial-veil-logo-mark" />
            <span className="editorial-veil-logo-ring" />
          </span>
          <span className="editorial-veil-line editorial-veil-line-one" />
          <span className="editorial-veil-line editorial-veil-line-two" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
