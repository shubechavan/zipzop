"use client";

import { useCallback, useRef, useState } from "react";
import AdBanner from "@/components/AdBanner";

// ── Types ────────────────────────────────────────────────────────────────────

type FieldDef = {
  name: string;
  label: string;
  type: "number" | "select" | "checkbox" | "text";
  defaultValue?: string | number | boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
};

type ToolValues = Record<string, string | number | boolean>;

// Process can return a file download OR extracted text
type ProcessResult =
  | { blob: Blob; filename: string }
  | { text: string; filename: string };

type ProcessFn = (
  files: File[],
  values: ToolValues,
  setStatus: (s: string) => void
) => Promise<ProcessResult>;

type ToolConfig = {
  title: string;
  description: string;
  accept: string;
  multiple?: boolean;
  minFiles?: number;
  fields?: FieldDef[];
  process: ProcessFn;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const pdfBlob = (bytes: Uint8Array): Blob =>
  new Blob([bytes as unknown as ArrayBuffer], { type: "application/pdf" });

// ── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS: Record<string, ToolConfig> = {
  // ── Image ──────────────────────────────────────────────────────────────────

  "compress-image": {
    title: "Compress Image",
    description: "Reduce file size while keeping quality. Supports JPG, PNG, WebP.",
    accept: "image/jpeg,image/png,image/webp",
    fields: [
      { name: "quality", label: "Quality (1–100)", type: "number", defaultValue: 80, min: 1, max: 100 },
      { name: "target_kb", label: "Target size KB (0 = auto)", type: "number", defaultValue: 0, min: 0 },
    ],
    process: async (files, values, setStatus) => {
      setStatus("Compressing…");
      const { default: imageCompression } = await import("browser-image-compression");
      const file = files[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const opts: Record<string, any> = { useWebWorker: true, initialQuality: Number(values.quality) / 100 };
      if (Number(values.target_kb) > 0) opts.maxSizeMB = Number(values.target_kb) / 1024;
      const compressed = await imageCompression(file, opts);
      return { blob: compressed, filename: file.name.replace(/\.[^.]+$/, "") + "_compressed.jpg" };
    },
  },

  "resize-image": {
    title: "Resize Image",
    description: "Change image dimensions. Set a value to 0 to auto-scale.",
    accept: "image/jpeg,image/png,image/webp,image/gif",
    fields: [
      { name: "width", label: "Width (px)", type: "number", defaultValue: 800, min: 0 },
      { name: "height", label: "Height (px, 0 = auto)", type: "number", defaultValue: 0, min: 0 },
      { name: "keep_ratio", label: "Maintain aspect ratio", type: "checkbox", defaultValue: true },
    ],
    process: async (files, values, setStatus) => {
      setStatus("Resizing…");
      const file = files[0];
      const bitmap = await createImageBitmap(file);
      let w = Number(values.width), h = Number(values.height);
      const keep = values.keep_ratio !== false && values.keep_ratio !== "false";
      if (keep) {
        if (w && !h) h = Math.round(bitmap.height * w / bitmap.width);
        else if (h && !w) w = Math.round(bitmap.width * h / bitmap.height);
      }
      if (!w || !h) throw new Error("Provide at least one dimension.");
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), mime, 0.92));
      return { blob, filename: `${file.name.replace(/\.[^.]+$/, "")}_${w}x${h}.${ext}` };
    },
  },

  "convert-image": {
    title: "Convert Image Format",
    description: "Convert between JPG, PNG, and WebP instantly — in your browser.",
    accept: "image/jpeg,image/png,image/webp,image/gif,image/bmp",
    fields: [
      {
        name: "to_format", label: "Convert to", type: "select", defaultValue: "png",
        options: [{ value: "jpg", label: "JPG" }, { value: "png", label: "PNG" }, { value: "webp", label: "WebP" }],
      },
    ],
    process: async (files, values, setStatus) => {
      setStatus("Converting…");
      const fmt = String(values.to_format);
      const mime = fmt === "png" ? "image/png" : fmt === "webp" ? "image/webp" : "image/jpeg";
      const bitmap = await createImageBitmap(files[0]);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width; canvas.height = bitmap.height;
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), mime, 0.92));
      return { blob, filename: `${files[0].name.replace(/\.[^.]+$/, "")}.${fmt}` };
    },
  },

  "passport-photo": {
    title: "Passport Photo Maker",
    description: "Resize your photo to official passport dimensions — India, US, UK, Schengen.",
    accept: "image/jpeg,image/png,image/webp",
    fields: [
      {
        name: "preset", label: "Size preset", type: "select", defaultValue: "35x45",
        options: [
          { value: "35x45", label: "35×45 mm — India / most visas" },
          { value: "51x51", label: "51×51 mm — US passport" },
          { value: "40x40", label: "40×40 mm — UK passport" },
          { value: "35x35", label: "35×35 mm — Schengen" },
        ],
      },
      {
        name: "dpi", label: "Print DPI", type: "select", defaultValue: "300",
        options: [{ value: "300", label: "300 DPI — standard" }, { value: "600", label: "600 DPI — high quality" }],
      },
    ],
    process: async (files, values, setStatus) => {
      setStatus("Generating passport photo…");
      const presets: Record<string, [number, number]> = {
        "35x45": [35, 45], "51x51": [51, 51], "40x40": [40, 40], "35x35": [35, 35],
      };
      const [wMM, hMM] = presets[String(values.preset)] ?? [35, 45];
      const dpi = Number(values.dpi) || 300;
      const pxW = Math.round(wMM / 25.4 * dpi), pxH = Math.round(hMM / 25.4 * dpi);
      const bitmap = await createImageBitmap(files[0]);
      const targetR = pxW / pxH, srcR = bitmap.width / bitmap.height;
      let sx = 0, sy = 0, sw = bitmap.width, sh = bitmap.height;
      if (srcR > targetR) { sw = Math.round(bitmap.height * targetR); sx = Math.round((bitmap.width - sw) / 2); }
      else { sh = Math.round(bitmap.width / targetR); sy = Math.round((bitmap.height - sh) / 2); }
      const canvas = document.createElement("canvas");
      canvas.width = pxW; canvas.height = pxH;
      canvas.getContext("2d")!.drawImage(bitmap, sx, sy, sw, sh, 0, 0, pxW, pxH);
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.95));
      return { blob, filename: `passport_${values.preset}mm.jpg` };
    },
  },

  "remove-background": {
    title: "Remove Background",
    description: "Remove image background instantly in your browser. Powered by AI — free, no upload.",
    accept: "image/jpeg,image/png,image/webp",
    process: async (files, _v, setStatus) => {
      setStatus("Loading AI model (first time ~10s)…");
      const { removeBackground } = await import("@imgly/background-removal");
      setStatus("Removing background…");
      const blob = await removeBackground(files[0]);
      return { blob, filename: files[0].name.replace(/\.[^.]+$/, "") + "_nobg.png" };
    },
  },

  "image-upscale": {
    title: "Image Upscaler",
    description: "Enlarge your image 2× or 4× with high-quality interpolation. No blur.",
    accept: "image/jpeg,image/png,image/webp",
    fields: [
      {
        name: "scale", label: "Upscale by", type: "select", defaultValue: "2",
        options: [{ value: "2", label: "2× (double size)" }, { value: "4", label: "4× (quadruple size)" }],
      },
    ],
    process: async (files, values, setStatus) => {
      setStatus("Upscaling…");
      const scale = Number(values.scale) || 2;
      const bitmap = await createImageBitmap(files[0]);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width * scale; canvas.height = bitmap.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const ext = files[0].name.split(".").pop()?.toLowerCase() ?? "jpg";
      const mime = ext === "png" ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), mime, 0.95));
      return { blob, filename: `${files[0].name.replace(/\.[^.]+$/, "")}_${scale}x.${ext}` };
    },
  },

  "image-to-text": {
    title: "Image to Text (OCR)",
    description: "Extract text from any image — photos, scanned docs, ID cards. Works offline.",
    accept: "image/jpeg,image/png,image/webp,image/gif,image/bmp",
    fields: [
      {
        name: "lang", label: "Language", type: "select", defaultValue: "eng",
        options: [
          { value: "eng", label: "English" },
          { value: "hin", label: "Hindi" },
          { value: "eng+hin", label: "English + Hindi" },
        ],
      },
    ],
    process: async (files, values, setStatus) => {
      setStatus("Loading OCR engine…");
      const Tesseract = await import("tesseract.js");
      const { data } = await Tesseract.recognize(files[0], String(values.lang), {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logger: (m: any) => {
          if (m.status === "recognizing text")
            setStatus(`Recognizing… ${Math.round(m.progress * 100)}%`);
        },
      });
      return { text: data.text.trim(), filename: files[0].name.replace(/\.[^.]+$/, "") + ".txt" };
    },
  },

  "qr-read": {
    title: "QR Code Reader",
    description: "Upload any image containing a QR code and decode it instantly.",
    accept: "image/jpeg,image/png,image/webp,image/gif",
    process: async (files, _v, setStatus) => {
      setStatus("Decoding QR code…");
      const { default: jsQR } = await import("jsqr");
      const bitmap = await createImageBitmap(files[0]);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width; canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
      const code = jsQR(imageData.data, bitmap.width, bitmap.height);
      if (!code) throw new Error("No QR code found in this image.");
      return { text: code.data, filename: "qr_decoded.txt" };
    },
  },

  "image-to-pdf": {
    title: "Image to PDF",
    description: "Convert one or more images into a single PDF file.",
    accept: "image/jpeg,image/png,image/webp",
    multiple: true,
    process: async (files, _v, setStatus) => {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        setStatus(`Adding image ${i + 1} of ${files.length}…`);
        const bytes = await files[i].arrayBuffer();
        const isJpeg = files[i].type === "image/jpeg";
        const img = isJpeg ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      setStatus("Saving PDF…");
      return { blob: pdfBlob(await doc.save()), filename: "images.pdf" };
    },
  },

  "favicon-generator": {
    title: "Favicon Generator",
    description: "Generate favicons in all standard sizes from any image. Download as ZIP.",
    accept: "image/jpeg,image/png,image/webp",
    process: async (files, _v, setStatus) => {
      const { default: JSZip } = await import("jszip");
      const sizes = [16, 32, 48, 64, 128, 256];
      const bitmap = await createImageBitmap(files[0]);
      const zip = new JSZip();
      for (const size of sizes) {
        setStatus(`Generating ${size}×${size}…`);
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(bitmap, 0, 0, size, size);
        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
        zip.file(`favicon-${size}x${size}.png`, blob);
      }
      zip.file("favicon.html", `<!-- Add to your <head> -->\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n<link rel="apple-touch-icon" sizes="128x128" href="/favicon-128x128.png">`);
      setStatus("Zipping…");
      return { blob: await zip.generateAsync({ type: "blob" }), filename: "favicons.zip" };
    },
  },

  "video-to-gif": {
    title: "Video to GIF",
    description: "Convert any video clip to an animated GIF — runs entirely in your browser.",
    accept: "video/mp4,video/webm,video/ogg,video/*",
    fields: [
      { name: "fps", label: "Frame rate (FPS)", type: "number", defaultValue: 10, min: 1, max: 30 },
      { name: "width", label: "Output width (px)", type: "number", defaultValue: 480, min: 100, max: 1280 },
      { name: "max_secs", label: "Max duration (secs)", type: "number", defaultValue: 8, min: 1, max: 30 },
    ],
    process: async (files, values, setStatus) => {
      const fps = Number(values.fps) || 10;
      const maxW = Number(values.width) || 480;
      const maxSecs = Number(values.max_secs) || 8;

      setStatus("Loading video…");
      const video = document.createElement("video");
      video.src = URL.createObjectURL(files[0]);
      video.muted = true;
      await new Promise<void>((res, rej) => {
        video.onloadedmetadata = () => res();
        video.onerror = () => rej(new Error("Could not read video file."));
      });

      const duration = Math.min(video.duration, maxSecs);
      const frameCount = Math.round(duration * fps);
      const vidW = video.videoWidth, vidH = video.videoHeight;
      const outW = Math.min(maxW, vidW);
      const outH = Math.round(vidH * outW / vidW);
      const delay = Math.round(100 / fps); // GIF delay is in centiseconds

      const canvas = document.createElement("canvas");
      canvas.width = outW; canvas.height = outH;
      const ctx = canvas.getContext("2d")!;

      setStatus("Loading GIF encoder…");
      const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
      const encoder = GIFEncoder();

      for (let i = 0; i < frameCount; i++) {
        setStatus(`Encoding frame ${i + 1} / ${frameCount}…`);
        video.currentTime = i / fps;
        await new Promise<void>((res) => { video.onseeked = () => res(); });
        ctx.drawImage(video, 0, 0, outW, outH);
        const { data } = ctx.getImageData(0, 0, outW, outH);
        const palette = quantize(data, 256);
        const index = applyPalette(data, palette);
        encoder.writeFrame(index, outW, outH, { palette, delay });
      }

      encoder.finish();
      URL.revokeObjectURL(video.src);
      const stem = files[0].name.replace(/\.[^.]+$/, "");
      return { blob: new Blob([encoder.bytes()], { type: "image/gif" }), filename: `${stem}.gif` };
    },
  },

  // ── PDF ────────────────────────────────────────────────────────────────────

  "compress-pdf": {
    title: "Compress PDF",
    description: "Reduce PDF file size by removing redundant data — runs in your browser.",
    accept: "application/pdf",
    process: async (files, _v, setStatus) => {
      setStatus("Compressing PDF…");
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.load(await files[0].arrayBuffer());
      return { blob: pdfBlob(await pdf.save({ useObjectStreams: true })), filename: files[0].name.replace(/\.[^.]+$/, "") + "_compressed.pdf" };
    },
  },

  "merge-pdf": {
    title: "Merge PDFs",
    description: "Combine 2 or more PDF files into one, in order.",
    accept: "application/pdf",
    multiple: true,
    minFiles: 2,
    process: async (files, _v, setStatus) => {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        setStatus(`Merging file ${i + 1} of ${files.length}…`);
        const pdf = await PDFDocument.load(await files[i].arrayBuffer());
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      setStatus("Saving…");
      return { blob: pdfBlob(await merged.save()), filename: "merged.pdf" };
    },
  },

  "split-pdf": {
    title: "Split PDF",
    description: "Split into one PDF per page, or extract a custom page range.",
    accept: "application/pdf",
    fields: [
      {
        name: "mode", label: "Split mode", type: "select", defaultValue: "all",
        options: [
          { value: "all", label: "All pages — one file per page" },
          { value: "range", label: "Custom page range" },
        ],
      },
      { name: "pages", label: 'Page range (e.g. "1-3,5")', type: "text", defaultValue: "" },
    ],
    process: async (files, values, setStatus) => {
      setStatus("Loading PDF…");
      const { PDFDocument } = await import("pdf-lib");
      const { default: JSZip } = await import("jszip");
      const src = await PDFDocument.load(await files[0].arrayBuffer());
      const total = src.getPageCount();
      const stem = files[0].name.replace(/\.[^.]+$/, "");
      const parseRanges = (spec: string) => {
        const result = new Set<number>();
        for (const part of spec.split(",")) {
          const t = part.trim();
          if (t.includes("-")) {
            const [a, b] = t.split("-").map(Number);
            for (let i = a; i <= Math.min(b, total); i++) result.add(i - 1);
          } else { const n = Number(t); if (n >= 1 && n <= total) result.add(n - 1); }
        }
        return [...result].sort((a, b) => a - b);
      };
      const zip = new JSZip();
      if (values.mode === "range" && values.pages) {
        const out = await PDFDocument.create();
        const copied = await out.copyPages(src, parseRanges(String(values.pages)));
        copied.forEach((p) => out.addPage(p));
        zip.file(`${stem}_range.pdf`, await out.save());
      } else {
        for (let i = 0; i < total; i++) {
          setStatus(`Splitting page ${i + 1} of ${total}…`);
          const out = await PDFDocument.create();
          const [p] = await out.copyPages(src, [i]);
          out.addPage(p);
          zip.file(`${stem}_page_${i + 1}.pdf`, await out.save());
        }
      }
      return { blob: await zip.generateAsync({ type: "blob" }), filename: `${stem}_split.zip` };
    },
  },

  "pdf-to-images": {
    title: "PDF → Images",
    description: "Convert each PDF page to a JPG image. Downloaded as a ZIP.",
    accept: "application/pdf",
    fields: [
      {
        name: "dpi", label: "Quality (DPI)", type: "select", defaultValue: "150",
        options: [
          { value: "72", label: "72 DPI — web / preview" },
          { value: "150", label: "150 DPI — standard" },
          { value: "300", label: "300 DPI — print quality" },
        ],
      },
    ],
    process: async (files, values, setStatus) => {
      setStatus("Loading PDF…");
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const { default: JSZip } = await import("jszip");
      const dpi = Number(values.dpi) || 150;
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await files[0].arrayBuffer()) }).promise;
      const zip = new JSZip();
      const stem = files[0].name.replace(/\.[^.]+$/, "");
      for (let i = 1; i <= pdf.numPages; i++) {
        setStatus(`Rendering page ${i} of ${pdf.numPages}…`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: dpi / 72 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not available");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx as any, canvas, viewport }).promise;
        const imgBlob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.9));
        zip.file(`${stem}_page_${i}.jpg`, imgBlob);
      }
      return { blob: await zip.generateAsync({ type: "blob" }), filename: `${stem}_images.zip` };
    },
  },

  "watermark-pdf": {
    title: "Watermark PDF",
    description: "Add a diagonal text watermark to every page of a PDF — free, browser-based.",
    accept: "application/pdf",
    fields: [
      { name: "text", label: "Watermark text", type: "text", defaultValue: "CONFIDENTIAL" },
      {
        name: "opacity", label: "Opacity", type: "select", defaultValue: "0.25",
        options: [
          { value: "0.1", label: "Light (10%)" },
          { value: "0.25", label: "Medium (25%)" },
          { value: "0.5", label: "Heavy (50%)" },
        ],
      },
    ],
    process: async (files, values, setStatus) => {
      setStatus("Adding watermark…");
      const { PDFDocument, StandardFonts, rgb, degrees } = await import("pdf-lib");
      const doc = await PDFDocument.load(await files[0].arrayBuffer());
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const opacity = Number(values.opacity) || 0.25;
      const text = String(values.text || "WATERMARK");
      for (const page of doc.getPages()) {
        const { width, height } = page.getSize();
        page.drawText(text, {
          x: width * 0.1, y: height * 0.45,
          size: Math.min(width / text.length * 1.4, 72),
          font, color: rgb(0.5, 0.5, 0.5),
          opacity, rotate: degrees(45),
        });
      }
      return { blob: pdfBlob(await doc.save()), filename: files[0].name.replace(/\.[^.]+$/, "") + "_watermarked.pdf" };
    },
  },

  "rotate-pdf": {
    title: "Rotate PDF",
    description: "Rotate all pages of a PDF by 90°, 180°, or 270°.",
    accept: "application/pdf",
    fields: [
      {
        name: "angle", label: "Rotate by", type: "select", defaultValue: "90",
        options: [
          { value: "90", label: "90° clockwise" },
          { value: "180", label: "180° (flip upside down)" },
          { value: "270", label: "270° (90° counter-clockwise)" },
        ],
      },
    ],
    process: async (files, values, setStatus) => {
      setStatus("Rotating pages…");
      const { PDFDocument, degrees } = await import("pdf-lib");
      const doc = await PDFDocument.load(await files[0].arrayBuffer());
      const angle = Number(values.angle) || 90;
      for (const page of doc.getPages()) {
        page.setRotation(degrees((page.getRotation().angle + angle) % 360));
      }
      return { blob: pdfBlob(await doc.save()), filename: files[0].name.replace(/\.[^.]+$/, "") + "_rotated.pdf" };
    },
  },

  // ── Word ───────────────────────────────────────────────────────────────────

  "word-to-text": {
    title: "Word → Plain Text",
    description: "Extract all text content from a .docx Word document.",
    accept: ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    process: async (files, _v, setStatus) => {
      setStatus("Extracting text…");
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ arrayBuffer: await files[0].arrayBuffer() });
      return { text: result.value, filename: files[0].name.replace(/\.[^.]+$/, "") + ".txt" };
    },
  },
};

// ── UI ───────────────────────────────────────────────────────────────────────

export default function ClientToolPage({ toolType }: { toolType: string }) {
  const config = TOOLS[toolType];

  const initValues = (): ToolValues =>
    Object.fromEntries((config?.fields ?? []).map((f) => [f.name, f.defaultValue ?? ""]));

  const [files, setFiles] = useState<File[]>([]);
  const [values, setValues] = useState<ToolValues>(initValues);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [textResult, setTextResult] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fl: FileList | null) => {
    if (!fl) return;
    setFiles(config?.multiple ? Array.from(fl) : [fl[0]]);
    setDone(false); setError(""); setTextResult("");
  }, [config?.multiple]);

  if (!config) return <div className="mx-auto max-w-2xl px-6 py-14 text-[#888899]">Tool not found.</div>;
  const { title, description, accept, multiple = false, minFiles = 1, fields = [], process } = config;

  const setValue = (name: string, val: string | number | boolean) =>
    setValues((v) => ({ ...v, [name]: val }));

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length < minFiles) { setError(`Please select at least ${minFiles} file${minFiles > 1 ? "s" : ""}.`); return; }
    setLoading(true); setError(""); setTextResult(""); setStatus("Starting…");
    try {
      const result = await process(files, values, setStatus);
      if ("text" in result) {
        setTextResult(result.text);
      } else {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement("a"); a.href = url; a.download = result.filename; a.click();
        URL.revokeObjectURL(url);
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setLoading(false); setStatus(""); }
  };

  const reset = () => { setFiles([]); setValues(initValues()); setDone(false); setError(""); setTextResult(""); setCopied(false); };

  const copyText = () => {
    navigator.clipboard.writeText(textResult);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    const stem = files[0]?.name.replace(/\.[^.]+$/, "") ?? "output";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([textResult], { type: "text/plain" }));
    a.download = `${stem}.txt`; a.click();
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e8e8f0",
    borderRadius: "10px",
    fontSize: "0.875rem",
    padding: "0.4rem 0.75rem",
    outline: "none",
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <div className="section-label mb-3">Tool</div>
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">{title}</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drop zone */}
        <div
          className={`drop-zone flex flex-col items-center justify-center gap-4 py-16 text-center ${dragging ? "active" : ""}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        >
          <input ref={fileRef} type="file" accept={accept} multiple={multiple} className="hidden"
            onChange={(e) => addFiles(e.target.files)} />
          {files.length > 0 ? (
            <div className="space-y-1.5 max-h-40 overflow-y-auto px-4">
              {files.map((f) => (
                <div key={f.name} className="text-sm font-medium" style={{ color: "var(--accent)" }}>{f.name}</div>
              ))}
            </div>
          ) : (
            <>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--muted)" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <div>
                <div className="text-white font-semibold text-sm">Drop file here or click to browse</div>
                <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{accept.split(",").slice(0, 4).join("  ·  ")}</div>
              </div>
            </>
          )}
        </div>

        {/* Options */}
        {fields.length > 0 && (
          <div className="glass p-5 space-y-4">
            {fields.map((f) => (
              <div key={f.name} className="flex items-center justify-between gap-4">
                <label className="text-sm" style={{ color: "var(--muted)" }}>{f.label}</label>
                {f.type === "select" && (
                  <select value={String(values[f.name] ?? "")} onChange={(e) => setValue(f.name, e.target.value)}
                    style={inputStyle}>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                )}
                {f.type === "number" && (
                  <input type="number" value={Number(values[f.name] ?? 0)} min={f.min} max={f.max}
                    onChange={(e) => setValue(f.name, Number(e.target.value))}
                    style={{ ...inputStyle, width: "7rem" }} />
                )}
                {f.type === "text" && (
                  <input type="text" value={String(values[f.name] ?? "")} placeholder="…"
                    onChange={(e) => setValue(f.name, e.target.value)}
                    style={{ ...inputStyle, width: "11rem" }} />
                )}
                {f.type === "checkbox" && (
                  <input type="checkbox" checked={Boolean(values[f.name])}
                    onChange={(e) => setValue(f.name, e.target.checked)}
                    className="w-4 h-4 accent-[#6c63ff]" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Status / Error */}
        {error && (
          <div className="text-sm rounded-xl px-4 py-3"
            style={{ color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}
        {loading && (
          <div className="text-sm rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ color: "var(--accent)", background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)" }}>
            <span className="inline-block w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
            {status}
          </div>
        )}

        {/* Text result */}
        {textResult && (
          <div className="space-y-3">
            <textarea readOnly value={textResult} rows={10}
              className="w-full resize-y font-mono text-sm"
              style={{ ...inputStyle, padding: "1rem", width: "100%", borderRadius: "12px" }} />
            <div className="flex gap-3">
              <button type="button" onClick={copyText} className="btn-primary">
                {copied ? "Copied!" : "Copy text"}
              </button>
              <button type="button" onClick={downloadText}
                className="text-sm px-4 py-2 rounded-lg transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "var(--muted)" }}>
                Download .txt
              </button>
              <button type="button" onClick={reset}
                className="ml-auto text-sm px-4 py-2 rounded-lg transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "var(--muted)" }}>
                New file
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {done && !textResult && (
          <div className="flex gap-3">
            <div className="flex-1 rounded-xl text-sm font-medium py-3 text-center"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}>
              Download started
            </div>
            <button type="button" onClick={reset} className="btn-primary">Process another</button>
          </div>
        )}

        {/* Submit */}
        {!done && (
          <button type="submit" disabled={loading || files.length < minFiles}
            className="btn-primary w-full text-center"
            style={{ padding: "0.8rem", fontSize: "0.95rem" }}>
            {loading ? (status || "Processing…") : "Process & Download"}
          </button>
        )}
      </form>

      <AdBanner slot="tool-page-bottom" format="horizontal" className="mt-12" />
    </div>
  );
}
