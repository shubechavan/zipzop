import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resize Image Free Online — ZipZop Tools",
  description: "Resize images by pixel dimensions online for free. JPG, PNG, WebP — works in your browser.",
};

export default function Page() {
  return <ClientToolPage toolType="resize-image" />;
}
