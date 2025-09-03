// src/app/i/IntakeClient.tsx  (CLIENT component)
"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

const PROJECT_TYPES = ["Website Redesign","UX Audit","CRO","New Build","Design System","Research"];
const BUDGETS = ["<$2.5k","$2.5–5k","$5–10k","$10–25k","$25k+"];
const TIMELINES = ["ASAP (<2w)","2–4w","1–3m","3m+"];

export default function IntakeClient() {
  const sp = useSearchParams();
  const token = sp.get("token") || "";

  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [projectType, setProjectType] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [goals, setGoals] = useState("");
  const [sent, setSent] = useState<null | "ok" | "err">(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, company, website, projectType, budget, timeline, goals })
      });
      const j = await r.json();
      setSent(j.ok ? "ok" : "err");
    } catch {
      setSent("err");
    }
  }

  if (!token) {
    return (
      <main className="container py-24">
        <p className="text-red-600">Invalid or missing link. Please open the link from your email.</p>
      </main>
    );
  }

  return (
    <main className="container py-16">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Quick intake</h1>
      <p className="text-sm text-neutral-500 mb-8">2–3 minutes. This helps us reply with the right plan and estimate.</p>

      <form onSubmit={onSubmit} className="max-w-2xl grid gap-5">
        <div>
          <label className="block text-sm mb-1">Company</label>
          <input className="w-full h-11 rounded-2xl border border-neutral-200 dark:border-neutral-800 px-4"
                 value={company} onChange={e=>setCompany(e.target.value)} placeholder="Acme Inc." />
        </div>
        <div>
          <label className="block text-sm mb-1">Website</label>
          <input type="url" className="w-full h-11 rounded-2xl border border-neutral-200 dark:border-neutral-800 px-4"
                 value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://acme.com" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Project type</label>
            <select className="w-full h-11 rounded-2xl border border-neutral-200 dark:border-neutral-800 px-3"
                    value={projectType} onChange={e=>setProjectType(e.target.value)}>
              <option value="">Select…</option>
              {PROJECT_TYPES.map(p=> <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Budget</label>
            <select className="w-full h-11 rounded-2xl border border-neutral-200 dark:border-neutral-800 px-3"
                    value={budget} onChange={e=>setBudget(e.target.value)}>
              <option value="">Select…</option>
              {BUDGETS.map(p=> <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Timeline</label>
            <select className="w-full h-11 rounded-2xl border border-neutral-200 dark:border-neutral-800 px-3"
                    value={timeline} onChange={e=>setTimeline(e.target.value)}>
              <option value="">Select…</option>
              {TIMELINES.map(p=> <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Goals / context</label>
          <textarea className="w-full min-h-[120px] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4"
                    value={goals} onChange={e=>setGoals(e.target.value)}
                    placeholder="What problem are we solving? Targets, success metrics, constraints." />
        </div>

        <button className="h-12 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium">Submit</button>
        {sent === "ok" && <p className="text-emerald-600">Thanks! We’ll review and reply shortly.</p>}
        {sent === "err" && <p className="text-red-600">Something went wrong. Reply to the email and we’ll take it from there.</p>}
      </form>
    </main>
  );
}
