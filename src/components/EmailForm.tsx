"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function EmailForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState("");
  const [launched, setLaunched] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [t0] = useState(() => Date.now());
  const reduce = useReducedMotion();

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (launched) return;

    setErr(null);
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) return setErr("Please enter a valid email.");
    if (Date.now() - t0 < 900) return setErr("Please try again.");

    setLaunched(true);
    if (!reduce) setTimeout(() => setShowCheck(true), 900); // slower so users see it

    try {
      const r = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hp: "" }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error("bad");
      setTimeout(() => onSuccess?.(), reduce ? 0 : 1500);
    } catch {
      setLaunched(false);
      setShowCheck(false);
      setErr("Something went wrong. Try again.");
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 w-full stack">
      <div className="flex items-center gap-2">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="work@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pill-input"
          required
        />

        {/* button wrapper (CSS hover/active; Framer for plane/check only) */}
        <div className="relative shrink-0 h-10 w-10 group">
          <button
            type="submit"
            aria-label="Send inquiry"
            disabled={launched}
            onClick={() => submit()}
            className="btn-circle absolute inset-0"
          >
            {!launched && (
              <span className="relative z-10 inline-block transition-transform group-hover:translate-x-[2px] group-active:translate-x-[3px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
            {!launched && (
              <span
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-[2px] w-0 rounded-full transition-all duration-200 group-hover:w-[10px] group-active:w-[12px]"
                style={{ backgroundColor: "rgb(var(--color-brand))" }}
              />
            )}
          </button>

          {/* slower plane */}
          {!reduce && (
            <span className="pointer-events-none absolute inset-0 m-auto">
              <motion.svg
                key={launched ? "plane" : "plane-idle"}
                width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                initial={{ opacity: 0, scale: 0.6, rotate: -15, x: 0, y: 0 }}
                animate={
                  launched
                    ? { opacity: [0, 1, 0], x: [0, 16, 44], y: [0, -14, -30], scale: [0.85, 1, 0.9], rotate: [-15, -10, -10] }
                    : { opacity: 0 }
                }
                transition={{ duration: 0.9, ease: "easeOut" }}
                style={{ display: "block", margin: "auto" }}
              >
                <path d="M22 3 13 21l-3.5-8.2L2 9l20-6Zm0 0L9.5 14.5" stroke="rgb(255,255,255)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </motion.svg>
            </span>
          )}

          {/* brief sent check */}
          {!reduce && showCheck && (
            <span className="pointer-events-none absolute inset-0 m-auto grid place-items-center">
              <motion.svg
                key="check"
                width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <path d="M20 6 9 17l-5-5" stroke="rgb(255,255,255)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </span>
          )}
        </div>
      </div>

      {err && <p role="alert" className="mt-2 text-sm text-red-600 text-center">{err}</p>}
      <p className="mt-3 text-center fine">No spam. We’ll reply quickly.</p>
    </form>
  );
}







