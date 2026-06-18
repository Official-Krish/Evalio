export function getVerdict(score: number): {
  label: string;
  description: string;
} {
  if (score <= 1)
    return {
      label: "Incomplete session",
      description:
        "No responses were recorded. The session ended before any meaningful interaction.",
    };
  if (score <= 3)
    return {
      label: "Needs development",
      description:
        "Significant gaps in responses. Focus on structuring answers with concrete examples.",
    };
  if (score <= 5)
    return {
      label: "Getting started",
      description:
        "Some foundation present but responses lacked depth and specificity.",
    };
  if (score <= 7)
    return {
      label: "Solid performance",
      description:
        "Good answers with relevant examples. Fine-tuning would elevate further.",
    };
  return {
    label: "Strong performance",
    description:
      "Well-structured, specific, and confident responses throughout the session.",
  };
}
