"use client";

import { useState } from "react";
import RotatingPitch from "@/components/RotatingPitch";
import EmailForm from "@/components/EmailForm";

export default function Page() {
  const [done, setDone] = useState(false);

  return (
    <main className="min-h-screen grid place-items-center">
      {!done ? (
        <section className="text-center container">
          {/* generous white space gives modern, calm feel */}
          <div className="mb-6">
            <RotatingPitch />
          </div>
          <EmailForm onSuccess={() => setDone(true)} />
        </section>
      ) : (
        <section className="text-center container">
          <h2 className="text-xl sm:text-2xl font-semibold">Thank you for reaching out</h2>
          <p className="mt-2 text-sm text-neutral-600">We have received your inquiry and will reach out shortly</p>
        </section>
      )}

      <footer className="fixed bottom-6 left-0 right-0 text-center fine">
        © {new Date().getFullYear()} Voro. All rights reserved.
      </footer>
    </main>
  );
}


