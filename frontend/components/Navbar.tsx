"use client";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "AI Tools", href: "#ai" },
  { label: "Image", href: "#image" },
  { label: "PDF", href: "#pdf" },
  { label: "Utility", href: "#utility" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b"
      style={{ background: "rgba(7,7,15,0.75)", borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-white">
            Zip<span style={{ color: "var(--accent)" }}>Zop</span>
          </span>
          <span className="hidden sm:block text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(108,99,255,0.15)", color: "var(--accent)", border: "1px solid rgba(108,99,255,0.3)" }}>
            .tools
          </span>
        </Link>

        <div className="hidden gap-1 md:flex">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href}
              className="text-sm px-3 py-1.5 rounded-lg transition-all"
              style={{ color: "var(--muted)" }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = "#fff"; (e.target as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = "var(--muted)"; (e.target as HTMLElement).style.background = "transparent"; }}>
              {l.label}
            </a>
          ))}
        </div>

        <button
          className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-px transition-all" style={{ background: "var(--muted)", transform: open ? "rotate(45deg) translate(2px, 2px)" : "none" }} />
          <span className="block h-px transition-all" style={{ background: "var(--muted)", width: open ? "20px" : "14px", opacity: open ? 0 : 1 }} />
          <span className="block w-5 h-px transition-all" style={{ background: "var(--muted)", transform: open ? "rotate(-45deg) translate(2px, -2px)" : "none" }} />
        </button>
      </div>

      {open && (
        <div className="md:hidden px-6 pb-5 pt-2 flex flex-col gap-1"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {navLinks.map((l) => (
            <a key={l.label} href={l.href}
              className="text-sm px-3 py-2 rounded-lg"
              style={{ color: "var(--muted)" }}
              onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
