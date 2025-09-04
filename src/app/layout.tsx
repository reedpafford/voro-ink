export const metadata = {
  title: "Voro",
  description: "Voro — design that converts.",
};

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* antialiased improves the crisp “modern” feel */}
      <body className="antialiased">{children}</body>
    </html>
  );
}

