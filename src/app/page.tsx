import HeroHeading from "@/components/HeroHeading";
import EmailForm from "@/components/EmailForm";

export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center">
      <section className="text-center">
        <HeroHeading />
        <EmailForm />
      </section>

      <footer className="fixed bottom-6 left-0 right-0 text-center text-[11px] text-neutral-400">
        © {new Date().getFullYear()} Voro. All rights reserved.
      </footer>
    </main>
  );
}

