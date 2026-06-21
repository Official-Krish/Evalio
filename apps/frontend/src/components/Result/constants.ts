export const STYLE_LABELS: Record<string, string> = {
  SUPPORTIVE: "Supportive",
  PROFESSIONAL: "Professional",
  CHALLENGING: "Challenging",
  BAR_RAISER: "Bar Raiser",
};

export const DEPTH_LABELS: Record<string, string> = {
  STANDARD: "Standard",
  PROBING: "Probing",
  CHALLENGE: "Challenge",
  BAR_RAISER: "Bar Raiser",
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "#22c55e",
  MEDIUM: "#eab308",
  HARD: "#ef4444",
};

export const APPROACH_LABELS: Record<
  string,
  { label: string; description: string }
> = {
  understanding: {
    label: "Understanding",
    description:
      "Problem comprehension, requirements, and edge cases discussed",
  },
  brute_force: {
    label: "Brute Force",
    description: "Initial brute force approach and complexity analysis",
  },
  optimization: {
    label: "Optimization",
    description: "Optimized solution with improved complexity",
  },
};
