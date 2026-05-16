import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remove Image Background Free — ZipZop Tools",
  description: "Remove background from any image free online. AI-powered, runs in your browser. No upload, no sign-up.",
};

export default function Page() {
  return <ClientToolPage toolType="remove-background" />;
}
