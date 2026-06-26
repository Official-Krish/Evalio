export function buildRoleContext(
  roleTitle: string | null,
  topics: string[] | null,
  evaluationCriteria: string[] | null,
  mustProbe: string[] | null,
): string {
  if (!roleTitle) return "";

  const lines: string[] = [`Role: ${roleTitle}`];

  if (topics && topics.length > 0) {
    lines.push("", "Topics:", ...topics.map((t) => `- ${t}`));
  }

  if (evaluationCriteria && evaluationCriteria.length > 0) {
    lines.push(
      "",
      "Evaluation Criteria:",
      ...evaluationCriteria.map((c) => `- ${c}`),
    );
  }

  if (mustProbe && mustProbe.length > 0) {
    lines.push("", "Must Probe:", ...mustProbe.map((p) => `- ${p}`));
  }

  return lines.join("\n");
}
