import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Images Free Online — ZipZop Tools",
  description: "Convert PDF pages to JPG images online for free. Each page becomes a separate image. Download as ZIP.",
};

export default function Page() {
  return <ClientToolPage toolType="pdf-to-images" />;
}
