import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voro — better my brand",
  description: "Voro helps brands ship cleaner UX, faster sites, and design that converts.",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

