import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF Free Online — ZipZop Tools",
  description: "Split a PDF into individual pages or extract a page range online for free. Browser-based, instant.",
};

export default function Page() {
  return <ClientToolPage toolType="split-pdf" />;
}
