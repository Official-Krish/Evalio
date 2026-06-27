import type { InterviewMode } from "@evalio/shared";
import {
  buildInterviewPrompt,
  buildCaseStudyPrompt,
  buildProductSensePrompt,
  buildScenarioPrompt,
} from "./generic";
import type { PromptInput } from "./types";
import { buildDsaSystemPrompt, buildDsaSqlPrompt } from "./dsa";
import {
  buildSystemDesignPrompt,
  buildSdInfraPrompt,
  buildSdDataArchPrompt,
  buildSdMlPrompt,
} from "./sd";
import type { SystemDesignPromptInput } from "./types";

interface RoundRoute {
  mode: InterviewMode;
  builder:
    | "dsa_standard"
    | "dsa_sql"
    | "sd_standard"
    | "sd_infra"
    | "sd_data_arch"
    | "sd_ml"
    | "voice_standard"
    | "voice_case_study"
    | "voice_product_sense"
    | "voice_scenario";
}

const ROUTER: Record<string, RoundRoute> = {
  "Coding Round (DSA)": { mode: "DSA", builder: "dsa_standard" },
  "SQL & Analytics": { mode: "DSA", builder: "dsa_sql" },
  "System Design": { mode: "SYSTEM_DESIGN", builder: "sd_standard" },
  "Infrastructure Design": { mode: "SYSTEM_DESIGN", builder: "sd_infra" },
  "Data Architecture": { mode: "SYSTEM_DESIGN", builder: "sd_data_arch" },
  "ML System Design": { mode: "SYSTEM_DESIGN", builder: "sd_ml" },
  "Case Study": { mode: "VOICE", builder: "voice_case_study" },
  "Product Sense": { mode: "VOICE", builder: "voice_product_sense" },
  "Design Critique": { mode: "VOICE", builder: "voice_product_sense" },
  "Client Presentation": { mode: "VOICE", builder: "voice_scenario" },
  "Quantitative Analysis": { mode: "VOICE", builder: "voice_scenario" },
  "Incident Response": { mode: "VOICE", builder: "voice_scenario" },
  "CI/CD & Automation": { mode: "VOICE", builder: "voice_scenario" },
  "Leadership / Behavioral": { mode: "VOICE", builder: "voice_standard" },
  "Behavioral / Experience": { mode: "VOICE", builder: "voice_standard" },
  "Technical Deep Dive": { mode: "VOICE", builder: "voice_standard" },
  "Strategy & Vision": { mode: "VOICE", builder: "voice_standard" },
};

const MODE_DEFAULTS: Record<string, RoundRoute> = {
  DSA: { mode: "DSA", builder: "dsa_standard" },
  SYSTEM_DESIGN: { mode: "SYSTEM_DESIGN", builder: "sd_standard" },
  VOICE: { mode: "VOICE", builder: "voice_standard" },
};

export interface ResolvedRoute {
  mode: InterviewMode;
  builder: string;
}

export function resolveRoute(
  interviewRound: string | null | undefined,
  mode: string | null | undefined,
): ResolvedRoute {
  const route = interviewRound ? ROUTER[interviewRound] : undefined;
  if (route) return route;
  const modeKey = mode ?? "VOICE";
  return MODE_DEFAULTS[modeKey] ?? MODE_DEFAULTS["VOICE"]!;
}

export function buildPromptFromRoute(
  route: ResolvedRoute,
  params: {
    dsaQuestions?: Array<{
      index: number;
      title: string;
      description: string;
      difficulty: string;
    }>;
    dsaContext?: any;
    dsaHistory?: any;
    dsaDurationMinutes?: number;
    sdInput?: SystemDesignPromptInput & { sdQuestion?: any };
    voiceInput?: PromptInput;
  },
): string {
  switch (route.builder) {
    case "dsa_standard":
      return buildDsaSystemPrompt(
        params.dsaQuestions ?? [],
        params.dsaContext,
        params.dsaHistory,
        params.dsaDurationMinutes,
      );
    case "dsa_sql":
      return buildDsaSqlPrompt(
        params.dsaQuestions ?? [],
        params.dsaContext,
        params.dsaHistory,
        params.dsaDurationMinutes,
      );
    case "sd_infra":
      return buildSdInfraPrompt(params.sdInput!);
    case "sd_data_arch":
      return buildSdDataArchPrompt(params.sdInput!);
    case "sd_ml":
      return buildSdMlPrompt(params.sdInput!);
    case "voice_case_study":
      return buildCaseStudyPrompt(params.voiceInput!);
    case "voice_product_sense":
      return buildProductSensePrompt(params.voiceInput!);
    case "voice_scenario":
      return buildScenarioPrompt(params.voiceInput!);
    case "sd_standard":
      return buildSystemDesignPrompt(params.sdInput!);
    case "voice_standard":
    default:
      return buildInterviewPrompt(params.voiceInput!);
  }
}
