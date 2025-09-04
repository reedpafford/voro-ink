"use client";
import { useState } from "react";

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [t0] = useState(() => Date.now()); // for "too fast" spam guard

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    // basic validation
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) return setErr("Please enter a valid email.");

    // too-fast submission (likely bot)
    if (Date.now() - t0 < 1200) return setErr("Please try again.");

    setLoading(true);
    try {
      const r = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hp: "" }),
      });
      const j = await r.json();
      if (j.ok) setOk(true);
      else setErr("Something went wrong. Try again.");
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (ok) {
    return (
      <div className="mt-10 max-w-md mx-auto text-center space-y-3">
        <h2 className="text-2xl font-semibold">Thanks — check your inbox</h2>
        <p className="text-neutral-600">
          We’ve sent a short intake form to{" "}
          <span className="font-medium">{email}</span>. Fill it out so we can
          reply with the right plan and estimate.
        </p>
        <div aria-live="polite" className="sr-only">Email sent</div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-8 flex flex-col gap-3 max-w-md mx-auto"
      aria-label="Inquiry form"
    >
      <label htmlFor="email" className="text-sm text-neutral-500">
        work email
      </label>
      <input
        id="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-12 rounded-2xl border border-neutral-200 dark:border-neutral-800 px-4 bg-white/80 dark:bg-neutral-900/80 shadow-sm"
        required
      />
      {/* honeypot - hidden field to catch bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <button
        type="submit"
        disabled={loading}
        className="h-12 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium shadow hover:opacity-90 disabled:opacity-70"
      >
        {loading ? "Sending…" : "Send inquiry"}
      </button>
      {err && <p role="alert" className="text-red-600">{err}</p>}
      <p className="text-xs text-neutral-500">No spam. We’ll reply quickly.</p>

      <div aria-live="polite" className="sr-only">
        {err ? "Error" : ""}
      </div>
    </form>
  );
}
