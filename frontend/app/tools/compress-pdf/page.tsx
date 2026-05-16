import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF Free Online — ZipZop Tools",
  description: "Reduce PDF file size online for free. No upload, no sign-up — processed entirely in your browser.",
};

export default function Page() {
  return <ClientToolPage toolType="compress-pdf" />;
}
