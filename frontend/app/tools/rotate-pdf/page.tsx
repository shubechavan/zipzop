import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rotate PDF Free Online — ZipZop Tools",
  description: "Rotate all pages of a PDF by 90, 180 or 270 degrees online free. Fast and browser-based.",
};

export default function Page() {
  return <ClientToolPage toolType="rotate-pdf" />;
}
