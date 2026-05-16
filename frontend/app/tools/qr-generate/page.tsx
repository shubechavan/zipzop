import QRGeneratorPage from "@/components/QRGeneratorPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code Generator Free — ZipZop Tools",
  description: "Generate QR codes for any URL, text, or phone number. Free, instant, download PNG or SVG.",
};

export default function Page() {
  return <QRGeneratorPage />;
}
