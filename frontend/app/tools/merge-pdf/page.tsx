import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF Files Free Online — ZipZop Tools",
  description: "Combine multiple PDF files into one online for free. Drag, drop, merge — no sign-up required.",
};

export default function Page() {
  return <ClientToolPage toolType="merge-pdf" />;
}
