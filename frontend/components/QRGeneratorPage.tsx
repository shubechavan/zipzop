"use client";

import { useEffect, useState } from "react";

export default function QRGeneratorPage() {
  const [text, setText] = useState("");
  const [dataUrl, setDataUrl] = useState("");
  const [size, setSize] = useState(300);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!text.trim()) { setDataUrl(""); return; }
    let cancelled = false;
    setLoading(true);
    import("qrcode").then(({ default: QRCode }) =>
      QRCode.toDataURL(text, { width: size, margin: 2, color: { dark: "#000000", light: "#ffffff" } })
    ).then((url) => { if (!cancelled) { setDataUrl(url); setLoading(false); } })
     .catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [text, size]);

  const download = (fmt: "png" | "svg") => {
    if (fmt === "png" && dataUrl) {
      const a = document.createElement("a"); a.href = dataUrl; a.download = "qrcode.png"; a.click();
      return;
    }
    import("qrcode").then(({ default: QRCode }) =>
      QRCode.toString(text, { type: "svg", width: size, margin: 2 })
    ).then((svg) => {
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "qrcode.svg"; a.click();
    });
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e8e8f0",
    borderRadius: "10px",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10">
        <div className="section-label mb-3">Utility</div>
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">QR Code Generator</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
          Type any text, URL, or phone number and get a QR code instantly.
        </p>
      </div>

      <div className="space-y-4">
        {/* Input options */}
        <div className="glass p-5 space-y-4">
          <div>
            <label className="text-sm block mb-2" style={{ color: "var(--muted)" }}>Text / URL</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://example.com or any text…"
              rows={3}
              style={{ ...inputStyle, padding: "0.75rem", resize: "none" }}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm" style={{ color: "var(--muted)" }}>Size</label>
            <select value={size} onChange={(e) => setSize(Number(e.target.value))}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e8e8f0", borderRadius: "10px", fontSize: "0.875rem", padding: "0.4rem 0.75rem", outline: "none" }}>
              <option value={200}>200 × 200</option>
              <option value={300}>300 × 300</option>
              <option value={500}>500 × 500</option>
              <option value={1000}>1000 × 1000 — high-res</option>
            </select>
          </div>
        </div>

        {/* Preview */}
        <div className="glass flex items-center justify-center min-h-[260px] rounded-2xl overflow-hidden">
          {loading && (
            <span className="text-sm" style={{ color: "var(--muted)" }}>Generating…</span>
          )}
          {!loading && dataUrl && (
            <img src={dataUrl} alt="QR code" className="rounded-xl" style={{ maxWidth: "240px", imageRendering: "pixelated" }} />
          )}
          {!loading && !dataUrl && (
            <div className="text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
                style={{ color: "var(--muted)", margin: "0 auto 10px" }}>
                <rect x="2" y="2" width="8" height="8" rx="1" /><rect x="14" y="2" width="8" height="8" rx="1" />
                <rect x="2" y="14" width="8" height="8" rx="1" /><rect x="14" y="14" width="3" height="3" rx="0.5" />
                <rect x="19" y="14" width="3" height="3" rx="0.5" /><rect x="14" y="19" width="3" height="3" rx="0.5" />
                <rect x="19" y="19" width="3" height="3" rx="0.5" />
              </svg>
              <span className="text-sm" style={{ color: "var(--muted)" }}>QR preview appears here</span>
            </div>
          )}
        </div>

        {dataUrl && (
          <div className="flex gap-3">
            <button onClick={() => download("png")} className="btn-primary flex-1 text-center" style={{ padding: "0.8rem" }}>
              Download PNG
            </button>
            <button onClick={() => download("svg")}
              className="flex-1 text-sm font-semibold rounded-xl transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.08)", color: "var(--muted)", padding: "0.8rem" }}>
              Download SVG
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
