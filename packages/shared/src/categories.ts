import type { InterviewMode } from ".";

export const ROLE_CATEGORIES = [
  { id: "engineering", label: "Software Engineering", icon: "code" },
  { id: "devops", label: "DevOps / Infrastructure", icon: "server" },
  { id: "data", label: "Data / Analytics", icon: "chart" },
  { id: "product", label: "Product / Design", icon: "palette" },
  { id: "consulting", label: "Consulting / Business", icon: "briefcase" },
  { id: "management", label: "Engineering Management", icon: "users" },
  { id: "other", label: "Other", icon: "more-horizontal" },
] as const;

export type RoleCategory = (typeof ROLE_CATEGORIES)[number]["id"];

export const CATEGORY_ROUNDS: Record<
  RoleCategory,
  { label: string; mode: InterviewMode }[]
> = {
  engineering: [
    { label: "Behavioral / Experience", mode: "VOICE" },
    { label: "Coding Round (DSA)", mode: "DSA" },
    { label: "System Design", mode: "SYSTEM_DESIGN" },
    { label: "Technical Deep Dive", mode: "VOICE" },
  ],
  devops: [
    { label: "Behavioral / Experience", mode: "VOICE" },
    { label: "Infrastructure Design", mode: "SYSTEM_DESIGN" },
    { label: "Incident Response", mode: "VOICE" },
    { label: "CI/CD & Automation", mode: "VOICE" },
  ],
  data: [
    { label: "Behavioral / Experience", mode: "VOICE" },
    { label: "Data Architecture", mode: "SYSTEM_DESIGN" },
    { label: "SQL & Analytics", mode: "DSA" },
    { label: "ML System Design", mode: "SYSTEM_DESIGN" },
  ],
  consulting: [
    { label: "Behavioral / Experience", mode: "VOICE" },
    { label: "Case Study", mode: "VOICE" },
    { label: "Client Presentation", mode: "VOICE" },
    { label: "Quantitative Analysis", mode: "VOICE" },
  ],
  product: [
    { label: "Product Sense", mode: "VOICE" },
    { label: "Design Critique", mode: "VOICE" },
    { label: "Technical Deep Dive", mode: "VOICE" },
  ],
  management: [
    { label: "Leadership / Behavioral", mode: "VOICE" },
    { label: "System Design", mode: "SYSTEM_DESIGN" },
    { label: "Strategy & Vision", mode: "VOICE" },
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
  const dsa = new Set([
    "Coding Round (DSA)",
    "SQL & Analytics",
    "Technical & Coding",
    "Technical Coding",
    "Coding & Algorithms",
    "Coding & Problem Solving",
  ]);
  const sd = new Set([
    "System Design",
    "Infrastructure Design",
    "Data Architecture",
    "ML System Design",
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
  if (dsa.has(roundName)) return "Live Code";
  if (sd.has(roundName)) return "Live Design";
  return null;
}
