import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Watermark to PDF Free — ZipZop Tools",
  description: "Add a text watermark to every page of a PDF online free. Customize opacity and text.",
};

export default function Page() {
  return <ClientToolPage toolType="watermark-pdf" />;
}
