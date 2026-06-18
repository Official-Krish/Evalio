export interface DsaAttemptData {
  id: string;
  index: number;
  code: string | null;
  codeSnapshots: Record<string, string> | null;
  currentPhase: string;
  phasesCompleted: string[];
  score: number | null;
  feedback: string | null;
  complexity: string | null;
}

export interface DsaSessionData {
  id: string;
  questions: Array<{
    dbId: string;
    leetcodeId: number;
    title: string;
    slug: string;
    difficulty: string;
  }>;
  attempts: DsaAttemptData[];
  language: string;
}
