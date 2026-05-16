import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to PDF Free Online — ZipZop Tools",
  description: "Convert JPG, PNG images to PDF free online. Combine multiple images into one PDF file.",
};

export default function Page() {
  return <ClientToolPage toolType="image-to-pdf" />;
}
