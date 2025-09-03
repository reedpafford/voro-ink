import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: process.env.SITE_NAME ?? "Voro",
  description: "Voro — inquiry landing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
