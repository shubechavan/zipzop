import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video to GIF Free Online — ZipZop Tools",
  description: "Convert any video clip to an animated GIF free online. Runs entirely in your browser — no upload needed.",
};

export default function Page() {
  return <ClientToolPage toolType="video-to-gif" />;
}
