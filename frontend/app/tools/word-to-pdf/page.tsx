import ToolPage from "@/components/ToolPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word to PDF — ZipZop Tools",
  description: "Convert DOCX Word files to PDF online for free. Fast and accurate conversion.",
};

export default function Page() {
  return (
    <ToolPage
      title="Word → PDF"
      description="Convert a .docx Word document to PDF. Requires LibreOffice on the server."
      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      endpoint="/api/word/to-pdf"
      outputFilename="converted.pdf"
    />
  );
}
