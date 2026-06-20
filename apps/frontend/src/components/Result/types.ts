export interface DsaProblemData {
  id: string;
  index: number;
  title: string;
  slug: string;
  difficulty: string;
  description: string;
  code: string | null;
  codeSnapshots: Record<string, string> | null;
  currentPhase: string;
  phasesCompleted: string[];
  score: number | null;
  feedback: string | null;
  complexity: string | null;
  timeTaken: number | null;
  completedAt: string | null;
  createdAt: string;
}

export interface DsaSessionData {
  id: string;
  problems: DsaProblemData[];
  language: string;
  status: string;
  submittedAt: string | null;
  timeTaken: number | null;
  currentIndex: number;
}
