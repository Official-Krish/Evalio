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

const RESUME_SECTION_PATTERNS = [
  /\b(experience|work\s*history|employment|professional\s*experience)\b/i,
  /\b(education|academic|qualifications|degree|university|college)\b/i,
  /\b(skills|technologies|technical\s*skills|core\s*competencies|expertise)\b/i,
  /\b(projects|personal\s*projects|key\s*projects)\b/i,
  /\b(summary|profile|objective|about\s*me|professional\s*summary)\b/i,
  /\b(certifications|certificates|licenses|accreditations)\b/i,
];

const MIN_SECTIONS_REQUIRED = 2;

export function validateResumeContent(
  text: string,
  userName: string | undefined,
): { valid: boolean; error?: string } {
  const cleaned = text.trim();
  if (cleaned.length < 100) {
    return {
      valid: false,
      error:
        "That doesn't look like a resume — please upload your actual resume",
    };
  }

  const lines = cleaned.split("\n").filter((l) => l.trim().length > 0);

  const matchedSections = RESUME_SECTION_PATTERNS.filter((pattern) =>
    pattern.test(cleaned),
  );

  if (matchedSections.length < MIN_SECTIONS_REQUIRED) {
    return {
      valid: false,
      error: "Nice try! That's not quite a resume — upload the real deal",
    };
  }

  if (userName) {
    const firstName = userName.split(/\s+/)[0]?.toLowerCase();
    const nameFound = lines.some((line) => {
      const trimmed = line.trim();
      if (firstName && trimmed.toLowerCase().includes(firstName)) {
        return true;
      }
      return false;
    });
    if (!nameFound) {
      return {
        valid: false,
        error:
          "Caught you! This isn't your resume — please upload yours so I can tailor the interview",
      };
    }
  }

  return { valid: true };
}
