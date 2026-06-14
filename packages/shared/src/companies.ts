export type InterviewStyle =
  | "SUPPORTIVE"
  | "PROFESSIONAL"
  | "CHALLENGING"
  | "BAR_RAISER";
export type InterviewDepth =
  | "STANDARD"
  | "PROBING"
  | "CHALLENGE"
  | "BAR_RAISER";

export interface CompanyRole {
  title: string;
  description: string;
  topics: string[];
  evaluationCriteria: string[];
  mustProbe: string[];
  duration: number;
}

export interface CompanyConfig {
  id: string;
  name: string;
  description: string;
  culture: string[];
  interviewerBehavior: string[];
  evaluationBiases: string[];
  roles: CompanyRole[];
  interviewRounds: string[];
  defaultStyle: InterviewStyle;
  defaultDepth: InterviewDepth;
  durationMinutes: number;
}

export const companies: CompanyConfig[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Fast-paced fintech. High ownership, deep tradeoffs.",
    culture: [
      "High ownership — engineers own their code end-to-end",
      "Strong technical judgment — every decision is a tradeoff",
      "Fast execution — move without breaking things",
    ],
    interviewerBehavior: [
      "Push on tradeoffs — ask why X over Y",
      "Challenge assumptions — probe reliability and scale decisions",
      "Demand specifics — avoid abstract answers",
    ],
    evaluationBiases: [
      "Prefers candidates who defend architectural decisions",
      "Values operational thinking over feature delivery",
    ],
    defaultStyle: "CHALLENGING",
    defaultDepth: "CHALLENGE",
    durationMinutes: 10,
    roles: [
      {
        title: "Backend Engineer",
        description: "API design, data modeling, scale",
        topics: ["Distributed Systems", "Databases", "APIs", "Caching"],
        evaluationCriteria: ["Architecture", "Scalability", "Technical Depth"],
        mustProbe: [
          "Past backend projects",
          "System failures",
          "Design decisions",
        ],
        duration: 10,
      },
      {
        title: "Payments Engineer",
        description: "Financial systems, reliability, fraud",
        topics: [
          "Payment Systems",
          "Reliability",
          "Fraud Detection",
          "Financial Modeling",
        ],
        evaluationCriteria: [
          "Reliability",
          "Domain Knowledge",
          "Technical Depth",
        ],
        mustProbe: [
          "Financial system experience",
          "Incident handling",
          "Tradeoff reasoning",
        ],
        duration: 10,
      },
      {
        title: "Platform Engineer",
        description: "Infrastructure, developer tools, CI",
        topics: [
          "Infrastructure",
          "Developer Tools",
          "CI/CD",
          "Platform Design",
        ],
        evaluationCriteria: [
          "Platform Thinking",
          "Automation",
          "Technical Depth",
        ],
        mustProbe: [
          "Infrastructure decisions",
          "Developer experience focus",
          "Scalability approach",
        ],
        duration: 10,
      },
    ],
    interviewRounds: [
      "Phone Screen",
      "Technical Deep Dive",
      "System Design",
      "Leadership & Behavior",
    ],
  },
  {
    id: "amazon",
    name: "Amazon",
    description: "Leadership-heavy. Behavioral depth. Bar raiser culture.",
    culture: [
      "Customer obsession — start with the customer and work backward",
      "Ownership — think long-term, never say 'that's not my job'",
      "Bias for action — speed matters in business",
    ],
    interviewerBehavior: [
      "Use STAR method — probe Situation, Task, Action, Result",
      "Push on leadership principles — ask for specific examples",
      "Bar raiser standards — evaluate for the whole company, not just the team",
    ],
    evaluationBiases: [
      "Prioritizes behavioral evidence over technical breadth",
      "Values candidates who can disagree and commit",
    ],
    defaultStyle: "BAR_RAISER",
    defaultDepth: "CHALLENGE",
    durationMinutes: 10,
    roles: [
      {
        title: "SDE",
        description: "Software development at Amazon scale",
        topics: ["Algorithms", "System Design", "Distributed Systems"],
        evaluationCriteria: [
          "Technical Depth",
          "Scalability",
          "Leadership Principles",
        ],
        mustProbe: ["Past projects", "Design decisions", "Conflict resolution"],
        duration: 10,
      },
      {
        title: "Product Manager",
        description: "Strategy, execution, customer obsession",
        topics: ["Strategy", "Execution", "Customer Focus", "Metrics"],
        evaluationCriteria: ["Product Thinking", "Execution", "Communication"],
        mustProbe: [
          "Product launches",
          "Tradeoff decisions",
          "Stakeholder management",
        ],
        duration: 10,
      },
      {
        title: "Solutions Architect",
        description: "Enterprise solutions, cloud architecture",
        topics: ["Cloud Architecture", "Enterprise", "Scalability", "Security"],
        evaluationCriteria: [
          "Architecture",
          "Customer Focus",
          "Technical Breadth",
        ],
        mustProbe: [
          "Enterprise solution design",
          "Customer interactions",
          "Scale challenges",
        ],
        duration: 10,
      },
    ],
    interviewRounds: [
      "Phone Screen",
      "Technical Coding",
      "System Design & Architecture",
      "Leadership Principles & Behavior",
    ],
  },
  {
    id: "google",
    name: "Google",
    description: "Structured, academic rigor. Algorithm-heavy.",
    culture: [
      "Academic rigor — deep analytical thinking",
      "Clean code — clarity and maintainability matter",
      "Googlyness — culture fit and collaboration",
    ],
    interviewerBehavior: [
      "Focus on algorithms and data structures",
      "Push on complexity analysis and tradeoffs",
      "Probe for clean, well-structured solutions",
    ],
    evaluationBiases: [
      "Prioritizes problem-solving process over speed",
      "Values generalist engineering ability over specialization",
    ],
    defaultStyle: "PROFESSIONAL",
    defaultDepth: "PROBING",
    durationMinutes: 12,
    roles: [
      {
        title: "Software Engineer",
        description: "Full stack, algorithms, system design",
        topics: [
          "Algorithms",
          "Data Structures",
          "System Design",
          "Complexity Analysis",
        ],
        evaluationCriteria: [
          "Problem Solving",
          "Technical Depth",
          "Communication",
        ],
        mustProbe: [
          "Algorithm choices",
          "Scalability thinking",
          "Design tradeoffs",
        ],
        duration: 12,
      },
      {
        title: "Data Scientist",
        description: "ML modelling, experimentation, statistics",
        topics: ["ML", "Statistics", "Experimentation", "Data Analysis"],
        evaluationCriteria: [
          "Statistical Rigor",
          "Technical Depth",
          "Experimental Design",
        ],
        mustProbe: ["Past ML projects", "Metric design", "Model evaluation"],
        duration: 12,
      },
      {
        title: "UX Engineer",
        description: "Prototyping, interaction design, accessibility",
        topics: [
          "Prototyping",
          "Interaction Design",
          "Accessibility",
          "Frontend",
        ],
        evaluationCriteria: [
          "Design Thinking",
          "Technical Execution",
          "User Focus",
        ],
        mustProbe: [
          "Design system experience",
          "Accessibility approach",
          "Cross-functional collaboration",
        ],
        duration: 12,
      },
    ],
    interviewRounds: [
      "Phone Screen",
      "Coding & Algorithms",
      "System Design",
      "Googleyness & Leadership",
    ],
  },
  {
    id: "meta",
    name: "Meta",
    description: "Move fast. Product-impact driven. Full stack bias.",
    culture: [
      "Move fast — iterate quickly, ship often",
      "Product impact — every line of code connects to user value",
      "Full-stack ownership — engineers own from idea to deployment",
    ],
    interviewerBehavior: [
      "Push on speed-quality tradeoffs",
      "Probe for product sense and impact awareness",
      "Ask about cross-system thinking at planetary scale",
    ],
    evaluationBiases: [
      "Values generalist full-stack ability",
      "Prefers candidates who think in terms of product outcomes",
    ],
    defaultStyle: "CHALLENGING",
    defaultDepth: "PROBING",
    durationMinutes: 10,
    roles: [
      {
        title: "Frontend Engineer",
        description: "UI architecture, performance, product",
        topics: [
          "UI Architecture",
          "Performance",
          "Product Sense",
          "JavaScript",
        ],
        evaluationCriteria: [
          "Technical Depth",
          "Product Thinking",
          "Execution",
        ],
        mustProbe: [
          "Past frontend work",
          "Performance optimization",
          "Product decisions",
        ],
        duration: 10,
      },
      {
        title: "ML Engineer",
        description: "Recommendation systems, ranking, AI",
        topics: ["ML Systems", "Recommendations", "Ranking", "Data Pipelines"],
        evaluationCriteria: ["ML Depth", "System Design", "Experimentation"],
        mustProbe: [
          "ML model deployment",
          "Feature engineering",
          "A/B testing experience",
        ],
        duration: 10,
      },
      {
        title: "Infrastructure Engineer",
        description: "Distributed systems, data warehouse",
        topics: [
          "Distributed Systems",
          "Databases",
          "Networking",
          "Infrastructure",
        ],
        evaluationCriteria: ["System Design", "Reliability", "Scalability"],
        mustProbe: [
          "Infrastructure decisions",
          "Incident response",
          "Capacity planning",
        ],
        duration: 10,
      },
    ],
    interviewRounds: [
      "Phone Screen",
      "Coding & Problem Solving",
      "Product Design & Architecture",
      "Behavioral & PMA",
    ],
  },
  {
    id: "netflix",
    name: "Netflix",
    description: "Freedom & responsibility. Elite bar. Senior-only vibe.",
    culture: [
      "Freedom and responsibility — high autonomy, high accountability",
      "Elite bar — only hire the best, no hand-holding",
      "Act in Netflix's best interest — judgment over rules",
    ],
    interviewerBehavior: [
      "Push on decision-making with limited information",
      "Probe for deep domain expertise, not breadth",
      "Challenge ownership — ask what they personally drove",
    ],
    evaluationBiases: [
      "Prefers senior candidates with strong opinions",
      "Values candor and direct communication",
    ],
    defaultStyle: "BAR_RAISER",
    defaultDepth: "BAR_RAISER",
    durationMinutes: 8,
    roles: [
      {
        title: "Backend Engineer",
        description: "Microservices, API gateways, CDN",
        topics: ["Microservices", "APIs", "Content Delivery", "Reliability"],
        evaluationCriteria: ["Technical Depth", "System Design", "Ownership"],
        mustProbe: [
          "Microservice architecture decisions",
          "Incident handling",
          "Performance optimization",
        ],
        duration: 8,
      },
      {
        title: "Data Engineer",
        description: "Data pipelines, analytics, A/B testing",
        topics: ["Data Pipelines", "Analytics", "A/B Testing", "Streaming"],
        evaluationCriteria: [
          "Data Architecture",
          "Experimentation",
          "Technical Depth",
        ],
        mustProbe: [
          "Data pipeline design",
          "A/B testing methodology",
          "Scale challenges",
        ],
        duration: 8,
      },
      {
        title: "SRE",
        description: "Chaos engineering, reliability, automation",
        topics: [
          "Chaos Engineering",
          "Reliability",
          "Automation",
          "Incident Response",
        ],
        evaluationCriteria: [
          "Reliability Engineering",
          "Automation",
          "System Thinking",
        ],
        mustProbe: [
          "Chaos engineering experience",
          "Incident response approach",
          "Automation philosophy",
        ],
        duration: 8,
      },
    ],
    interviewRounds: [
      "Phone Screen",
      "Technical Deep Dive",
      "Architecture & Strategy",
      "Leadership & Culture",
    ],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    description: "Enterprise rigor. Cross-team collaboration.",
    culture: [
      "Enterprise rigor — reliability and predictability matter",
      "Growth mindset — learn from everything",
      "Cross-team collaboration — no silos",
    ],
    interviewerBehavior: [
      "Focus on structured problem-solving",
      "Push on design patterns and testing methodology",
      "Probe for cross-team collaboration examples",
    ],
    evaluationBiases: [
      "Values thoroughness over speed",
      "Prefers candidates who document and communicate clearly",
    ],
    defaultStyle: "PROFESSIONAL",
    defaultDepth: "STANDARD",
    durationMinutes: 12,
    roles: [
      {
        title: "Software Engineer",
        description: "Enterprise software, cloud services",
        topics: [
          "Design Patterns",
          "Cloud Services",
          "Testing",
          "Architecture",
        ],
        evaluationCriteria: ["Technical Depth", "Design", "Collaboration"],
        mustProbe: [
          "Large-scale system design",
          "Testing strategies",
          "Cross-team projects",
        ],
        duration: 12,
      },
      {
        title: "DevOps Engineer",
        description: "Azure, CI/CD, infrastructure as code",
        topics: ["Azure", "CI/CD", "Infrastructure as Code", "Automation"],
        evaluationCriteria: ["Infrastructure", "Automation", "Reliability"],
        mustProbe: [
          "Infrastructure migration",
          "CI/CD pipeline design",
          "Incident response",
        ],
        duration: 12,
      },
      {
        title: "AI Engineer",
        description: "LLMs, Copilot, AI integration",
        topics: ["LLMs", "AI Integration", "Prompt Engineering", "ML Systems"],
        evaluationCriteria: ["AI Depth", "System Design", "Product Thinking"],
        mustProbe: [
          "LLM application experience",
          "Prompt engineering approach",
          "AI product integration",
        ],
        duration: 12,
      },
    ],
    interviewRounds: [
      "Phone Screen",
      "Technical & Coding",
      "System Design & Architecture",
      "Behavioral & Growth",
    ],
  },
  {
    id: "apple",
    name: "Apple",
    description: "Craftsmanship. Privacy-first. Hardware-software integration.",
    culture: [
      "Craftsmanship over speed — polish matters",
      "Privacy-first mindset — protect the user",
      "Hardware-software integration — think full system",
    ],
    interviewerBehavior: [
      "Push on attention to detail",
      "Probe for performance and energy efficiency thinking",
      "Ask about UX polish and fit-and-finish",
    ],
    evaluationBiases: [
      "Values depth over breadth in a specific domain",
      "Prefers candidates who sweat the details",
    ],
    defaultStyle: "CHALLENGING",
    defaultDepth: "PROBING",
    durationMinutes: 12,
    roles: [
      {
        title: "iOS Engineer",
        description: "SwiftUI, UIKit, performance",
        topics: ["SwiftUI", "UIKit", "Performance", "Architecture"],
        evaluationCriteria: ["Technical Depth", "Craftsmanship", "Performance"],
        mustProbe: [
          "Past iOS projects",
          "Performance optimization",
          "Architecture decisions",
        ],
        duration: 12,
      },
      {
        title: "Hardware Engineer",
        description: "SoC design, firmware, integration",
        topics: ["SoC", "Firmware", "Hardware Integration", "Power Management"],
        evaluationCriteria: ["Hardware Depth", "System Thinking", "Precision"],
        mustProbe: [
          "Hardware design projects",
          "Integration challenges",
          "Power optimization",
        ],
        duration: 12,
      },
      {
        title: "Security Engineer",
        description: "Privacy, cryptography, device security",
        topics: [
          "Privacy",
          "Cryptography",
          "Device Security",
          "Threat Modeling",
        ],
        evaluationCriteria: ["Security Depth", "System Thinking", "Privacy"],
        mustProbe: [
          "Security architecture experience",
          "Privacy implementation",
          "Threat modeling approach",
        ],
        duration: 12,
      },
    ],
    interviewRounds: [
      "Phone Screen",
      "Technical & Coding",
      "System Design & Integration",
      "Craftsmanship & Behavior",
    ],
  },
  {
    id: "uber",
    name: "Uber",
    description: "Real-time systems. High scale. Operational intensity.",
    culture: [
      "Operational intensity — reliability at global scale",
      "Real-time decision-making — every millisecond counts",
      "Merchant and driver focus — platform thinking",
    ],
    interviewerBehavior: [
      "Push on latency optimization and reliability",
      "Probe for incident response and operational experience",
      "Ask about geo-distributed architecture tradeoffs",
    ],
    evaluationBiases: [
      "Values real-time systems experience",
      "Prefers candidates who have dealt with production incidents",
    ],
    defaultStyle: "PROFESSIONAL",
    defaultDepth: "CHALLENGE",
    durationMinutes: 10,
    roles: [
      {
        title: "Backend Engineer",
        description: "Real-time systems, microservices, scale",
        topics: ["Real-time Systems", "Microservices", "Scale", "Latency"],
        evaluationCriteria: ["System Design", "Reliability", "Technical Depth"],
        mustProbe: [
          "Real-time system design",
          "Latency optimization",
          "Production incidents",
        ],
        duration: 10,
      },
      {
        title: "Mobile Engineer",
        description: "Cross-platform, maps, real-time UX",
        topics: ["Mobile", "Maps", "Real-time UX", "Performance"],
        evaluationCriteria: ["Mobile Depth", "UX", "Performance"],
        mustProbe: [
          "Mobile architecture",
          "Map integration",
          "Performance optimization",
        ],
        duration: 10,
      },
      {
        title: "Data Scientist",
        description: "Marketplace dynamics, forecasting, ML",
        topics: ["Marketplace", "Forecasting", "ML", "Experimentation"],
        evaluationCriteria: ["Analytical Rigor", "ML Depth", "Business Impact"],
        mustProbe: [
          "Marketplace modeling",
          "Forecasting approach",
          "Experiment design",
        ],
        duration: 10,
      },
    ],
    interviewRounds: [
      "Phone Screen",
      "Technical & Coding",
      "Real-time Systems Design",
      "Operational & Behavior",
    ],
  },
  {
    id: "airbnb",
    name: "Airbnb",
    description: "Design-driven. Host-centric. Full-stack generalist.",
    culture: [
      "Design-driven engineering — craft matters",
      "Host-centric mindset — build for the community",
      "Full-stack ownership — own it from frontend to backend",
    ],
    interviewerBehavior: [
      "Push on A/B testing and experimentation methodology",
      "Probe for internationalization and accessibility thinking",
      "Ask about trust and safety from a product perspective",
    ],
    evaluationBiases: [
      "Values full-stack generalist ability",
      "Prefers candidates who think about the host experience",
    ],
    defaultStyle: "SUPPORTIVE",
    defaultDepth: "PROBING",
    durationMinutes: 12,
    roles: [
      {
        title: "Fullstack Engineer",
        description: "Web, mobile, design systems",
        topics: ["Fullstack", "Design Systems", "A/B Testing", "Performance"],
        evaluationCriteria: [
          "Technical Breadth",
          "Product Thinking",
          "Craftsmanship",
        ],
        mustProbe: [
          "Full-stack projects",
          "Design system contributions",
          "Experiment ownership",
        ],
        duration: 12,
      },
      {
        title: "Design Engineer",
        description: "Design tools, prototyping, animation",
        topics: ["Design Tools", "Prototyping", "Animation", "Frontend"],
        evaluationCriteria: [
          "Design Thinking",
          "Technical Execution",
          "Creativity",
        ],
        mustProbe: [
          "Design tooling experience",
          "Animation work",
          "Cross-functional collaboration",
        ],
        duration: 12,
      },
      {
        title: "Staff Engineer",
        description: "Architecture, mentorship, technical strategy",
        topics: [
          "Architecture",
          "Mentorship",
          "Technical Strategy",
          "Cross-team",
        ],
        evaluationCriteria: [
          "Technical Leadership",
          "Strategic Thinking",
          "Impact",
        ],
        mustProbe: [
          "Technical strategy examples",
          "Mentorship approach",
          "Cross-team influence",
        ],
        duration: 12,
      },
    ],
    interviewRounds: [
      "Phone Screen",
      "Technical & Coding",
      "Product Design & Architecture",
      "Host-centric & Behavior",
    ],
  },
  {
    id: "datadog",
    name: "Datadog",
    description: "Observability-first. Developer tools. Fast shipping.",
    culture: [
      "Observability-first — measure everything",
      "Developer tools mindset — build for other engineers",
      "Fast shipping — iterate on customer feedback",
    ],
    interviewerBehavior: [
      "Push on monitoring and observability philosophy",
      "Probe for API design and integration patterns",
      "Ask about reliability engineering practices",
    ],
    evaluationBiases: [
      "Values candidates who think about systems holistically",
      "Prefers experience with distributed tracing and metrics",
    ],
    defaultStyle: "PROFESSIONAL",
    defaultDepth: "STANDARD",
    durationMinutes: 12,
    roles: [
      {
        title: "SRE",
        description: "Monitoring, incident response, reliability",
        topics: [
          "Monitoring",
          "Incident Response",
          "Reliability",
          "Observability",
        ],
        evaluationCriteria: [
          "Reliability Engineering",
          "System Thinking",
          "Automation",
        ],
        mustProbe: [
          "Monitoring strategy",
          "Incident response experience",
          "Reliability improvements",
        ],
        duration: 12,
      },
      {
        title: "Cloud Engineer",
        description: "Multi-cloud, Kubernetes, infrastructure",
        topics: ["Multi-cloud", "Kubernetes", "Infrastructure", "Networking"],
        evaluationCriteria: [
          "Infrastructure Depth",
          "Automation",
          "Scalability",
        ],
        mustProbe: [
          "Cloud migration experience",
          "Kubernetes deployment",
          "Infrastructure decisions",
        ],
        duration: 12,
      },
      {
        title: "Support Engineer",
        description: "Customer-facing technical support, debugging",
        topics: ["Customer Support", "Debugging", "Documentation", "APIs"],
        evaluationCriteria: [
          "Technical Communication",
          "Problem Solving",
          "Customer Focus",
        ],
        mustProbe: [
          "Customer-facing experience",
          "Debugging complex issues",
          "Documentation approach",
        ],
        duration: 12,
      },
    ],
    interviewRounds: [
      "Phone Screen",
      "Technical & Coding",
      "Observability & System Design",
      "SRE & Reliability",
    ],
  },
  {
    id: "deloitte-usi",
    name: "Deloitte USI",
    description: "Consulting rigor. Client delivery. Structured methodology.",
    culture: [
      "Consulting rigor — structured problem-solving",
      "Client delivery focus — excellence in execution",
      "Stakeholder management — communicate at all levels",
    ],
    interviewerBehavior: [
      "Push on frameworks and structured thinking",
      "Probe for client delivery experience",
      "Ask about stakeholder management and communication",
    ],
    evaluationBiases: [
      "Values structured methodology over improvisation",
      "Prefers candidates who demonstrate client focus",
    ],
    defaultStyle: "PROFESSIONAL",
    defaultDepth: "PROBING",
    durationMinutes: 12,
    roles: [
      {
        title: "Consultant",
        description: "Client delivery, strategy, analysis",
        topics: ["Client Delivery", "Strategy", "Analysis", "Frameworks"],
        evaluationCriteria: [
          "Structured Thinking",
          "Communication",
          "Execution",
        ],
        mustProbe: [
          "Client engagement experience",
          "Framework application",
          "Deliverable ownership",
        ],
        duration: 12,
      },
      {
        title: "Data Analyst",
        description: "Data modelling, visualization, insights",
        topics: ["Data Modelling", "Visualization", "Insights", "SQL"],
        evaluationCriteria: [
          "Analytical Rigor",
          "Communication",
          "Technical Depth",
        ],
        mustProbe: [
          "Data analysis projects",
          "Visualization approach",
          "Insight delivery",
        ],
        duration: 12,
      },
      {
        title: "Cloud Architect",
        description: "Cloud migration, architecture, best practices",
        topics: [
          "Cloud Migration",
          "Architecture",
          "Best Practices",
          "Security",
        ],
        evaluationCriteria: ["Architecture", "Technical Depth", "Client Focus"],
        mustProbe: [
          "Cloud migration experience",
          "Architecture decisions",
          "Best practice implementation",
        ],
        duration: 12,
      },
    ],
    interviewRounds: [
      "Phone Screen",
      "Case Study & Analysis",
      "Technical & Architecture",
      "Client & Behavior",
    ],
  },
  {
    id: "goldman-sachs",
    name: "Goldman Sachs",
    description: "Financial engineering. Precision. High-stakes systems.",
    culture: [
      "Precision — correctness is non-negotiable",
      "High-stakes systems — failure is not an option",
      "Financial rigor — understand the business domain",
    ],
    interviewerBehavior: [
      "Push on edge cases and correctness",
      "Probe for low-latency and high-throughput experience",
      "Ask about regulatory and compliance thinking",
    ],
    evaluationBiases: [
      "Values precision and thoroughness over speed",
      "Prefers candidates with financial domain knowledge",
    ],
    defaultStyle: "BAR_RAISER",
    defaultDepth: "CHALLENGE",
    durationMinutes: 8,
    roles: [
      {
        title: "Quant Developer",
        description: "Low-latency trading, financial modelling",
        topics: [
          "Low-latency",
          "Financial Modelling",
          "Trading Systems",
          "C++",
        ],
        evaluationCriteria: [
          "Technical Depth",
          "Precision",
          "Domain Knowledge",
        ],
        mustProbe: [
          "Low-latency experience",
          "Financial modeling",
          "Trading system design",
        ],
        duration: 8,
      },
      {
        title: "Risk Analyst",
        description: "Risk modelling, compliance, reporting",
        topics: ["Risk Modelling", "Compliance", "Reporting", "Regulation"],
        evaluationCriteria: [
          "Analytical Rigor",
          "Domain Knowledge",
          "Communication",
        ],
        mustProbe: [
          "Risk model experience",
          "Regulatory knowledge",
          "Reporting approach",
        ],
        duration: 8,
      },
      {
        title: "Platform Engineer",
        description: "Trading platforms, data pipelines, infra",
        topics: [
          "Trading Platforms",
          "Data Pipelines",
          "Infrastructure",
          "Reliability",
        ],
        evaluationCriteria: ["System Design", "Reliability", "Technical Depth"],
        mustProbe: [
          "Platform architecture",
          "Data pipeline design",
          "Reliability approach",
        ],
        duration: 8,
      },
    ],
    interviewRounds: [
      "Phone Screen",
      "Technical & Coding",
      "System Design & Risk",
      "Compliance & Behavior",
    ],
  },
  {
    id: "palantir",
    name: "Palantir",
    description: "Mission-driven. Forward deployed. Data integration.",
    culture: [
      "Mission-driven — build software that matters",
      "Forward deployed — engineers work with customers in the field",
      "Data integration — make sense of complex, messy data",
    ],
    interviewerBehavior: [
      "Push on data integration and ontology design",
      "Probe for customer-facing engineering experience",
      "Ask about security and scalability in sensitive environments",
    ],
    evaluationBiases: [
      "Values candidates who thrive in ambiguity",
      "Prefers full-stack thinking with security awareness",
    ],
    defaultStyle: "CHALLENGING",
    defaultDepth: "BAR_RAISER",
    durationMinutes: 8,
    roles: [
      {
        title: "Forward Deployed Engineer",
        description: "Customer-facing, data integration, deployment",
        topics: [
          "Customer-facing",
          "Data Integration",
          "Deployment",
          "Ontology",
        ],
        evaluationCriteria: [
          "Technical Breadth",
          "Customer Focus",
          "Problem Solving",
        ],
        mustProbe: [
          "Customer engagement experience",
          "Data integration projects",
          "Deployment challenges",
        ],
        duration: 8,
      },
      {
        title: "Data Engineer",
        description: "Data pipelines, ontology, ETL",
        topics: ["Data Pipelines", "Ontology", "ETL", "Data Modeling"],
        evaluationCriteria: [
          "Data Architecture",
          "Technical Depth",
          "System Thinking",
        ],
        mustProbe: [
          "Pipeline architecture",
          "Ontology design",
          "Data quality approach",
        ],
        duration: 8,
      },
      {
        title: "Security Engineer",
        description: "Security, authentication, compliance",
        topics: ["Security", "Authentication", "Compliance", "Threat Modeling"],
        evaluationCriteria: ["Security Depth", "System Thinking", "Compliance"],
        mustProbe: [
          "Security architecture",
          "Authentication systems",
          "Compliance experience",
        ],
        duration: 8,
      },
    ],
    interviewRounds: [
      "Phone Screen",
      "Technical & Coding",
      "Data Integration & Ontology",
      "Mission & Behavior",
    ],
  },
  {
    id: "figma",
    name: "Figma",
    description: "Design x engineering. WebAssembly. Real-time collaboration.",
    culture: [
      "Design meets engineering — build for creative professionals",
      "Real-time collaboration — every user sees the same thing",
      "WebAssembly performance — push the browser to its limits",
    ],
    interviewerBehavior: [
      "Push on rendering optimization and canvas architecture",
      "Probe for real-time collaboration and conflict resolution",
      "Ask about API design for a developer ecosystem",
    ],
    evaluationBiases: [
      "Values candidates who care about developer experience",
      "Prefers deep frontend expertise with performance focus",
    ],
    defaultStyle: "SUPPORTIVE",
    defaultDepth: "STANDARD",
    durationMinutes: 12,
    roles: [
      {
        title: "Design Engineer",
        description: "Design systems, prototyping, creative coding",
        topics: ["Design Systems", "Prototyping", "Creative Coding", "WebGL"],
        evaluationCriteria: [
          "Design Thinking",
          "Technical Execution",
          "Creativity",
        ],
        mustProbe: [
          "Design system contributions",
          "Prototyping work",
          "Creative coding projects",
        ],
        duration: 12,
      },
      {
        title: "Frontend Engineer",
        description: "Web rendering, performance, collaboration",
        topics: ["Rendering", "Performance", "Collaboration", "WebAssembly"],
        evaluationCriteria: ["Frontend Depth", "Performance", "System Design"],
        mustProbe: [
          "Rendering optimization",
          "Real-time collaboration",
          "Performance profiling",
        ],
        duration: 12,
      },
      {
        title: "Platform Engineer",
        description: "Plugin API, infrastructure, editor core",
        topics: ["Plugin API", "Infrastructure", "Editor Core", "Scalability"],
        evaluationCriteria: [
          "Platform Thinking",
          "System Design",
          "API Design",
        ],
        mustProbe: [
          "API design experience",
          "Platform architecture",
          "Editor core contributions",
        ],
        duration: 12,
      },
    ],
    interviewRounds: [
      "Phone Screen",
      "Technical & Coding",
      "Rendering & Collaboration",
      "Design & Culture",
    ],
  },
  {
    id: "notion",
    name: "Notion",
    description:
      "Tool for thought. Blocks architecture. Product craftsmanship.",
    culture: [
      "Tool for thought — build products that help people think",
      "Blocks architecture — composable, extensible building blocks",
      "Product craftsmanship — every pixel matters",
    ],
    interviewerBehavior: [
      "Push on extensibility and block protocol design",
      "Probe for offline and real-time sync architecture",
      "Ask about API design for power users",
    ],
    evaluationBiases: [
      "Values candidates who understand developer tools",
      "Prefers product-minded engineers",
    ],
    defaultStyle: "SUPPORTIVE",
    defaultDepth: "STANDARD",
    durationMinutes: 15,
    roles: [
      {
        title: "Fullstack Engineer",
        description: "Blocks, databases, cross-platform",
        topics: ["Blocks", "Databases", "Cross-platform", "Real-time"],
        evaluationCriteria: [
          "Technical Breadth",
          "Product Thinking",
          "Craftsmanship",
        ],
        mustProbe: [
          "Database design",
          "Cross-platform challenges",
          "Real-time sync",
        ],
        duration: 15,
      },
      {
        title: "Mobile Engineer",
        description: "React Native, offline, performance",
        topics: [
          "React Native",
          "Offline",
          "Performance",
          "Mobile Architecture",
        ],
        evaluationCriteria: ["Mobile Depth", "Performance", "Architecture"],
        mustProbe: [
          "Mobile architecture decisions",
          "Offline implementation",
          "Performance optimization",
        ],
        duration: 15,
      },
      {
        title: "Infrastructure Engineer",
        description: "Real-time sync, storage, reliability",
        topics: [
          "Real-time Sync",
          "Storage",
          "Reliability",
          "Distributed Systems",
        ],
        evaluationCriteria: ["System Design", "Reliability", "Technical Depth"],
        mustProbe: [
          "Sync architecture",
          "Storage decisions",
          "Reliability improvements",
        ],
        duration: 15,
      },
    ],
    interviewRounds: [
      "Phone Screen",
      "Technical & Coding",
      "Blocks & Architecture",
      "Product & Behavior",
    ],
  },
  {
    id: "startup",
    name: "Startup",
    description: "Generalist. Ambiguity. High-velocity decision-making.",
    culture: [
      "Generalist mindset — wear many hats",
      "High ambiguity — make decisions without full data",
      "Speed of iteration — ship, learn, repeat",
    ],
    interviewerBehavior: [
      "Push on resourcefulness and prioritization",
      "Probe for decision-making under uncertainty",
      "Ask about building from scratch with limited resources",
    ],
    evaluationBiases: [
      "Values speed and resourcefulness over polish",
      "Prefers candidates who have dealt with ambiguity",
    ],
    defaultStyle: "SUPPORTIVE",
    defaultDepth: "CHALLENGE",
    durationMinutes: 12,
    roles: [
      {
        title: "Startup CTO",
        description: "Technical vision, team building, architecture",
        topics: [
          "Technical Vision",
          "Team Building",
          "Architecture",
          "Strategy",
        ],
        evaluationCriteria: [
          "Technical Leadership",
          "Strategic Thinking",
          "Execution",
        ],
        mustProbe: [
          "Technical strategy",
          "Team building experience",
          "Architecture decisions",
        ],
        duration: 12,
      },
      {
        title: "Series A Founder",
        description: "Product-market fit, fundraising, growth",
        topics: ["Product-market Fit", "Fundraising", "Growth", "Strategy"],
        evaluationCriteria: ["Strategic Thinking", "Execution", "Resilience"],
        mustProbe: [
          "Product-market fit journey",
          "Fundraising experience",
          "Growth strategies",
        ],
        duration: 12,
      },
      {
        title: "Staff Engineer",
        description: "Deep IC, technical strategy, mentorship",
        topics: ["Technical Strategy", "Mentorship", "Deep IC", "Architecture"],
        evaluationCriteria: [
          "Technical Depth",
          "Leadership",
          "Strategic Thinking",
        ],
        mustProbe: [
          "Technical strategy examples",
          "Mentorship approach",
          "Architecture impact",
        ],
        duration: 12,
      },
    ],
    interviewRounds: [
      "Phone Screen",
      "Technical & Coding",
      "Architecture & Strategy",
      "Founder & Culture Fit",
    ],
  },
];

export function getCompany(id: string): CompanyConfig | undefined {
  return companies.find((c) => c.id === id);
}

export function getDefaultStyleDepth(companyId: string | null): {
  style: InterviewStyle;
  depth: InterviewDepth;
} {
  if (companyId) {
    const company = getCompany(companyId);
    if (company)
      return { style: company.defaultStyle, depth: company.defaultDepth };
  }
  return { style: "PROFESSIONAL", depth: "STANDARD" };
}
