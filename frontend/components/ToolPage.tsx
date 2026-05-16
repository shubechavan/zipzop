"use client";

import { useCallback, useRef, useState } from "react";

export type Field = {
  name: string;
  label: string;
  type: "number" | "select" | "checkbox";
  defaultValue?: string | number | boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
};

type Props = {
  title: string;
  description: string;
  accept: string;
  multiple?: boolean;
  endpoint: string;
  fields?: Field[];
  outputFilename?: string;
  fileFieldName?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ToolPage({
  title,
  description,
  accept,
  multiple = false,
  endpoint,
  fields = [],
  outputFilename,
  fileFieldName = "file",
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    setFiles(multiple ? Array.from(incoming) : [incoming[0]]);
    setDone(false);
    setError("");
  }, [multiple]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files.length) { setError("Please select a file first."); return; }
    setLoading(true);
    setError("");
    setDone(false);

    const fd = new FormData(e.currentTarget);
    files.forEach((f) => fd.append(fileFieldName, f));

    try {
      const res = await fetch(`${API}${endpoint}`, { method: "POST", body: fd });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Server error ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="(.+?)"/);
      a.download = match?.[1] ?? outputFilename ?? "download";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFiles([]); setDone(false); setError(""); formRef.current?.reset(); };

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-3xl font-black text-white mb-2">{title}</h1>
      <p className="text-[#888899] mb-10">{description}</p>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Drop zone */}
        <div
          className={`drop-zone flex flex-col items-center justify-center gap-3 py-14 text-center transition-all ${dragging ? "active" : ""}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          {files.length > 0 ? (
            <div className="space-y-1">
              {files.map((f) => (
                <div key={f.name} className="text-sm font-medium text-[#6c63ff]">{f.name}</div>
              ))}
            </div>
          ) : (
            <>
              <div className="text-4xl">☁️</div>
              <div className="text-white font-semibold">Drop file here or click to browse</div>
              <div className="text-xs text-[#888899]">{accept.replace(/,/g, " · ")}</div>
            </>
          )}
        </div>

        {/* Dynamic fields */}
        {fields.length > 0 && (
          <div className="rounded-xl border border-[#2a2a35] bg-[#18181f] p-5 space-y-4">
            {fields.map((f) => (
              <div key={f.name} className="flex items-center justify-between gap-4">
                <label className="text-sm text-[#888899]">{f.label}</label>
                {f.type === "select" && (
                  <select
                    name={f.name}
                    defaultValue={String(f.defaultValue ?? f.options?.[0]?.value ?? "")}
                    className="rounded-lg border border-[#2a2a35] bg-[#0f0f13] text-white text-sm px-3 py-1.5"
                  >
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                )}
                {f.type === "number" && (
                  <input
                    type="number"
                    name={f.name}
                    defaultValue={Number(f.defaultValue ?? 0)}
                    min={f.min}
                    max={f.max}
                    className="w-24 rounded-lg border border-[#2a2a35] bg-[#0f0f13] text-white text-sm px-3 py-1.5"
                  />
                )}
                {f.type === "checkbox" && (
                  <input
                    type="checkbox"
                    name={f.name}
                    defaultChecked={Boolean(f.defaultValue ?? true)}
                    className="w-4 h-4 accent-[#6c63ff]"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {done ? (
          <div className="flex gap-3">
            <div className="flex-1 rounded-xl bg-green-900/30 border border-green-700 text-green-400 text-sm font-medium py-3 text-center">
              ✓ Download started!
            </div>
            <button type="button" onClick={reset} className="btn-primary">
              Process another
            </button>
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading || !files.length}
            className="btn-primary w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Processing…" : "Convert & Download"}
          </button>
        )}
      </form>
    </div>
  );
}
