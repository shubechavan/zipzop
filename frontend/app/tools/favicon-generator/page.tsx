import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favicon Generator Free — ZipZop Tools",
  description: "Generate favicons in all sizes (16x16 to 256x256) from any image. Free, instant download as ZIP.",
};

export default function Page() {
  return <ClientToolPage toolType="favicon-generator" />;
}
