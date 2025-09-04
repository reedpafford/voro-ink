// src/components/HeroHeading.tsx
export default function HeroHeading() {
  return (
    <div className="text-center">
      <p className="mb-2 text-sm text-neutral-500">I want to</p>
      <h1 className="text-4xl sm:text-5xl font-black italic tracking-tight leading-tight">
        <span className="underline underline-offset-[6px] decoration-[3px] decoration-[rgb(var(--color-brand))]">
          better my brand.
        </span>
      </h1>
    </div>
  );
}
