import RotatingPitch from "@/components/RotatingPitch";
import EmailForm from "@/components/EmailForm";

export default function Page() {
  return (
    <main className="container min-h-screen grid place-items-center">
      <section className="py-24 text-center">
        <div className="space-y-6">
          <RotatingPitch />
          <EmailForm />
        </div>
      </section>
      <footer className="absolute bottom-6 left-0 right-0 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {process.env.SITE_NAME ?? "Voro"}. All rights reserved.
      </footer>
    </main>
  );
}
