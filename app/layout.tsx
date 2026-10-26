import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { ToastProvider } from "@/components/Toaster";
import "./globals.css";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Airdrop Guides Board",
  description: "Step-by-step airdrop guides, newest first.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
