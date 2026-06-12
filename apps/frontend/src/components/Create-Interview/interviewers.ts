export interface Interviewer {
  title: string
  icon: string
  tagline: string
  duration: string
  focus: string[]
}

export const interviewers: Interviewer[] = [
  {
    title: "Software Engineer",
    icon: "</>",
    tagline: "Covers system design & algorithms",
    duration: "45 min",
    focus: ["System Design", "Data Structures", "Algorithms"],
  },
  {
    title: "Frontend Engineer",
    icon: "◎",
    tagline: "UI architecture & component design",
    duration: "45 min",
    focus: ["UI Architecture", "Performance", "Accessibility"],
  },
  {
    title: "Backend Engineer",
    icon: "⚙",
    tagline: "API design & data modeling",
    duration: "45 min",
    focus: ["API Design", "Database Modeling", "Architecture"],
  },
  {
    title: "Data Scientist",
    icon: "◈",
    tagline: "ML, statistics & experimentation",
    duration: "60 min",
    focus: ["ML Modelling", "Statistics", "Experimentation"],
  },
  {
    title: "Product Manager",
    icon: "△",
    tagline: "Strategy, execution & leadership",
    duration: "45 min",
    focus: ["Strategy", "Execution", "Cross-functional"],
  },
  {
    title: "DevOps Engineer",
    icon: "□",
    tagline: "Infrastructure & CI/CD pipelines",
    duration: "60 min",
    focus: ["Infrastructure", "CI/CD", "Reliability"],
  },
]
