import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress Image Free Online — ZipZop Tools",
  description: "Compress JPG, PNG, WebP images online for free. Reduce file size instantly in your browser — no upload, no sign-up.",
};

export default function Page() {
  return <ClientToolPage toolType="compress-image" />;
}
