import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";

// Replace ca-pub-XXXXXXXXXXXXXXXX with your actual AdSense publisher ID once approved
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID ?? "";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZipZop Tools — Free Image, PDF & Word Tools Online",
  description:
    "Compress images, merge PDFs, convert Word files and more — all free, fast, and in your browser. No sign-up required.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        {ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <Navbar />
        <main>{children}</main>
        <footer className="mt-24 py-8 text-center text-sm"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)", color: "var(--muted)" }}>
          © {new Date().getFullYear()} ZipZop.tools — Free online file tools. Files never leave your device.
        </footer>
      </body>
    </html>
  );
}
