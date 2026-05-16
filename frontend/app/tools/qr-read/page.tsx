import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code Reader / Scanner — ZipZop Tools",
  description: "Scan and decode any QR code from an image online free. Upload a photo and read the QR code instantly.",
};

export default function Page() {
  return <ClientToolPage toolType="qr-read" />;
}
