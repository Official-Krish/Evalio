import { extractText } from "unpdf";

export async function parseResume(
  buffer: Buffer,
  fileName: string,
): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf": {
      const { text } = await extractText(new Uint8Array(buffer));
      return text.join("\n");
    }
    case "docx": {
      const mammoth = await import("mammoth");
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
