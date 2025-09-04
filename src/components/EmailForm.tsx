"use client";

import { useState } from "react";

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [t0] = useState(() => Date.now()); // anti-bot: too-fast guard

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
      setOk(!!j.ok);
      if (!j.ok) setErr("Something went wrong. Try again.");
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (ok) {
    return (
      <div className="w-full text-center mt-10">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Thank you for reaching out
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          We have received your inquiry and will reach out shortly
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 w-full max-w-xl mx-auto"
      aria-label="Inquiry form"
    >
      {/* Input + round submit button */}
      <div className="flex items-center gap-2">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="work@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 flex-1 rounded-full border border-neutral-300 px-5 bg-white/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          required
        />
        <button
          type="submit"
          disabled={loading}
          aria-label="Send inquiry"
          className="shrink-0 h-10 w-10 rounded-full bg-neutral-900 text-white grid place-items-center shadow hover:opacity-90 disabled:opacity-70"
          onClick={() => void 0}
        >
          {/* Arrow icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {err && (
        <p role="alert" className="mt-2 text-sm text-red-600 text-center">
          {err}
        </p>
      )}

      <p className="mt-3 text-center text-[11px] text-neutral-400">
        No spam. We’ll reply quickly.
      </p>

      {/* submit when pressing Enter in the field */}
      <input type="submit" hidden onClick={() => submit()} />
    </form>
  );
}

