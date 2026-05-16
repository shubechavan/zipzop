import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Upscaler Free — ZipZop Tools",
  description: "Upscale images 2x or 4x online free. Enlarge photos without losing quality.",
};

export default function Page() {
  return <ClientToolPage toolType="image-upscale" />;
}
