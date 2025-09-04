"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ROTATION_LINES } from "@/lib/lines";

/** Small “I want to”, rotating forever with a subtle rotate+glide and teal underline sweep. */
export default function RotatingPitch() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const delay = 2600; // how long each phrase stays on screen

  useEffect(() => {
    const t = setTimeout(() => setIndex((i) => (i + 1) % ROTATION_LINES.length), delay);
    return () => clearTimeout(t);
  }, [index]);

  const current = useMemo(() => ROTATION_LINES[index], [index]);

  return (
    <div className="text-center">
      <p className="eyebrow mb-2">I want to</p>

      <span className="relative inline-block align-bottom">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={current}
            initial={
              reduce
                ? { opacity: 0 }
                : { y: 10, rotate: 3, opacity: 0 }
            }
            animate={
              reduce
                ? { opacity: 1 }
                : { y: 0, rotate: 0, opacity: 1 }
            }
            exit={
              reduce
                ? { opacity: 0 }
                : { y: -10, rotate: -3, opacity: 0 }
            }
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <span className="hero-title">{current}</span>
          </motion.span>
        </AnimatePresence>

        {/* Teal underline (sweeps each change) */}
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
            transition={{ duration: 0.40, ease: "easeOut" }}
          />
        </span>
      </span>
    </div>
  );
}






