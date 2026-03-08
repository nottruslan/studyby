import type { Transition, Variants } from "framer-motion";

/** Studby Motion System: strict spring (no bounce, iOS-like). */
export const SPRING_TRANSITION: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 17,
  mass: 1,
  bounce: 0,
};

/** Fade up reveal variant using SPRING_TRANSITION. */
export const FADE_UP_VARIANT: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: SPRING_TRANSITION,
  },
};
