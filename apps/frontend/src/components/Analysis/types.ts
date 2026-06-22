export type Session = {
  id: string;
  companyName: string | null;
  roleTitle: string | null;
  overallScore: number | null;
  communicationScore: number | null;
  technicalScore: number | null;
  problemSolvingScore: number | null;
  durationSeconds: number | null;
  createdAt: string;
  mode: string;
  summary: {
    strengths: string[];
    weaknesses: string[];
    improvementAreas: string[];
    summary: string;
  } | null;
};

export type SkillProfile = Record<string, unknown> | null;
