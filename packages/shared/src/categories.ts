import type { InterviewMode } from ".";

export const ROLE_CATEGORIES = [
  {
    id: "engineering",
    label: "Software Engineering",
    icon: "code",
    description: "Algorithms, system design, coding, and technical depth",
  },
  {
    id: "devops",
    label: "DevOps / Infrastructure",
    icon: "server",
    description: "Cloud, CI/CD, reliability, observability, and automation",
  },
  {
    id: "data",
    label: "Data / Analytics",
    icon: "chart",
    description: "ML, analytics, SQL, experimentation, and data architecture",
  },
  {
    id: "product",
    label: "Product / Design",
    icon: "palette",
    description: "Product sense, design critique, UX, and creative technology",
  },
  {
    id: "consulting",
    label: "Consulting / Business",
    icon: "briefcase",
    description:
      "Case studies, client strategy, frameworks, and stakeholder management",
  },
  {
    id: "management",
    label: "Engineering Management",
    icon: "users",
    description:
      "Leadership, people management, technical strategy, and org design",
  },
  {
    id: "other",
    label: "Other",
    icon: "more-horizontal",
    description: "Custom roles and interdisciplinary fields",
  },
] as const;

export type RoleCategory = (typeof ROLE_CATEGORIES)[number]["id"];

export const CATEGORY_ROUNDS: Record<
  RoleCategory,
  { label: string; mode: InterviewMode }[]
> = {
  engineering: [
    { label: "Behavioral / Experience", mode: "VOICE" },
    { label: "Coding Round (DSA)", mode: "LIVE_CODE" },
    { label: "System Design", mode: "LIVE_CANVAS" },
    { label: "Technical Deep Dive", mode: "VOICE" },
  ],
  devops: [
    { label: "Behavioral / Experience", mode: "VOICE" },
    { label: "Infrastructure Design", mode: "LIVE_CANVAS" },
    { label: "Incident Response", mode: "VOICE" },
    { label: "CI/CD & Automation", mode: "VOICE" },
  ],
  data: [
    { label: "Behavioral / Experience", mode: "VOICE" },
    { label: "Data Architecture", mode: "LIVE_CANVAS" },
    { label: "SQL & Analytics", mode: "LIVE_CODE" },
    { label: "ML System Design", mode: "LIVE_CANVAS" },
  ],
  consulting: [
    { label: "Behavioral / Experience", mode: "VOICE" },
    { label: "Case Study", mode: "VOICE" },
    { label: "Client Presentation", mode: "VOICE" },
    { label: "Quantitative Analysis", mode: "LIVE_CODE" },
  ],
  product: [
    { label: "Product Sense", mode: "LIVE_CANVAS" },
    { label: "Design Critique", mode: "LIVE_CANVAS" },
    { label: "Technical Deep Dive", mode: "VOICE" },
  ],
  management: [
    { label: "Leadership / Behavioral", mode: "VOICE" },
    { label: "System Design", mode: "LIVE_CANVAS" },
    { label: "Strategy & Vision", mode: "LIVE_CANVAS" },
  ],
  other: [
    { label: "Behavioral / Experience", mode: "VOICE" },
    { label: "Technical Deep Dive", mode: "VOICE" },
  ],
};

export const FALLBACK_ROUNDS: { label: string; mode: InterviewMode }[] = [
  { label: "Behavioral / Experience", mode: "VOICE" },
  { label: "Technical Deep Dive", mode: "VOICE" },
];

export function getRoundPill(roundName: string): string | null {
  const liveCode = new Set([
    "Coding Round (DSA)",
    "SQL & Analytics",
    "Quantitative Analysis",
  ]);
  const liveCanvas = new Set([
    "System Design",
    "Infrastructure Design",
    "Data Architecture",
    "ML System Design",
    "Product Sense",
    "Design Critique",
    "Strategy & Vision",
    "System Design & Architecture",
    "System Design & Integration",
    "System Design & Risk",
    "Real-time Systems Design",
    "Observability & System Design",
    "Product Design & Architecture",
    "Architecture & Strategy",
    "Rendering & Collaboration",
    "Blocks & Architecture",
    "Data Integration & Ontology",
  ]);
  if (liveCode.has(roundName)) return "Live Code";
  if (liveCanvas.has(roundName)) return "Live Design";
  return null;
}
