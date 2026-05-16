import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convert Image Format Free — ZipZop Tools",
  description: "Convert JPG to PNG, PNG to WebP, and more — free, instant, browser-based. No file upload needed.",
};

export default function Page() {
  return <ClientToolPage toolType="convert-image" />;
}
