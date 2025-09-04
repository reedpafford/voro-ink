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
    if (!reduce) setTimeout(() => setShowCheck(true), 220);

    try {
      const r = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hp: "" }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error("bad");
      setTimeout(() => onSuccess?.(), reduce ? 0 : 1000);
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

        <div className="relative shrink-0 h-10 w-10 group">
          <button
            type="submit"
            aria-label="Send inquiry"
            disabled={launched}
            onClick={() => submit()}
            className={`btn-circle absolute inset-0 ${launched ? "sent" : ""}`}
          >
            {!launched && (
              <span className="relative z-[2] inline-block transition-[opacity,transform] duration-200 ease-out group-active:translate-x-[2px] group-hover:translate-x-[2px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </button>

          {!reduce && showCheck && (
            <span className="pointer-events-none absolute inset-0 m-auto grid place-items-center">
              <motion.svg
                key="check"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ position: "relative", zIndex: 2 }}
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









