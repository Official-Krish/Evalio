// Types
export type {
  CandidateHistoryEntry,
  PromptInput,
  SystemDesignPromptInput,
  PacingBudget,
} from "./types";

// Shared
export {
  buildDirectingDirective,
  buildEndSessionInstruction,
  buildInterruptionRules,
  buildCompanyContext,
  buildRoleContext,
  buildRoundDirective,
  buildStyleDirective,
  buildDepthDirective,
  buildGeneralPrinciples,
  buildCandidateHistory,
  buildPacingDirective,
  VOICE_BUDGETS,
  DSA_BUDGETS,
  SD_BUDGETS,
} from "./shared";

// Generic (VOICE)
export { buildInterviewPrompt } from "./generic";

// System Design
export { buildSystemDesignPrompt, buildWhiteboardDirective } from "./sd";

// DSA
export {
  buildDsaSystemPrompt,
  buildDsaEvaluationPrompt,
  DSA_PHASES,
  DSA_EVALUATION_SCHEMA,
} from "./dsa";
export type { DsaPhase, DsaHistoryEntry } from "./dsa";
