import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "motion/react";
import {
  IconDeviceLaptop,
  IconCpu,
  IconDatabase,
  IconSparkles,
} from "@tabler/icons-react";

const interviews = [
  {
    id: "dsa",
    title: "Not just talking.",
    accent: "Real coding interviews.",
    description:
      "LeetCode-style problems sourced from 1,900+ companies. A 6-phase interview structure that mirrors real on-sites — understand, brute force, optimize, implement, test, review.",
    features: ["Monaco Editor", "Python · C++ · TypeScript", "30 min timer"],
    status: { label: "Live now", color: "rgba(160,200,160,0.9)" },
  },
  {
    id: "system-design",
    title: "Whiteboard your",
    accent: "architecture.",
    description:
      "Draw system topology diagrams live on a sketching canvas. AI reviews your database choices, evaluates bottlenecks, and queries tradeoffs as you construct your system in real-time.",
    features: [
      "Sketch blocks & arrows",
      "Real-time AI co-pilot",
      "Tradeoff probing",
    ],
    status: { label: "Live now", color: "var(--landing-accent)" },
  },
];

const CODE_LINES = [
  { text: "def two_sum(nums: list[int], target: int):", type: "def" },
  { text: "    seen = {}", type: "code" },
  { text: "    for i, n in enumerate(nums):", type: "code" },
  { text: "        complement = target - n", type: "code" },
  { text: "        if complement in seen:", type: "code" },
  { text: "            return [seen[complement], i]", type: "return" },
  { text: "    seen[n] = i", type: "code" },
];

function tokenise(line: string, type: string) {
  if (type === "def") {
    const m = line.match(/^(def )(\w+)(\(.*\))(:)$/);
    if (m)
      return (
        <>
          <span className="dsa-kw">{m[1]}</span>
          <span className="dsa-fn">{m[2]}</span>
          <span className="dsa-param">{m[3]}</span>
          <span className="dsa-punct">{m[4]}</span>
        </>
      );
  }
  if (type === "return") {
    return (
      <>
        <span className="dsa-kw">{"            return "}</span>
        <span className="dsa-bracket">{"["}</span>
        <span className="dsa-name">{"seen[complement]"}</span>
        <span className="dsa-punct">{", "}</span>
        <span className="dsa-name">{"i"}</span>
        <span className="dsa-bracket">{"]"}</span>
      </>
    );
  }
  return <span className="dsa-plain">{line}</span>;
}

function CodeMockup() {
  return (
    <div className="custom-code-block">
      <div className="custom-code-header">
        <span className="custom-code-dot" style={{ background: "#ff5f56" }} />
        <span className="custom-code-dot" style={{ background: "#ffbd2e" }} />
        <span className="custom-code-dot" style={{ background: "#27c93f" }} />
        <span className="custom-code-filename">solution.py</span>
      </div>
      <pre className="custom-code-pre">
        {CODE_LINES.map((line, i) => (
          <code key={i} className="custom-code-line">
            {tokenise(line.text, line.type)}
          </code>
        ))}
      </pre>
      <div className="custom-code-footer">
        <span className="custom-code-pass">3/3 tests passing</span>
        <span className="custom-code-complexity">O(n) time · O(n) space</span>
      </div>
    </div>
  );
}

type NodeId = "client" | "gateway" | "auth" | "app" | "cache" | "database";

interface ArchNode {
  id: NodeId;
  label: string;
  type: string;
  x: number;
  y: number;
  color: string;
  aiFeedback: string;
  tradeoffQuestion: string;
}

const ARCH_NODES: ArchNode[] = [
  {
    id: "client",
    label: "Client App",
    type: "Client",
    x: 0,
    y: 100,
    color: "#b8a88a",
    aiFeedback: "Client latency is 45ms. Mobile and web endpoints split here.",
    tradeoffQuestion:
      "How do you handle client retries, rate-limiting failures, and exponential backoff?",
  },
  {
    id: "gateway",
    label: "API Gateway",
    type: "Routing",
    x: 100,
    y: 100,
    color: "#7F77DD",
    aiFeedback:
      "SSL termination, CORS checking, and global rate limiting enabled.",
    tradeoffQuestion:
      "If the gateway goes down, how do you prevent split-brain routing and catastrophic failover?",
  },
  {
    id: "auth",
    label: "Auth Service",
    type: "Security",
    x: 100,
    y: 15,
    color: "#ef4444",
    aiFeedback:
      "Validates JWTs. Connected to cache for session revocation list checks.",
    tradeoffQuestion:
      "How do you scale token validation under 100,000 requests per second?",
  },
  {
    id: "app",
    label: "App Cluster",
    type: "Server",
    x: 200,
    y: 100,
    color: "#5DCAA5",
    aiFeedback:
      "Stateless nodes running on Kubernetes. Dynamic auto-scaling is active.",
    tradeoffQuestion:
      "How do you prevent session sticky issues when horizontally scaling stateful sessions?",
  },
  {
    id: "cache",
    label: "Redis Cache",
    type: "Caching",
    x: 200,
    y: 15,
    color: "#EF9F27",
    aiFeedback: "Eviction: volatile-lru. Average cache hit-rate is 88%.",
    tradeoffQuestion:
      "If you face a cache stampede during a promo event, what caching patterns mitigate DB load?",
  },
  {
    id: "database",
    label: "Postgres Main",
    type: "Storage",
    x: 300,
    y: 105,
    color: "#10b981",
    aiFeedback: "Active master. Read replicas are setup across 3 regions.",
    tradeoffQuestion:
      "With write-heavy payloads, when would you transition from SQL read replicas to sharding?",
  },
];

const nodeIcon = (id: string, size: number = 16) => {
  switch (id) {
    case "client":
      return <IconDeviceLaptop size={size} />;
    case "gateway":
    case "app":
      return <IconCpu size={size} />;
    case "auth":
    case "cache":
    case "database":
      return <IconDatabase size={size} />;
    default:
      return null;
  }
};

function ArchDiagram() {
  const [selectedNodeId, setSelectedNodeId] = useState<NodeId | null>(null);
  const selectedNode = ARCH_NODES.find((n) => n.id === selectedNodeId) ?? null;

  return (
    <div className="custom-arch">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-1 mb-2.5">
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--landing-fg-muted)] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)] animate-pulse" />
          Demo Whiteboard
        </span>
        <span className="text-[10px] font-mono text-[var(--landing-fg-muted)]">
          Click nodes to test
        </span>
      </div>

      {/* Canvas */}
      <div className="custom-arch-canvas">
        <svg className="custom-arch-svg" viewBox="0 0 400 180">
          <defs>
            <marker
              id="arch-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <path
                d="M0,0 L8,4 L0,8"
                fill="var(--landing-fg-muted)"
                stroke="var(--landing-fg-muted)"
                strokeWidth="1"
              />
            </marker>
          </defs>

          {/* Main row */}
          {[
            ["client", "gateway"],
            ["gateway", "app"],
            ["app", "database"],
          ].map(([from, to]) => {
            const a = ARCH_NODES.find((n) => n.id === from)!;
            const b = ARCH_NODES.find((n) => n.id === to)!;
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x + 74}
                y1={a.y + 26}
                x2={b.x}
                y2={b.y + 26}
                stroke="var(--landing-fg-muted)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                markerEnd="url(#arch-arrow)"
              />
            );
          })}

          {/* Vertical lines */}
          {["auth", "cache"].map((id) => {
            const above = ARCH_NODES.find((n) => n.id === id)!;
            const belowId = id === "auth" ? "gateway" : "app";
            const below = ARCH_NODES.find((n) => n.id === belowId)!;
            return (
              <line
                key={id}
                x1={above.x + 37}
                y1={above.y + 52}
                x2={below.x + 37}
                y2={below.y}
                stroke="var(--landing-fg-muted)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                markerEnd="url(#arch-arrow)"
              />
            );
          })}

          {/* Nodes */}
          {ARCH_NODES.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <g
                key={node.id}
                className="custom-arch-node"
                onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                style={{ cursor: "pointer" }}
              >
                {/* Glow when selected */}
                {isSelected && (
                  <rect
                    x={node.x - 3}
                    y={node.y - 3}
                    width={80}
                    height={58}
                    rx={10}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="2"
                    strokeOpacity={0.4}
                  />
                )}
                <rect
                  x={node.x}
                  y={node.y}
                  width={74}
                  height={52}
                  rx={8}
                  fill={
                    isSelected
                      ? "color-mix(in srgb, var(--landing-surface) 85%, transparent)"
                      : "var(--landing-surface)"
                  }
                  stroke={isSelected ? node.color : `${node.color}60`}
                  strokeWidth={isSelected ? 2 : 1.5}
                />
                <foreignObject x={node.x} y={node.y} width={74} height={52}>
                  <div className="flex flex-col items-center justify-center w-full h-full gap-0.5">
                    <span style={{ color: node.color }}>
                      {nodeIcon(node.id)}
                    </span>
                    <span className="text-[7.5px] font-mono uppercase tracking-wider text-[var(--landing-fg-muted)]">
                      {node.type}
                    </span>
                    <span className="text-[10px] font-semibold text-[var(--landing-fg)] leading-tight text-center px-1">
                      {node.label}
                    </span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom AI Review Panel */}
      <div className="custom-arch-panel">
        <div className="flex items-center gap-1.5 mb-1">
          <IconSparkles
            size={13}
            className="text-[var(--landing-accent)] animate-pulse"
          />
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--landing-fg-muted)]">
            Live AI Architecture Review
          </span>
        </div>
        <AnimatePresence mode="wait">
          {selectedNode ? (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-1.5"
            >
              <p className="text-[11.5px] text-[var(--landing-fg-muted)] leading-relaxed m-0 italic">
                "{selectedNode.aiFeedback}"
              </p>
              <p className="text-[12px] text-[var(--landing-accent)] font-semibold leading-relaxed m-0">
                Q: {selectedNode.tradeoffQuestion}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11.5px] text-[var(--landing-fg-muted)] leading-relaxed m-0 italic"
            >
              "Click on any node to test active tradeoffs and see how the AI
              probes your architecture."
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function CustomInterviews() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth springs for desktop scrolling
  const dsaOpacity = useSpring(
    useTransform(scrollYProgress, [0, 0.35, 0.5, 1], [1, 1, 0, 0]),
    { stiffness: 100, damping: 20 },
  );
  const dsaTextY = useSpring(
    useTransform(scrollYProgress, [0, 0.35, 0.5, 1], [0, 0, -240, -240]),
    { stiffness: 100, damping: 20 },
  );
  const dsaVisualY = useSpring(
    useTransform(scrollYProgress, [0, 0.3, 0.5, 1], [0, 0, -320, -320]),
    { stiffness: 100, damping: 20 },
  );
  const dsaScale = useSpring(
    useTransform(scrollYProgress, [0, 0.35, 0.5, 1], [1, 1, 0.95, 0.95]),
    { stiffness: 100, damping: 20 },
  );
  const dsaBlurVal = useSpring(
    useTransform(scrollYProgress, [0, 0.35, 0.5, 1], [0, 0, 8, 8]),
    { stiffness: 100, damping: 20 },
  );
  const dsaBlur = useMotionTemplate`blur(${dsaBlurVal}px)`;

  const sysOpacity = useSpring(
    useTransform(scrollYProgress, [0, 0.45, 0.6, 1], [0, 0, 1, 1]),
    { stiffness: 100, damping: 20 },
  );
  const sysTextY = useSpring(
    useTransform(scrollYProgress, [0, 0.45, 0.6, 1], [240, 240, 0, 0]),
    { stiffness: 100, damping: 20 },
  );
  const sysVisualY = useSpring(
    useTransform(scrollYProgress, [0, 0.45, 0.65, 1], [320, 320, 0, 0]),
    { stiffness: 100, damping: 20 },
  );
  const sysScale = useSpring(
    useTransform(scrollYProgress, [0, 0.45, 0.6, 1], [0.95, 0.95, 1, 1]),
    { stiffness: 100, damping: 20 },
  );
  const sysBlurVal = useSpring(
    useTransform(scrollYProgress, [0, 0.45, 0.6, 1], [8, 8, 0, 0]),
    { stiffness: 100, damping: 20 },
  );
  const sysBlur = useMotionTemplate`blur(${sysBlurVal}px)`;

  // Interactivity management
  const dsaPointerEvents = useTransform(scrollYProgress, (v) =>
    v < 0.5 ? "auto" : "none",
  );
  const sysPointerEvents = useTransform(scrollYProgress, (v) =>
    v >= 0.5 ? "auto" : "none",
  );

  const dsa = interviews[0]!;
  const sys = interviews[1]!;

  if (isMobile) {
    return (
      <section className="landing-container relative py-[8vh] border-b overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--landing-fg-faint)] font-mono mb-3">
            INTERVIEW TYPES
          </span>
          <h2 className="landing-display text-[clamp(2rem,5vw,4rem)] leading-[1.05] tracking-[-0.03em] text-[var(--landing-fg)] max-w-2xl">
            Practice the rounds that{" "}
            <span className="landing-serif italic text-[var(--landing-accent)]">
              actually matter.
            </span>
          </h2>
          <p className="text-[14px] leading-relaxed text-[var(--landing-fg-muted)] max-w-lg mt-3">
            From algorithmic coding to system design — every interview format
            real companies use.
          </p>
        </div>

        {/* Vertical list of cards for mobile */}
        <div className="flex flex-col gap-16 mt-12">
          {interviews.map((item) => (
            <div
              key={item.id}
              className="custom-card flex flex-col gap-8 items-center text-center"
            >
              <div className="flex flex-col gap-4 items-center">
                <span
                  className="custom-status"
                  style={{
                    color: item.status.color,
                    borderColor: `${item.status.color}40`,
                  }}
                >
                  <span
                    className="custom-status-dot"
                    style={{ background: item.status.color }}
                  />
                  {item.status.label}
                </span>

                <h2 className="landing-display text-[clamp(1.8rem,4vw,2.5rem)] leading-[1.1] tracking-[-0.02em] text-[var(--landing-fg)]">
                  {item.title}{" "}
                  <span className="block landing-serif italic text-[var(--landing-accent)]">
                    {item.accent}
                  </span>
                </h2>

                <p className="text-[13px] leading-[1.7] text-[var(--landing-fg-muted)] max-w-md">
                  {item.description}
                </p>

                <div className="flex flex-wrap justify-center gap-2 mt-1">
                  {item.features.map((f) => (
                    <span key={f} className="custom-feature-pill">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-center w-full">
                {item.id === "dsa" ? <CodeMockup /> : <ArchDiagram />}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div ref={containerRef} className="custom-interviews-section border-b">
      <div className="custom-interviews-sticky">
        <div className="landing-container w-full flex flex-col h-full py-[8vh] justify-between box-border">
          {/* Header (pinned at top) */}
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--landing-fg-faint)] font-mono mb-2">
              INTERVIEW TYPES
            </span>
            <h2 className="landing-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.03em] text-[var(--landing-fg)] max-w-2xl m-0">
              Practice the rounds that{" "}
              <span className="landing-serif italic text-[var(--landing-accent)]">
                actually matter.
              </span>
            </h2>
            <p className="text-[13.5px] leading-relaxed text-[var(--landing-fg-muted)] max-w-lg mt-2 mb-0">
              From algorithmic coding to system design — every interview format
              real companies use.
            </p>
          </div>

          {/* Cards Container with Overlapping Grid */}
          <div className="grid-overlap flex-1 flex items-center justify-center mt-6 relative min-h-[420px]">
            {/* Card 1: DSA */}
            <motion.div
              style={{
                opacity: dsaOpacity,
                scale: dsaScale,
                filter: dsaBlur,
                pointerEvents: dsaPointerEvents,
              }}
              className="grid-overlap-item grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-16 items-center w-full"
            >
              {/* Text Side */}
              <motion.div
                className="flex flex-col gap-4"
                style={{ y: dsaTextY }}
              >
                <span
                  className="custom-status self-start"
                  style={{
                    color: dsa.status.color,
                    borderColor: `${dsa.status.color}40`,
                  }}
                >
                  <span
                    className="custom-status-dot"
                    style={{ background: dsa.status.color }}
                  />
                  {dsa.status.label}
                </span>

                <h2 className="landing-display text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.05] tracking-[-0.03em] text-[var(--landing-fg)] m-0">
                  {dsa.title}{" "}
                  <span className="block landing-serif italic text-[var(--landing-accent)]">
                    {dsa.accent}
                  </span>
                </h2>

                <p className="text-[13.5px] leading-[1.75] text-[var(--landing-fg-muted)] max-w-sm m-0">
                  {dsa.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-1">
                  {dsa.features.map((f) => (
                    <span key={f} className="custom-feature-pill">
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Visual Side */}
              <motion.div
                className="flex justify-center"
                style={{ y: dsaVisualY }}
              >
                <CodeMockup />
              </motion.div>
            </motion.div>

            {/* Card 2: System Design */}
            <motion.div
              style={{
                opacity: sysOpacity,
                scale: sysScale,
                filter: sysBlur,
                pointerEvents: sysPointerEvents,
              }}
              className="grid-overlap-item grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-16 items-center w-full"
            >
              {/* Text Side */}
              <motion.div
                className="flex flex-col gap-4"
                style={{ y: sysTextY }}
              >
                <span
                  className="custom-status self-start"
                  style={{
                    color: sys.status.color,
                    borderColor: `${sys.status.color}40`,
                  }}
                >
                  <span
                    className="custom-status-dot"
                    style={{ background: sys.status.color }}
                  />
                  {sys.status.label}
                </span>

                <h2 className="landing-display text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.05] tracking-[-0.03em] text-[var(--landing-fg)] m-0">
                  {sys.title}{" "}
                  <span className="block landing-serif italic text-[var(--landing-accent)]">
                    {sys.accent}
                  </span>
                </h2>

                <p className="text-[13.5px] leading-[1.75] text-[var(--landing-fg-muted)] max-w-sm m-0">
                  {sys.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-1">
                  {sys.features.map((f) => (
                    <span key={f} className="custom-feature-pill">
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Visual Side */}
              <motion.div
                className="flex justify-center"
                style={{ y: sysVisualY }}
              >
                <ArchDiagram />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
