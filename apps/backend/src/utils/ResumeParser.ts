import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";

export async function parseResume(
  buffer: Buffer,
  fileName: string,
): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf": {
      const data = new Uint8Array(buffer);
      const doc = await pdfjs.getDocument({ data }).promise;
      let text = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        text +=
          content.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ") + "\n";
        page.cleanup();
      }
      doc.destroy();
      return text;
    }
    case "docx": {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case "txt": {
      return buffer.toString("utf-8");
    }
    default:
      throw new Error(`Unsupported file format: .${ext ?? "unknown"}`);
  }
}
