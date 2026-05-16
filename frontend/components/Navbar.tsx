"use client";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Image Tools", href: "#image" },
  { label: "PDF Tools", href: "#pdf" },
  { label: "Word Tools", href: "#word" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 border-b border-[#2a2a35] bg-[#0f0f13]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-black tracking-tight text-white">
          Zip<span className="text-[#6c63ff]">Zop</span>
          <span className="ml-1 text-xs font-normal text-[#888899]">.tools</span>
        </Link>

        <div className="hidden gap-6 md:flex">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="text-sm text-[#888899] hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <button
          className="md:hidden text-[#888899]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
      {open && (
        <div className="border-t border-[#2a2a35] px-6 py-4 flex flex-col gap-4 md:hidden">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="text-sm text-[#888899]" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
