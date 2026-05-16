import ClientToolPage from "@/components/ClientToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passport Photo Maker Free — ZipZop Tools",
  description: "Make passport size photos online free. India 35×45mm, US 51×51mm, UK 40×40mm. Instant download.",
};

export default function Page() {
  return <ClientToolPage toolType="passport-photo" />;
}
