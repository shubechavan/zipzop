import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to Text (OCR) Free — ZipZop Tools",
  description: "Extract text from images online free. Works on photos, scanned documents, ID cards. Supports English and Hindi.",
};

export default function Page() {
  return <ClientToolPage toolType="image-to-text" />;
}
