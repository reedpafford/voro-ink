"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type Mode = "idle" | "sending" | "success" | "error";

export default function FormClient() {
  const params = useSearchParams();
  const presetEmail = params.get("email") || "";
  const token = params.get("t") || params.get("token") || ""; // <-- carry token to API

  const [mode, setMode] = useState<Mode>("idle");
  const [apiError, setApiError] = useState<string | null>(null);

  // fields
  const [email, setEmail] = useState(presetEmail);
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [goals, setGoals] = useState("");
  const [details, setDetails] = useState("");

  const disabled = useMemo(() => mode === "sending", [mode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "sending") return;

    setMode("sending");
    setApiError(null);

    try {
      const r = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, // <-- include token when present
          email, // API will prefer token->email, but allows plain email too
          fullName,
          company,
          website,
          budget,
          timeline,
          goals,
          details,
        }),
      });
      const j = await r.json().catch(() => ({}));

      if (!r.ok || !j?.ok) {
        setMode("error");
        setApiError(j?.error || "Something went wrong. Please try again.");
        return;
      }
      setMode("success");
    } catch {
      setMode("error");
      setApiError("Network error. Please try again.");
    }
  }

  function reset() {
    setMode("idle");
    setApiError(null);
    setFullName("");
    setCompany("");
    setWebsite("");
    setBudget("");
    setTimeline("");
    setGoals("");
    setDetails("");
    if (!presetEmail) setEmail("");
  }

  // Success screen
  if (mode === "success") {
    return (
      <div className="mt-10 text-center stack">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(17,17,17)] text-white shadow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mt-3 text-xl font-semibold">Thanks — your brief is in</h2>
        <p className="mt-1 fine">We’ll review and reach out as soon as possible.</p>

        <button
          onClick={reset}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-300 bg-white text-[15px] font-medium hover:bg-neutral-50 transition"
          style={{ colorScheme: "light" }}
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 w-full stack text-left">
      <div className="grid grid-cols-1 gap-3">
        <label className="text-sm">
          <span className="block mb-1 text-neutral-600">Email</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            className="w-full h-11 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 placeholder:opacity-60 px-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,.9)] focus:outline-none"
            style={{ colorScheme: "light" }}
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={!token}
            disabled={disabled}
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="block mb-1 text-neutral-600">Full name</span>
            <input
              className="w-full h-11 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 placeholder:opacity-60 px-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,.9)] focus:outline-none"
              style={{ colorScheme: "light" }}
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={disabled}
            />
          </label>

          <label className="text-sm">
            <span className="block mb-1 text-neutral-600">Company</span>
            <input
              className="w-full h-11 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 placeholder:opacity-60 px-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,.9)] focus:outline-none"
              style={{ colorScheme: "light" }}
              placeholder="Acme Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              disabled={disabled}
            />
          </label>
        </div>

        <label className="text-sm">
          <span className="block mb-1 text-neutral-600">Website</span>
          <input
            className="w-full h-11 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 placeholder:opacity-60 px-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,.9)] focus:outline-none"
            style={{ colorScheme: "light" }}
            placeholder="https://"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            disabled={disabled}
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="block mb-1 text-neutral-600">Budget</span>
            <select
              className="w-full h-11 rounded-xl border border-neutral-300 bg-white text-neutral-900 px-4 focus:outline-none"
              style={{ colorScheme: "light" }}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              disabled={disabled}
            >
              <option value="">Select…</option>
              <option value="<$2k">&lt; $2k</option>
              <option value="$2k–$5k">$2k–$5k</option>
              <option value="$5k–$10k">$5k–$10k</option>
              <option value="$10k+">$10k+</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="block mb-1 text-neutral-600">Timeline</span>
            <select
              className="w-full h-11 rounded-xl border border-neutral-300 bg-white text-neutral-900 px-4 focus:outline-none"
              style={{ colorScheme: "light" }}
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              disabled={disabled}
            >
              <option value="">Select…</option>
              <option value="ASAP">ASAP</option>
              <option value="2–4 weeks">2–4 weeks</option>
              <option value="1–2 months">1–2 months</option>
              <option value="Flexible">Flexible</option>
            </select>
          </label>
        </div>

        <label className="text-sm">
          <span className="block mb-1 text-neutral-600">Primary goals</span>
          <input
            className="w-full h-11 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 placeholder:opacity-60 px-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,.9)] focus:outline-none"
            style={{ colorScheme: "light" }}
            placeholder="e.g., increase conversions, modernize brand"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            required
            disabled={disabled}
          />
        </label>

        <label className="text-sm">
          <span className="block mb-1 text-neutral-600">Anything else?</span>
          <textarea
            className="w-full min-h-[120px] rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 placeholder:opacity-60 p-4 focus:outline-none"
            style={{ colorScheme: "light" }}
            placeholder="Useful links, competitors, constraints, success metrics…"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            disabled={disabled}
          />
        </label>

        {/* FULL-WIDTH SUBMIT BUTTON (same width & radius as inputs) */}
        <button
          type="submit"
          className={`mt-2 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-neutral-900 text-white text-[15px] font-medium shadow-sm transition ${
            disabled ? "opacity-70" : "hover:translate-y-[-1px] hover:shadow-md active:translate-y-[0px]"
          }`}
          disabled={disabled}
          aria-label={mode === "sending" ? "Sending…" : "Submit brief"}
          style={{ colorScheme: "light" }}
        >
          {mode === "sending" ? (
            <span className="spinner" aria-hidden="true" />
          ) : (
            <>
              <span>Send brief</span>
              <svg className="ml-2" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
      </div>

      {mode === "error" && (
        <p role="alert" className="mt-3 text-sm text-red-600 text-center">
          {apiError ?? "Something went wrong. Please try again."}
        </p>
      )}
    </form>
  );
}


