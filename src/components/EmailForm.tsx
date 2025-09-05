"use client";

import { useState } from "react";

type Props = {
  onSuccess?: () => void; // optional callback invoked on successful submit
};

export default function EmailForm({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hp: "" }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.ok) {
        setErr("Something went wrong. Please try again.");
      } else {
        setSent(true);
        onSuccess?.(); // <-- notify parent (page.tsx)
      }
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <p className="fine mt-3 text-center">
        Thanks — check your email for the brief link.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-[560px] items-center gap-2"
    >
      <div className="relative flex-1">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          className="h-12 w-full rounded-[28px] border border-neutral-300 bg-white px-5 text-[15px] text-neutral-900 placeholder-neutral-500 placeholder:opacity-60 shadow-[inset_0_0_0_1px_rgba(255,255,255,.9)] focus:outline-none"
          style={{ colorScheme: "light" }}
          placeholder="work@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Work email"
        />
      </div>

      <button
        type="submit"
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm transition hover:shadow-md active:translate-y-[1px]"
        aria-label={loading ? "Sending…" : "Send"}
        disabled={loading}
      >
        {loading ? (
          <span className="spinner" aria-hidden="true" />
        ) : (
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
      </button>

      {err && <p role="alert" className="sr-only">{err}</p>}
    </form>
  );
}











