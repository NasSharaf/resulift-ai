// app/utils/pdfExtraction.ts
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

export async function extractResumeText(resumeURL: string): Promise<string> {
  try {
    // Fetch PDF blob
    const pdfBlob = await fetch(resumeURL).then((r) => r.blob());
    
    // Use WebPDFLoader
    const loader = new WebPDFLoader(pdfBlob);
    const docs = await loader.load();
    
    // Combine page contents
    const resumeText = docs
      .map((d) => d.pageContent)
      .join("\n\n")
      .trim();

    // Basic validation
    if (resumeText.length === 0) {
      console.warn('Extracted text is empty');
    }

    return resumeText;
  } catch (error) {
    console.error('PDF Extraction Error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}