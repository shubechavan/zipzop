"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window { adsbygoogle: unknown[]; }
}

type Props = {
  slot: string;
  format?: "auto" | "horizontal" | "rectangle" | "vertical";
  className?: string;
};

export default function AdBanner({ slot, format = "auto", className = "" }: Props) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const pushed = useRef(false);

  useEffect(() => {
    if (!publisherId || pushed.current) return;
    try {
      pushed.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not loaded yet — safe to ignore
    }
  }, [publisherId]);

  // Dev / pre-approval placeholder
  if (!publisherId) {
    return (
      <div className={`flex items-center justify-center text-xs rounded-xl ${className}`}
        style={{ minHeight: 90, border: "1px dashed rgba(255,255,255,0.07)", color: "var(--muted)", background: "rgba(255,255,255,0.015)" }}>
        Ad — set NEXT_PUBLIC_ADSENSE_ID in Vercel to activate
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
