import Link from "next/link";
import AdBanner from "@/components/AdBanner";

const TOOLS = [
  {
    category: "AI / Smart Tools",
    label: "AI",
    id: "ai",
    badge: "NEW",
    items: [
      { label: "Remove Background", desc: "AI removes bg instantly — free", href: "/tools/remove-background" },
      { label: "Image to Text (OCR)", desc: "Extract text from any image", href: "/tools/image-to-text" },
      { label: "Image Upscaler", desc: "2x / 4x enlarge without blur", href: "/tools/image-upscale" },
      { label: "Video to GIF", desc: "Convert video clips to GIF", href: "/tools/video-to-gif" },
    ],
  },
  {
    category: "Image Tools",
    label: "IMAGE",
    id: "image",
    items: [
      { label: "Compress Image", desc: "Reduce file size, keep quality", href: "/tools/compress-image" },
      { label: "Resize Image", desc: "Change dimensions precisely", href: "/tools/resize-image" },
      { label: "Convert Format", desc: "JPG to PNG to WebP", href: "/tools/convert-image" },
      { label: "Passport Photo", desc: "35x45mm, 51x51mm and more", href: "/tools/passport-photo" },
      { label: "Image to PDF", desc: "Combine images into one PDF", href: "/tools/image-to-pdf" },
      { label: "Favicon Generator", desc: "All sizes from one image", href: "/tools/favicon-generator" },
    ],
  },
  {
    category: "PDF Tools",
    label: "PDF",
    id: "pdf",
    items: [
      { label: "Compress PDF", desc: "Shrink PDF file size", href: "/tools/compress-pdf" },
      { label: "Merge PDFs", desc: "Combine multiple PDFs into one", href: "/tools/merge-pdf" },
      { label: "Split PDF", desc: "Extract pages or split by range", href: "/tools/split-pdf" },
      { label: "PDF to Images", desc: "Convert each page to JPG", href: "/tools/pdf-to-images" },
      { label: "Watermark PDF", desc: "Add text watermark to PDF", href: "/tools/watermark-pdf" },
      { label: "Rotate PDF", desc: "Rotate pages 90 / 180 / 270 deg", href: "/tools/rotate-pdf" },
    ],
  },
  {
    category: "QR & Utility",
    label: "UTILITY",
    id: "utility",
    items: [
      { label: "QR Code Generator", desc: "Generate QR from any URL or text", href: "/tools/qr-generate" },
      { label: "QR Code Reader", desc: "Scan QR code from an image", href: "/tools/qr-read" },
      { label: "Word to Text", desc: "Extract plain text from DOCX", href: "/tools/word-to-text" },
    ],
  },
];

const STATS = [
  { value: "20+", label: "Free Tools" },
  { value: "0", label: "Sign-ups needed" },
  { value: "100%", label: "Browser-based" },
  { value: "0 KB", label: "Files uploaded" },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">

      {/* Hero */}
      <div className="text-center mb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8"
          style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.25)", color: "var(--accent)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#6c63ff] animate-pulse" />
          20+ tools — all free, all in your browser
        </div>

        <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 tracking-tight leading-[1.05]">
          Every file tool<br />
          <span style={{ background: "linear-gradient(135deg, #6c63ff 0%, #a78bfa 50%, #3ea8ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            you&apos;ll ever need.
          </span>
        </h1>

        <p className="text-lg max-w-lg mx-auto mb-10" style={{ color: "var(--muted)" }}>
          Compress, convert, upscale, remove backgrounds, generate QR codes — no sign-up, no upload, no cost.
        </p>

        <a href="#ai"
          className="btn-primary text-base px-8 py-3 rounded-xl inline-block">
          Explore Tools
        </a>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-24">
        {STATS.map((s) => (
          <div key={s.label} className="glass text-center py-5 px-4">
            <div className="text-2xl font-black text-white mb-1">{s.value}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Ad banner */}
      <AdBanner slot="homepage-top" format="horizontal" className="mb-16" />

      {/* Tool sections */}
      {TOOLS.map((section) => (
        <section key={section.id} id={section.id} className="mb-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-label">{section.label}</div>
            <h2 className="text-xl font-bold text-white">{section.category}</h2>
            {"badge" in section && section.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(108,99,255,0.2)", color: "var(--accent)", border: "1px solid rgba(108,99,255,0.3)" }}>
                {section.badge}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {section.items.map((tool) => (
              <Link key={tool.href} href={tool.href} className="tool-card block p-5 group">
                <div className="text-sm font-bold text-white mb-1.5 group-hover:text-[#a78bfa] transition-colors">
                  {tool.label}
                </div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{tool.desc}</div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Trust footer strip */}
      <div className="glass mt-8 py-6 px-8 flex flex-wrap justify-center gap-8">
        {["100% Free", "No sign-up required", "Files never leave your device", "No watermarks", "Works on mobile"].map((t) => (
          <span key={t} className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
