"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [t0] = useState(() => Date.now());
  const [pulse, setPulse] = useState(0);          // ripple trigger
  const [launched, setLaunched] = useState(false); // paper plane launch
  const reduce = useReducedMotion();

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setErr(null);

    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) return setErr("Please enter a valid email.");
    if (Date.now() - t0 < 1200) return setErr("Please try again.");

    setLoading(true);
    try {
      const r = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hp: "" }),
      });
      const j = await r.json();
      if (j.ok) {
        setLaunched(true);
        setTimeout(() => setOk(true), reduce ? 0 : 550);
      } else {
        setErr("Something went wrong. Try again.");
      }
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (ok) {
    return (
      <div className="w-full text-center mt-10">
        <h2 className="text-xl sm:text-2xl font-semibold">Thank you for reaching out</h2>
        <p className="mt-2 text-sm text-neutral-600">
          We have received your inquiry and will reach out shortly
        </p>
        <div aria-live="polite" className="sr-only">Email sent</div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 w-full max-w-xl mx-auto" aria-label="Inquiry form">
      <div className="flex items-center gap-2">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="work@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="
            h-12 flex-1 rounded-full border border-neutral-300 px-5 bg-white/80 shadow-sm
            focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/10
          "
          required
        />

        {/* Wrapper handles hover/active scale & contains all visuals */}
        <div className="relative shrink-0 h-10 w-10 group">
          {/* The real clickable element (plain button = no TS friction) */}
          <button
            type="submit"
            disabled={loading || launched}
            aria-label="Send inquiry"
            onClick={() => setPulse((p) => p + 1)}
            className="
              absolute inset-0 rounded-full bg-neutral-900 text-white grid place-items-center
              shadow overflow-visible transition-transform
              hover:scale-[1.06] active:scale-[0.94] disabled:opacity-80
            "
          >
            {/* Arrow icon (slides with CSS on hover/active) */}
            <span className="relative z-10 inline-block transition-transform group-hover:translate-x-[2px] group-active:translate-x-[3px]">
              {!launched && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12h12M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>

            {/* Speed trail (CSS width animation on hover/active) */}
            {!launched && (
              <span
                className="
                  pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-[2px] rounded-full
                  w-0 group-hover:w-[10px] active:w-[12px] transition-all duration-200
                "
                style={{ backgroundColor: "rgb(var(--color-brand))" }}
              />
            )}

            {/* Loading spinner (hidden once launched) */}
            {loading && !launched && (
              <span className="absolute inset-0 m-auto h-4 w-4">
                <svg className="h-4 w-4 animate-spin text-white/80" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                  <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z" />
                </svg>
              </span>
            )}
          </button>

          {/* Paper plane launch on success (Framer; no className on motion.*) */}
          {!reduce && (
            <span className="pointer-events-none absolute inset-0 m-auto">
              <motion.svg
                key={launched ? "plane" : "plane-idle"}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.6, rotate: -15, x: 0, y: 0 }}
                animate={
                  launched
                    ? { opacity: [0, 1, 0], x: [0, 14, 36], y: [0, -12, -24], scale: [0.8, 1, 0.9], rotate: [-15, -10, -10] }
                    : { opacity: 0 }
                }
                transition={{ duration: 0.55, ease: "easeOut" }}
                style={{ display: "block", margin: "auto" }}
              >
                <path
                  d="M22 3 13 21l-3.5-8.2L2 9l20-6Zm0 0L9.5 14.5"
                  stroke="rgb(255,255,255)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </span>
          )}

          {/* Ripple ring on click (Framer; no className on motion.*) */}
          {!reduce && (
            <span className="pointer-events-none absolute inset-0 rounded-full">
              <motion.span
                key={pulse}
                initial={{ opacity: 0.25, scale: 0.4 }}
                animate={{ opacity: 0, scale: 1.6 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "9999px",
                  border: "2px solid rgb(var(--color-brand))",
                  display: "block",
                }}
              />
            </span>
          )}
        </div>
      </div>

      {err && (
        <p role="alert" className="mt-2 text-sm text-red-600 text-center">
          {err}
        </p>
      )}
      <p className="mt-3 text-center text-[11px] text-neutral-400">No spam. We’ll reply quickly.</p>

      {/* Enter key submit fallback */}
      <input type="submit" hidden onClick={() => submit()} />
    </form>
  );
}




