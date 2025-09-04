"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ROTATION_LINES } from "@/lib/lines";

/** Small “I want to”, rotating phrase with teal underline sweep. */
export default function RotatingPitch() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const last = ROTATION_LINES.length - 1;

  useEffect(() => {
    if (index >= last) return; // stop at the final phrase
    const t = setTimeout(() => setIndex((i) => i + 1), 1400);
    return () => clearTimeout(t);
  }, [index, last]);

  const current = useMemo(() => ROTATION_LINES[Math.min(index, last)], [index, last]);

  return (
    <div className="text-center">
      <p className="eyebrow mb-2">I want to</p>

      <span className="relative inline-block align-bottom">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={current}
            initial={reduce ? { opacity: 0 } : { y: 10, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: -10, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <span className="hero-title">{current}</span>
          </motion.span>
        </AnimatePresence>

        {/* Teal sweep underline (kept outside motion for clean TS types) */}
        <span className="pointer-events-none absolute left-0 -bottom-1 h-[3px] w-full rounded-full overflow-hidden">
          <motion.span
            key={`u-${current}`}
            style={{
              backgroundColor: "rgb(var(--color-brand))",
              width: "100%",
              height: "100%",
              transformOrigin: "left",
              display: "block",
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </span>
      </span>
    </div>
  );
}





