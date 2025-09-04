"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ROTATION_LINES } from "@/lib/lines";

/** Rotates forever with a subtle rotate+glide; width capped to match the email field. */
export default function RotatingPitch() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const dwell = 3200; // stays longer

  useEffect(() => {
    const t = setTimeout(() => setIndex((i) => (i + 1) % ROTATION_LINES.length), dwell);
    return () => clearTimeout(t);
  }, [index]);

  const current = useMemo(() => ROTATION_LINES[index], [index]);

  return (
    <div className="text-center stack">
      <p className="eyebrow mb-2">I want to</p>

      {/* make the phrase block the same width as the field below */}
      <div className="relative w-full mx-auto">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={current}
            initial={reduce ? { opacity: 0 } : { y: 10, rotate: 2.5, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { y: 0, rotate: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: -10, rotate: -2.5, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <span className="hero-title underline-brand block">{current}</span>
          </motion.span>
        </AnimatePresence>

        {/* teal sweep underline managed by the text decoration above; if you prefer the sweep bar, we can restore it */}
      </div>
    </div>
  );
}







