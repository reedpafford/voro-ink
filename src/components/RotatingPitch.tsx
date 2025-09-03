"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ROTATION_LINES } from "@/lib/lines";

export default function RotatingPitch({ onLocked }: { onLocked?: () => void }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const finalIndex = ROTATION_LINES.length - 1;
  const isLocked = index >= finalIndex;

  useEffect(() => {
    if (isLocked) { onLocked?.(); return; }
    const t = setTimeout(() => setIndex((i) => i + 1), 1400);
    return () => clearTimeout(t);
  }, [index, isLocked, onLocked]);

  const current = useMemo(() => ROTATION_LINES[Math.min(index, finalIndex)], [index, finalIndex]);

  return (
    <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight text-center">
      <span>i want to </span>
      <span className="inline-block" aria-live="polite" aria-atomic>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={current}
            initial={reduce ? { opacity: 0 } : { y: 12, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: -12, opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            {/* style the inner span instead of motion.span to avoid TS type friction */}
            <span className="underline decoration-[rgb(var(--brand))] decoration-4 underline-offset-4">
              {current}
            </span>
          </motion.span>
        </AnimatePresence>
      </span>
    </h1>
  );
}


