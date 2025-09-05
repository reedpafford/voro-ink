import type { Metadata } from "next";
import { Suspense } from "react";
import FormClient from "./FormClient";

export const metadata: Metadata = {
  title: "Project Brief — Voro",
  description: "Tell us about your project.",
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center">
      <section className="container text-center">
        <div className="stack">
          <p className="eyebrow mb-2">Project brief</p>
        </div>

        <Suspense
          fallback={
            <div className="stack mt-6 text-center">
              <p className="fine">Loading…</p>
            </div>
          }
        >
          <FormClient />
        </Suspense>
      </section>

      <footer className="fixed bottom-6 left-0 right-0 text-center fine">
        © {new Date().getFullYear()} Voro. All rights reserved.
      </footer>
    </main>
  );
}
