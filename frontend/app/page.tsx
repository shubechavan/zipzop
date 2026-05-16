import Link from "next/link";

const TOOLS = [
  {
    category: "AI / Smart Tools",
    id: "ai",
    emoji: "🤖",
    badge: "NEW",
    items: [
      { label: "Remove Background", desc: "AI removes bg instantly — free", href: "/tools/remove-background" },
      { label: "Image to Text (OCR)", desc: "Extract text from any image", href: "/tools/image-to-text" },
      { label: "Image Upscaler", desc: "2× / 4× enlarge without blur", href: "/tools/image-upscale" },
      { label: "Video → GIF", desc: "Convert video clips to GIF", href: "/tools/video-to-gif" },
    ],
  },
  {
    category: "Image Tools",
    id: "image",
    emoji: "🖼️",
    items: [
      { label: "Compress Image", desc: "Reduce file size, keep quality", href: "/tools/compress-image" },
      { label: "Resize Image", desc: "Change dimensions precisely", href: "/tools/resize-image" },
      { label: "Convert Format", desc: "JPG ↔ PNG ↔ WebP", href: "/tools/convert-image" },
      { label: "Passport Photo", desc: "35×45mm, 51×51mm & more", href: "/tools/passport-photo" },
      { label: "Image → PDF", desc: "Combine images into one PDF", href: "/tools/image-to-pdf" },
      { label: "Favicon Generator", desc: "All sizes from one image", href: "/tools/favicon-generator" },
    ],
  },
  {
    category: "PDF Tools",
    id: "pdf",
    emoji: "📄",
    items: [
      { label: "Compress PDF", desc: "Shrink PDF file size", href: "/tools/compress-pdf" },
      { label: "Merge PDFs", desc: "Combine multiple PDFs into one", href: "/tools/merge-pdf" },
      { label: "Split PDF", desc: "Extract pages or split by range", href: "/tools/split-pdf" },
      { label: "PDF → Images", desc: "Convert each page to JPG", href: "/tools/pdf-to-images" },
      { label: "Watermark PDF", desc: "Add text watermark to PDF", href: "/tools/watermark-pdf" },
      { label: "Rotate PDF", desc: "Rotate pages 90° / 180° / 270°", href: "/tools/rotate-pdf" },
    ],
  },
  {
    category: "QR & Utility",
    id: "utility",
    emoji: "⚡",
    items: [
      { label: "QR Code Generator", desc: "Generate QR from any text or URL", href: "/tools/qr-generate" },
      { label: "QR Code Reader", desc: "Scan QR code from an image", href: "/tools/qr-read" },
      { label: "Word → Text", desc: "Extract plain text from DOCX", href: "/tools/word-to-text" },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-20">
        <h1 className="text-4xl sm:text-6xl font-black text-white mb-5 tracking-tight">
          All your file tools,<br />
          <span className="text-[#6c63ff]">one free place.</span>
        </h1>
        <p className="text-[#888899] text-lg max-w-xl mx-auto">
          20+ tools — compress, convert, upscale, remove backgrounds, generate QR codes and more.
          100% free, runs in your browser. No sign-up, no watermark.
        </p>
      </div>

      {/* Tool sections */}
      {TOOLS.map((section) => (
        <section key={section.id} id={section.id} className="mb-16">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span>{section.emoji}</span>
            {section.category}
            {"badge" in section && section.badge && (
              <span className="text-xs font-bold bg-[#6c63ff] text-white px-2 py-0.5 rounded-full">
                {section.badge}
              </span>
            )}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.items.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="block rounded-2xl border border-[#2a2a35] bg-[#18181f] p-5 hover:border-[#6c63ff] transition-all group"
              >
                <div className="text-sm font-bold text-white group-hover:text-[#857dff] transition-colors mb-1">
                  {tool.label}
                </div>
                <div className="text-xs text-[#888899]">{tool.desc}</div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Trust strip */}
      <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-[#888899]">
        {["100% Free", "No sign-up", "Files never leave your device", "Works on mobile", "No watermark"].map((t) => (
          <span key={t} className="flex items-center gap-1">
            <span className="text-[#6c63ff]">✓</span> {t}
          </span>
        ))}
      </div>
    </div>
  );
}
