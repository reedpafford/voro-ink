// src/app/i/page.tsx  (SERVER component)

export const dynamic = "force-dynamic"; // ok on server file; prevents prerender/SSG

import { Suspense } from "react";
import IntakeClient from "./IntakeClient";

export default function Page() {
  return (
    <Suspense fallback={<main className="container py-16"><p>Loading…</p></main>}>
      <IntakeClient />
    </Suspense>
  );
}
