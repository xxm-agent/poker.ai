import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "poker.ai — Texas Hold'em Coach",
  description: "Your intelligent Texas Hold'em coach. Hand charts, equity calculator, position strategy, and opponent profiling.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0D1117] text-white min-h-screen">{children}</body>
    </html>
  );
}
