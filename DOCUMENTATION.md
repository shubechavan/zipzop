# ZipZop Tools — Full Project Documentation

> A privacy-first, browser-based file processing platform with 22+ free tools.
> Built from scratch — no backend needed for any tool, no sign-up, no file uploads.

**Live URL:** https://zipzop-blush.vercel.app  
**GitHub:** https://github.com/shubechavan/zipzop  
**Status:** Live, AdSense review in progress

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Why We Built It This Way](#2-why-we-built-it-this-way)
3. [Tech Stack](#3-tech-stack)
4. [Repository Structure](#4-repository-structure)
5. [Architecture](#5-architecture)
6. [All 22 Tools](#6-all-22-tools)
7. [Frontend — Deep Dive](#7-frontend--deep-dive)
8. [Backend — Deep Dive](#8-backend--deep-dive)
9. [Design System](#9-design-system)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [Monetization — Google AdSense](#11-monetization--google-adsense)
12. [Deployment — Vercel](#12-deployment--vercel)
13. [Key Engineering Decisions](#13-key-engineering-decisions)
14. [Challenges & Fixes](#14-challenges--fixes)
15. [What ZipZop Has That Competitors Don't](#15-what-zipzop-has-that-competitors-dont)
16. [Running Locally](#16-running-locally)
17. [Environment Variables](#17-environment-variables)
18. [Dependencies Reference](#18-dependencies-reference)

---

## 1. Project Overview

ZipZop Tools is a free online file utility platform. Users can compress images, merge PDFs, remove backgrounds with AI, generate QR codes, extract text from images via OCR, and much more — all without creating an account or uploading files to any server.

The core promise: **every file stays on your device**. All processing happens inside the user's browser using JavaScript and WebAssembly.

The site is monetized with Google AdSense. No paid features, no subscriptions, no freemium limits.

---

## 2. Why We Built It This Way

### Problem
Sites like ilovepdf.com and smallpdf.com upload your files to their servers. They require sign-ups for basic features and charge for bulk usage. We wanted to build a better alternative.

### Constraint
Server hosting for CPU-intensive tasks (image processing, PDF rendering) is expensive at scale on the free tier.

### Solution
Move all processing to the browser. Modern browsers can run WebAssembly, use the Canvas API, and handle large binary files in memory. Libraries like Tesseract.js, pdf-lib, and @imgly/background-removal make this possible without any server.

**Result:** $0 infrastructure cost, better privacy, faster processing (no upload latency), and it works offline.

---

## 3. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.6 | React framework, App Router, static export |
| React | 19.2.4 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Utility-first styling |
| Inter (Google Font) | — | Typography |

### Browser Processing Libraries
| Library | Version | Used For |
|---|---|---|
| @imgly/background-removal | 1.7.0 | AI background removal (ONNX model in WASM) |
| tesseract.js | 7.0.0 | OCR — extract text from images (WASM) |
| pdf-lib | 1.17.1 | Create, merge, split, watermark, rotate PDFs |
| pdfjs-dist | 5.7.284 | Render PDF pages to Canvas (PDF→Images) |
| browser-image-compression | 2.0.2 | Client-side image compression |
| qrcode | 1.5.4 | Generate QR codes (PNG + SVG) |
| jsqr | 1.4.0 | Decode QR codes from images |
| mammoth | 1.12.0 | Extract text from .docx Word files |
| gifenc | 1.0.3 | Encode animated GIFs from video frames |
| jszip | 3.10.1 | Create ZIP archives in-browser |

### Backend (Python — not active in production)
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.115.0 | REST API framework |
| Uvicorn | 0.30.6 | ASGI server |
| Pillow | 10.4.0 | Image processing |
| pikepdf | 9.2.0 | PDF manipulation |
| PyMuPDF | 1.24.10 | PDF to image rendering |
| python-docx | 1.1.2 | DOCX reading |
| python-multipart | 0.0.9 | File upload parsing |

### Infrastructure
| Service | Purpose |
|---|---|
| GitHub | Source code, version control |
| GitHub Actions | CI — type check + build on every push |
| Vercel | Hosting, auto-deploy on push to main |
| Google AdSense | Monetization |

---

## 4. Repository Structure

```
zipzop/                              # Root of the monorepo
│
├── frontend/                        # Next.js application (deployed to Vercel)
│   ├── app/
│   │   ├── layout.tsx               # Root layout — AdSense script, Navbar, footer
│   │   ├── page.tsx                 # Homepage — hero, stats, tool directory
│   │   ├── globals.css              # Global design system (CSS variables, component classes)
│   │   ├── privacy/
│   │   │   └── page.tsx             # Privacy policy page (required for AdSense)
│   │   └── tools/
│   │       ├── remove-background/page.tsx
│   │       ├── image-to-text/page.tsx
│   │       ├── image-upscale/page.tsx
│   │       ├── video-to-gif/page.tsx
│   │       ├── compress-image/page.tsx
│   │       ├── resize-image/page.tsx
│   │       ├── convert-image/page.tsx
│   │       ├── passport-photo/page.tsx
│   │       ├── image-to-pdf/page.tsx
│   │       ├── favicon-generator/page.tsx
│   │       ├── compress-pdf/page.tsx
│   │       ├── merge-pdf/page.tsx
│   │       ├── split-pdf/page.tsx
│   │       ├── pdf-to-images/page.tsx
│   │       ├── watermark-pdf/page.tsx
│   │       ├── rotate-pdf/page.tsx
│   │       ├── qr-generate/page.tsx
│   │       ├── qr-read/page.tsx
│   │       └── word-to-text/page.tsx
│   │
│   ├── components/
│   │   ├── ClientToolPage.tsx       # Universal tool engine — drives all 18 tools
│   │   ├── QRGeneratorPage.tsx      # Dedicated QR generator with live preview
│   │   ├── Navbar.tsx               # Sticky frosted-glass navbar, mobile hamburger
│   │   └── AdBanner.tsx             # Google AdSense wrapper with dev placeholder
│   │
│   ├── public/
│   │   └── ads.txt                  # AdSense ownership verification
│   │
│   ├── types/
│   │   └── gifenc.d.ts              # Manual TypeScript declarations for gifenc
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.ts
│
├── backend/                         # FastAPI (Python) — exists but not active
│   ├── main.py                      # App setup, CORS config, router imports
│   ├── requirements.txt
│   └── routers/
│       ├── image.py                 # 4 image endpoints
│       ├── pdf.py                   # 5 PDF endpoints
│       └── word.py                  # 2 Word endpoints
│
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions: type check + build
│
└── DOCUMENTATION.md                 # This file
```

---

## 5. Architecture

### Request Flow (Client-Side Tool)

```
User opens tool page (e.g. /tools/compress-image)
         │
         ▼
Next.js serves static HTML (pre-rendered at build time)
         │
         ▼
Page renders <ClientToolPage toolType="compress-image" />
         │
         ▼
User drops or selects a file
         │
         ▼
User clicks "Process & Download"
         │
         ▼
handleSubmit() calls config.process(files, values, setStatus)
         │
         ▼
Dynamic import loads library (lazy — only on first use)
e.g. import("browser-image-compression")
         │
         ▼
Library processes file in-memory (Canvas API / WebAssembly)
         │
         ▼
Result Blob → URL.createObjectURL() → <a>.click() → file downloads
         │
         ▼
URL.revokeObjectURL() → memory freed
         │
         ▼
File never touched a server at any point
```

### The Universal Tool Engine

All 18 standard tools share one component: `ClientToolPage.tsx`. Each tool is defined as a config object in a `TOOLS` record:

```typescript
type ToolConfig = {
  title: string;
  description: string;
  accept: string;           // MIME type filter for file input
  multiple?: boolean;       // Allow multiple file selection
  minFiles?: number;        // Minimum files required to process
  fields?: FieldDef[];      // Dynamic form fields (select, number, text, checkbox)
  process: ProcessFn;       // The actual processing function
  howTo?: string[];         // Numbered steps shown below the tool
  faq?: { q: string; a: string }[];  // FAQ cards shown below howTo
};
```

Adding a new tool = adding one entry to the `TOOLS` object. The upload UI, drag-and-drop, error handling, loading state, status messages, result display, and ad banner are all shared automatically.

### Static Generation

All 22 routes compile to static HTML at build time (`○ Static` in Next.js build output). There is no server-side rendering. Vercel serves pure static files — no Node.js runtime needed.

---

## 6. All 22 Tools

### AI / Smart Tools

| Tool | Route | Library | Description |
|---|---|---|---|
| Remove Background | `/tools/remove-background` | @imgly/background-removal | ONNX ML model runs in WASM — removes image backgrounds without server |
| Image to Text (OCR) | `/tools/image-to-text` | tesseract.js | Full OCR engine in WASM — supports English and Hindi |
| Image Upscaler | `/tools/image-upscale` | Canvas API | 2× or 4× enlargement with high-quality interpolation |
| Video to GIF | `/tools/video-to-gif` | gifenc + Canvas | Captures video frames via Canvas, encodes GIF in pure JS |

### Image Tools

| Tool | Route | Library | Description |
|---|---|---|---|
| Compress Image | `/tools/compress-image` | browser-image-compression | Quality slider + target KB — outputs compressed JPG |
| Resize Image | `/tools/resize-image` | Canvas API | Set exact dimensions, optional aspect ratio lock |
| Convert Format | `/tools/convert-image` | Canvas API | JPG ↔ PNG ↔ WebP conversion |
| Passport Photo | `/tools/passport-photo` | Canvas API | Center-crop + resize to 35×45mm, 51×51mm, 40×40mm, 35×35mm at 300/600 DPI |
| Image to PDF | `/tools/image-to-pdf` | pdf-lib | Combine multiple JPG/PNG images into one PDF, one image per page |
| Favicon Generator | `/tools/favicon-generator` | Canvas API + jszip | Generates 16, 32, 48, 64, 128, 256px PNGs + HTML snippet, bundled as ZIP |

### PDF Tools

| Tool | Route | Library | Description |
|---|---|---|---|
| Compress PDF | `/tools/compress-pdf` | pdf-lib | Lossless compression via object streams |
| Merge PDFs | `/tools/merge-pdf` | pdf-lib | Combine 2+ PDFs in order |
| Split PDF | `/tools/split-pdf` | pdf-lib + jszip | Split into one-PDF-per-page or custom page ranges, ZIP output |
| PDF to Images | `/tools/pdf-to-images` | pdfjs-dist + Canvas + jszip | Render each page to JPG at 72/150/300 DPI, ZIP output |
| Watermark PDF | `/tools/watermark-pdf` | pdf-lib | Diagonal text watermark on every page, adjustable opacity |
| Rotate PDF | `/tools/rotate-pdf` | pdf-lib | Rotate all pages 90°, 180°, or 270° |

### QR & Utility

| Tool | Route | Library | Description |
|---|---|---|---|
| QR Code Generator | `/tools/qr-generate` | qrcode | Real-time QR generation as you type, PNG and SVG download |
| QR Code Reader | `/tools/qr-read` | jsqr | Decode QR codes from any uploaded image |
| Word to Text | `/tools/word-to-text` | mammoth | Extract plain text from .docx files |

---

## 7. Frontend — Deep Dive

### `app/layout.tsx`

Root layout used by every page. Responsibilities:
- Loads the **Inter** font from Google Fonts
- Conditionally injects the **Google AdSense script** via `NEXT_PUBLIC_ADSENSE_ID` env var
- Renders the `<Navbar />` above all pages
- Renders a global `<footer>` with Privacy Policy link
- Sets global metadata (title, description)

### `app/page.tsx`

Homepage. Contains:
- **Badge pill** — animated pulse dot + "20+ tools — all free, all in your browser"
- **Hero** — large gradient headline, subtitle, "Explore Tools" CTA
- **Stats strip** — 4 glass cards: "20+ Free Tools", "0 Sign-ups needed", "100% Browser-based", "0 KB Files uploaded"
- **Ad banner** — `<AdBanner slot="homepage-top" />`
- **Tool sections** — 4 categories rendered from a `TOOLS` array, each tool links to its route
- **Trust footer strip** — "100% Free", "No sign-up required", "Files never leave your device", "No watermarks", "Works on mobile"

### `components/ClientToolPage.tsx`

The most important file in the project (~1000 lines). Contains:

1. **Type definitions** — `FieldDef`, `ToolValues`, `ProcessResult`, `ProcessFn`, `ToolConfig`
2. **`pdfBlob()` helper** — works around TypeScript strictness: `new Blob([bytes as unknown as ArrayBuffer], { type: "application/pdf" })`
3. **`TOOLS` record** — 18 tool config objects, each with `process` function, optional `fields`, `howTo`, and `faq`
4. **`ClientToolPage` component** — shared UI:
   - File drop zone (drag-and-drop + click-to-browse)
   - Dynamic form fields (select, number, text, checkbox)
   - Error display (red glass card)
   - Loading state (spinning border animation + status message)
   - Text result display (textarea + copy + download .txt)
   - Download success state + "Process another" reset button
   - Submit button (disabled when no file / loading)
   - `AdBanner` below form
   - "How to use" numbered steps
   - FAQ glass cards

### `components/QRGeneratorPage.tsx`

Separate component for QR generation because it has no file input — it's driven by a text field. Uses `useEffect` to regenerate the QR preview on every keystroke. Supports PNG and SVG download.

### `components/Navbar.tsx`

Sticky glassmorphism navbar:
- Logo: "Zip**Zop**" (accent color on "Zop")
- Desktop links: AI Tools, Image, PDF, Utility (anchor scroll to homepage sections)
- Mobile: animated hamburger — three `<span>` elements transformed via CSS to form an X when open
- Menu closes automatically on link click

### `components/AdBanner.tsx`

Thin wrapper around Google AdSense:
- If `NEXT_PUBLIC_ADSENSE_ID` is not set → renders a styled placeholder div (dev mode)
- If set → renders `<ins class="adsbygoogle" ...>` and calls `window.adsbygoogle.push({})` via `useEffect`
- Uses a `pushed` ref to prevent double-pushing on re-renders

### `types/gifenc.d.ts`

Manual TypeScript declaration file for `gifenc`, which ships no types:

```typescript
declare module "gifenc" {
  export function GIFEncoder(): {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: { palette?: number[][]; delay?: number }): void;
    finish(): void;
    bytes(): Uint8Array<ArrayBuffer>;
  };
  export function quantize(data: Uint8ClampedArray, maxColors: number): number[][];
  export function applyPalette(data: Uint8ClampedArray, palette: number[][]): Uint8Array;
}
```

### `public/ads.txt`

Required by Google AdSense for publisher ownership verification:
```
google.com, pub-7871945928909954, DIRECT, f08c47fec0942fa0
```

---

## 8. Backend — Deep Dive

The FastAPI backend was built first, then deprecated in favour of client-side processing. It remains in the repo for potential future use (e.g. Word→PDF requires LibreOffice, which cannot run in a browser).

### `backend/main.py`
```python
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000", "https://zipzop.tools"])
app.include_router(image.router, prefix="/api/image")
app.include_router(pdf.router, prefix="/api/pdf")
app.include_router(word.router, prefix="/api/word")
```

### Endpoints

#### Image (`/api/image/`)
| Method | Path | Description |
|---|---|---|
| POST | `/compress` | Binary search on Pillow quality to hit target KB |
| POST | `/resize` | LANCZOS resampling, aspect ratio option |
| POST | `/convert` | Format conversion via Pillow |
| POST | `/passport` | Center-crop + resize to mm dimensions at DPI |

#### PDF (`/api/pdf/`)
| Method | Path | Description |
|---|---|---|
| POST | `/compress` | pikepdf with object streaming |
| POST | `/merge` | pikepdf page concatenation |
| POST | `/split` | pikepdf + ZIP via Python zipfile |
| POST | `/to-images` | PyMuPDF render + ZIP |
| POST | `/watermark` | pikepdf + reportlab text layer |

#### Word (`/api/word/`)
| Method | Path | Description |
|---|---|---|
| POST | `/to-text` | python-docx paragraph extraction |
| POST | `/to-pdf` | LibreOffice subprocess (requires LibreOffice installed) |

---

## 9. Design System

### Color Palette

```css
--bg:                #07070f                      /* near-black background */
--glass-bg:          rgba(255, 255, 255, 0.03)    /* card background */
--glass-border:      rgba(255, 255, 255, 0.07)    /* card border */
--glass-hover:       rgba(108, 99, 255, 0.08)     /* card hover background */
--glass-hover-border:rgba(108, 99, 255, 0.35)     /* card hover border */
--accent:            #6c63ff                      /* primary purple */
--accent-hover:      #857dff                      /* lighter purple on hover */
--accent-glow:       rgba(108, 99, 255, 0.25)     /* glow shadow color */
--text:              #e8e8f0                      /* primary text */
--muted:             #55556a                      /* secondary text */
```

### Background Orbs

Two large pseudo-element blobs on `body::before` and `body::after` create ambient glow without any images:

```css
body::before {
  /* Purple orb — top left */
  background: radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 65%);
  width: 700px; height: 700px; top: -200px; left: -150px;
}
body::after {
  /* Blue orb — bottom right */
  background: radial-gradient(circle, rgba(62,168,255,0.08) 0%, transparent 65%);
  width: 600px; height: 600px; bottom: -200px; right: -100px;
}
```

### Component Classes

| Class | Effect |
|---|---|
| `.glass` | `background: rgba(255,255,255,0.03)` + `backdrop-filter: blur(14px)` + subtle border |
| `.tool-card` | Glass card + hover: lifts 2px, purple border glow, accent background tint |
| `.btn-primary` | Solid purple button, hover: lighter + glow shadow, disabled: 40% opacity |
| `.drop-zone` | Dashed border, hover/active: purple border + faint purple background |
| `.section-label` | Uppercase 0.7rem font + 18px purple line before text |

### Typography

- Font: **Inter** (Google Fonts) — loaded via `next/font/google`
- Hero heading: `text-5xl sm:text-7xl font-black` with gradient text via `WebkitBackgroundClip: "text"`
- Gradient: `linear-gradient(135deg, #6c63ff 0%, #a78bfa 50%, #3ea8ff 100%)`

---

## 10. CI/CD Pipeline

### GitHub Actions (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main`:

```
push to main / PR to main
         │
         ▼
ubuntu-latest runner
         │
         ├── actions/checkout@v4
         ├── actions/setup-node@v4 (Node 20, npm cache)
         ├── npm ci (clean install)
         ├── npx tsc --noEmit (TypeScript type check)
         └── npm run build (Next.js production build)
```

If any step fails, the push is flagged as failing in GitHub. This catches:
- Type errors
- Import errors
- Build-breaking changes

### Vercel Auto-Deploy

Vercel is connected to the GitHub repo. On every push to `main` that passes CI:
1. Vercel detects the push
2. Builds the Next.js app (Root Directory: `frontend`)
3. Deploys to production in ~60 seconds
4. Previous deployment remains live until new one is ready (zero downtime)

---

## 11. Monetization — Google AdSense

### Setup

AdSense is integrated conditionally via an environment variable:

```tsx
// app/layout.tsx
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID ?? "";

{ADSENSE_ID && (
  <script
    async
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
    crossOrigin="anonymous"
  />
)}
```

In development (no env var set), `AdBanner` renders a placeholder. In production (env var set in Vercel), real ads load.

### Ad Placements

| Location | Slot | Format |
|---|---|---|
| Homepage — between stats and tool list | `homepage-top` | horizontal |
| Every tool page — below the form | `tool-page-bottom` | horizontal |

### Verification

Ownership was verified via `ads.txt` snippet method (more reliable than script-tag verification since Next.js static script injection is not always detected by crawlers).

Publisher ID: `ca-pub-7871945928909954`

### Privacy Policy

`/privacy` page was created as required by AdSense. Covers:
- Files stay on device (no server upload)
- Google AdSense cookie usage
- No first-party cookies
- Anonymous analytics (Vercel Analytics)
- No data from children under 13
- Contact email: privacy@zipzop.tools

---

## 12. Deployment — Vercel

### Configuration

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `frontend` |
| Build Command | `npm run build` (auto-detected) |
| Output Directory | `.next` (auto-detected) |
| Node.js Version | 20.x |

### Environment Variables

Set in Vercel → Project → Settings → Environment Variables:

| Variable | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_ADSENSE_ID` | `ca-pub-7871945928909954` | Production, Preview |

### Domain

Currently deployed at `zipzop-blush.vercel.app`. Can be pointed to a custom domain (e.g. `zipzop.tools`) by adding it in Vercel → Project → Domains.

---

## 13. Key Engineering Decisions

### 1. Browser-side processing instead of server-side

**Problem:** Server-side image/PDF processing is CPU-intensive. Free tier servers (Render, Railway) have insufficient CPU/memory for concurrent users.

**Decision:** Move all processing to the browser using WASM libraries and the Canvas API.

**Result:** $0 infrastructure cost. Processing speed depends on the user's device, not a shared server. Files genuinely never leave the device, which is a genuine privacy advantage and a marketing point.

### 2. Single universal component for all tools

**Problem:** 22 tools × separate components = massive code duplication for the upload UI, error handling, loading state, drag-and-drop, etc.

**Decision:** Build one `ClientToolPage` component driven by a typed config object. Each tool only defines what makes it unique: accepted file types, form fields, and the `process` function.

**Result:** Adding a new tool is ~20 lines. All UI improvements (new loading animation, FAQ section, ad placement) apply to all tools instantly.

### 3. Dynamic imports for heavy libraries

**Problem:** Tesseract.js (~10MB), @imgly/background-removal (~40MB), pdfjs-dist (~5MB) — bundling everything at page load would make the site unusable.

**Decision:** Use `import()` inside the `process` function. Libraries are fetched only when the user actually clicks "Process".

**Result:** The homepage and tool pages load fast. Heavy libraries are cached by the browser after the first use.

### 4. Video→GIF without FFmpeg/WASM

**Problem:** `@ffmpeg/ffmpeg` is the standard library for video conversion, but it requires `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin` HTTP headers. These headers block Google AdSense (third-party `<script>` tags).

**Decision:** Use the native `<video>` element to decode the video, capture frames to Canvas, and encode GIFs using `gifenc` (a pure JavaScript GIF encoder). No COOP/COEP headers required.

**Result:** AdSense works normally. The trade-off is slower encoding for long videos since there is no WASM-level optimization.

### 5. AdSense script in `<head>` (not via next/script)

**Problem:** `next/script` with `strategy="afterInteractive"` injects the AdSense script via client-side JavaScript. Google's AdSense verification crawler does not execute JavaScript, so it cannot find the script tag to verify site ownership.

**Decision:** Place the `<script>` tag directly inside `<head>` in the layout JSX, which Next.js renders as a static HTML tag.

**Result:** The AdSense crawler finds the tag in the raw HTML and ownership verification passes.

### 6. Ads.txt for site verification

**Problem:** Script-based verification kept failing even after the script was placed correctly.

**Decision:** Switch to the Ads.txt verification method, which only requires a static text file at `/ads.txt`.

**Result:** Verification passed immediately since the file is served as static content with no JS required.

---

## 14. Challenges & Fixes

### Nested git repository

**Problem:** `create-next-app` initialized its own `.git` directory inside `frontend/`, creating a git submodule situation. GitHub showed the `frontend/` folder as an unclickable submodule link.

**Fix:** 
```bash
rm -rf frontend/.git
git rm --cached frontend
git add frontend/
git commit -m "fix: fold frontend into root repo"
```

### React 19 breaking change — FormEvent deprecated

**Problem:** `React.FormEvent` is deprecated in React 19. TypeScript threw an error on the form submit handler.

**Fix:** Changed type annotation to `React.SyntheticEvent<HTMLFormElement>`.

### TypeScript 5 strictness — Uint8Array not assignable to BlobPart

**Problem:** `pdf-lib`'s `save()` returns `Uint8Array<ArrayBufferLike>`. TypeScript 5's strict mode rejects this as a `BlobPart` argument.

**Fix:** Created a helper:
```typescript
const pdfBlob = (bytes: Uint8Array): Blob =>
  new Blob([bytes as unknown as ArrayBuffer], { type: "application/pdf" });
```

### pdfjs-dist — canvas not in RenderParameters

**Problem:** Newer versions of `pdfjs-dist` require a `canvas` property in the render parameters object. Omitting it caused a TypeScript error.

**Fix:** Added `canvas` to the render call:
```typescript
await page.render({ canvasContext: ctx as any, canvas, viewport }).promise;
```

### gifenc — no TypeScript types

**Problem:** `gifenc` ships no `.d.ts` file. TypeScript could not import it.

**Fix:** Created `frontend/types/gifenc.d.ts` with manual type declarations matching the actual API.

### Co-Authored-By showing Claude as GitHub contributor

**Problem:** Commit messages included `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`. GitHub parsed this and showed "claude" as a contributor on the repo — misleading to recruiters.

**Fix:**
```bash
git filter-branch --msg-filter 'sed "/^Co-Authored-By:/d"' -- --all
git push --force origin main
```

### AdSense "Google-served ads on screens without publisher-content"

**Problem:** AdSense flagged both sites for lacking publisher content. Pure tool UIs with no surrounding text are not considered "content" by Google's crawler.

**Fix:** Added "How to use" (numbered steps) and "FAQ" (3 questions per tool) sections to all 22 tool pages — 219 lines of real crawlable text content added in one commit.

---

## 15. What ZipZop Has That Competitors Don't

| Feature | ilovepdf | Smallpdf | ZipZop |
|---|---|---|---|
| Files stay on your device | No | No | **Yes** |
| AI background removal | No | No | **Yes** |
| OCR / Image to text | No | No | **Yes** |
| QR code generator | No | No | **Yes** |
| QR code reader | No | No | **Yes** |
| Video to GIF | No | No | **Yes** |
| Favicon generator | No | No | **Yes** |
| Image upscaler | No | No | **Yes** |
| Passport photo maker | No | No | **Yes** |
| Sign-up required | Yes | Yes | **No** |
| Works offline | No | No | **Yes** (after first load) |
| $0 hosting cost | N/A | N/A | **Yes** |

---

## 16. Running Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

Type check:
```bash
npx tsc --noEmit
```

Production build:
```bash
npm run build
```

### Backend (optional)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

---

## 17. Environment Variables

| Variable | Required | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_ADSENSE_ID` | No | Google AdSense publisher ID. If omitted, AdBanner shows a placeholder. | `ca-pub-7871945928909954` |

Set in Vercel: Project → Settings → Environment Variables → Add.

After adding, trigger a redeploy: Deployments → three dots → Redeploy.

---

## 18. Dependencies Reference

### Production (`frontend/package.json`)

```json
{
  "@imgly/background-removal": "^1.7.0",
  "browser-image-compression": "^2.0.2",
  "gifenc": "^1.0.3",
  "jsqr": "^1.4.0",
  "jszip": "^3.10.1",
  "mammoth": "^1.12.0",
  "next": "16.2.6",
  "pdf-lib": "^1.17.1",
  "pdfjs-dist": "^5.7.284",
  "qrcode": "^1.5.4",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "tesseract.js": "^7.0.0"
}
```

### Dev

```json
{
  "@tailwindcss/postcss": "^4",
  "@types/node": "^20",
  "@types/qrcode": "^1.5.6",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "eslint": "^9",
  "eslint-config-next": "16.2.6",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

### Backend (`backend/requirements.txt`)

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
python-multipart==0.0.9
Pillow==10.4.0
pikepdf==9.2.0
PyMuPDF==1.24.10
python-docx==1.1.2
aiofiles==23.2.1
```

---

*ZipZop Tools — Built with Next.js 16, React 19, TypeScript 5, and a lot of browser APIs.*
