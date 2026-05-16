import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word to Text Free Online — ZipZop Tools",
  description: "Extract plain text from a Word DOCX file online for free. No upload, no sign-up needed.",
};

export default function Page() {
  return <ClientToolPage toolType="word-to-text" />;
}
