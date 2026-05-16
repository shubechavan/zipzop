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

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-3xl font-black text-white mb-2">QR Code Generator</h1>
      <p className="text-[#888899] mb-10">Type any text, URL, or phone number — get a QR code instantly.</p>

      <div className="space-y-6">
        <div className="rounded-xl border border-[#2a2a35] bg-[#18181f] p-5 space-y-4">
          <div>
            <label className="text-sm text-[#888899] block mb-2">Text / URL</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://example.com or any text…"
              rows={3}
              className="w-full rounded-lg border border-[#2a2a35] bg-[#0f0f13] text-white text-sm px-3 py-2 resize-none focus:border-[#6c63ff] outline-none transition-colors"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-[#888899]">Size (px)</label>
            <select value={size} onChange={(e) => setSize(Number(e.target.value))}
              className="rounded-lg border border-[#2a2a35] bg-[#0f0f13] text-white text-sm px-3 py-1.5">
              <option value={200}>200×200</option>
              <option value={300}>300×300</option>
              <option value={500}>500×500</option>
              <option value={1000}>1000×1000 (high-res)</option>
            </select>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-[#2a2a35] bg-white flex items-center justify-center min-h-[200px]">
          {loading && <span className="text-gray-400 text-sm">Generating…</span>}
          {!loading && dataUrl && <img src={dataUrl} alt="QR code" className="max-w-full" style={{ imageRendering: "pixelated" }} />}
          {!loading && !dataUrl && <span className="text-gray-400 text-sm">QR preview will appear here</span>}
        </div>

        {dataUrl && (
          <div className="flex gap-3">
            <button onClick={() => download("png")} className="btn-primary flex-1 text-center">
              Download PNG
            </button>
            <button onClick={() => download("svg")}
              className="flex-1 rounded-lg border border-[#2a2a35] text-[#888899] hover:text-white text-sm font-semibold transition-colors">
              Download SVG
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
