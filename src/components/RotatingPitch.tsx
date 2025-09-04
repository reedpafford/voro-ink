"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ROTATION_LINES } from "@/lib/lines";

/**
 * Typewriter rotation:
 * - Types each phrase, waits, then moves to the next (no jitter)
 * - Always centered and capped to the same width as the email field (.stack)
 * - Underline stays teal; blinking caret while typing/paused
 */
export default function RotatingPitch() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const typingRef = useRef<number | null>(null);
  const pauseRef = useRef<number | null>(null);

  const current = useMemo(() => ROTATION_LINES[index], [index]);

  useEffect(() => {
    // Clear any prior timers when index changes/unmounts
    if (typingRef.current) clearInterval(typingRef.current);
    if (pauseRef.current) clearTimeout(pauseRef.current);

    if (reduce) {
      setTyped(current);
      pauseRef.current = window.setTimeout(() => {
        setIndex((i) => (i + 1) % ROTATION_LINES.length);
      }, 2200);
      return () => {
        if (pauseRef.current) clearTimeout(pauseRef.current);
      };
    }

    // Type characters in
    setTyped("");
    const chars = Array.from(current);
    let i = 0;
    const TYPE_MS = 34;          // typing speed
    const HOLD_MS = 1400;        // pause after fully typed

    typingRef.current = window.setInterval(() => {
      i++;
      setTyped(chars.slice(0, i).join(""));
      if (i >= chars.length && typingRef.current) {
        clearInterval(typingRef.current);
        pauseRef.current = window.setTimeout(() => {
          setIndex((x) => (x + 1) % ROTATION_LINES.length);
        }, HOLD_MS);
      }
    }, TYPE_MS);

    return () => {
      if (typingRef.current) clearInterval(typingRef.current);
      if (pauseRef.current) clearTimeout(pauseRef.current);
    };
  }, [current, reduce]);

  return (
    <div className="text-center stack">
      <p className="eyebrow mb-2">I want to</p>
      <h1 className="hero-title leading-tight">
        <span className="underline-brand">{typed}</span>
        {/* caret */}
        <span aria-hidden="true" className="caret" />
      </h1>
    </div>
  );
}








