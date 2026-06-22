import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useInViewOnce } from "./hooks";
import {
  IconPointer,
  IconSquare,
  IconDiamond,
  IconDatabase,
  IconArrowUpRight,
  IconPencil,
  IconTrash,
  IconSparkles,
  IconCpu,
  IconLock,
  IconDeviceLaptop,
  IconRefresh,
} from "@tabler/icons-react";

type NodeId = "client" | "gateway" | "auth" | "app" | "cache" | "database";

interface ArchitectureNode {
  id: NodeId;
  label: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    style?: React.CSSProperties;
  }>;
  color: string;
  aiFeedback: string;
  tradeoffQuestion: string;
}

const NODES: ArchitectureNode[] = [
  {
    id: "client",
    label: "Client App",
    type: "Client",
    x: 10,
    y: 105,
    w: 90,
    h: 55,
    icon: IconDeviceLaptop,
    color: "#b8a88a",
    aiFeedback: "Client latency is 45ms. Mobile and web endpoints split here.",
    tradeoffQuestion:
      "How do you handle client retries, rate-limiting failures, and exponential backoff?",
  },
  {
    id: "gateway",
    label: "API Gateway",
    type: "Routing",
    x: 130,
    y: 105,
    w: 100,
    h: 55,
    icon: IconCpu,
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
    x: 130,
    y: 20,
    w: 100,
    h: 50,
    icon: IconLock,
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
    x: 260,
    y: 105,
    w: 100,
    h: 55,
    icon: IconCpu,
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
    x: 260,
    y: 20,
    w: 100,
    h: 50,
    icon: IconDatabase,
    color: "#EF9F27",
    aiFeedback: "Eviction: volatile-lru. Average cache hit-rate is 88%.",
    tradeoffQuestion:
      "If you face a cache stampede during a promo event, what caching patterns mitigate DB load?",
  },
  {
    id: "database",
    label: "Postgres Main",
    type: "Storage",
    x: 390,
    y: 105,
    w: 100,
    h: 55,
    icon: IconDatabase,
    color: "#10b981",
    aiFeedback: "Active master. Read replicas are setup across 3 regions.",
    tradeoffQuestion:
      "With write-heavy payloads, when would you transition from SQL read replicas to sharding?",
  },
];

export function SystemDesignComingSoon() {
  const { ref } = useInViewOnce<HTMLDivElement>(0.15);
  const [activeTool, setActiveTool] = useState<string>("select");
  const [selectedNodeId, setSelectedNodeId] = useState<NodeId | null>(null);

  const selectedNode = NODES.find((n) => n.id === selectedNodeId);

  const resetCanvas = () => {
    setSelectedNodeId(null);
  };

  const tools = [
    { id: "select", icon: IconPointer, label: "Selection tool" },
    { id: "rectangle", icon: IconSquare, label: "Rectangle tool" },
    { id: "diamond", icon: IconDiamond, label: "Decision tool" },
    { id: "arrow", icon: IconArrowUpRight, label: "Connection line" },
    { id: "pencil", icon: IconPencil, label: "Draw tool" },
  ];

  return (
    <section
      ref={ref}
      className="landing-container relative py-[14vh] border-b overflow-hidden"
    >
      {/* Decorative backdrop light */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 75% 50%, rgba(127,119,221,0.03) 0%, transparent 80%)",
        }}
        aria-hidden
      />

      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
        {/* ── Left Side: Editorial Details & Waitlist Form ── */}
        <div className="flex flex-col gap-6">
          <div>
            <span
              className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 mb-4 font-mono font-semibold"
              style={{
                color: "var(--landing-accent)",
                border: "1px solid var(--landing-accent-soft)",
                borderRadius: 4,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)] animate-pulse" />
              Coming Soon
            </span>

            <h2 className="landing-display text-[clamp(2.2rem,4.5vw,3.6rem)] leading-[1.05] tracking-[-0.03em] text-[var(--landing-fg)] mb-4">
              Whiteboard your{" "}
              <span className="block landing-serif italic text-[var(--landing-accent)]">
                architecture.
              </span>
            </h2>

            <p className="text-[13.5px] leading-[1.75] text-[var(--landing-fg-muted)] max-w-lg m-0">
              Draw system topology diagrams live on a sketching canvas. Our AI
              interviewer reviews your database choices, evaluates bottlenecks,
              and queries tradeoffs as you construct your system in real-time.
            </p>
          </div>

          {/* Key Whiteboard Features */}
          <div
            className="flex flex-col gap-4 border-t pt-5 max-w-lg"
            style={{ borderColor: "var(--landing-line)" }}
          >
            {[
              {
                title: "Sketch Sketchy-Style Block Diagrams",
                desc: "Freehand drawing tools combined with snap-to-grid boxes, queue cylinders, caching hubs, and routing diamonds.",
              },
              {
                title: "Real-time AI Co-Pilot Diagnostics",
                desc: "Gemini evaluates data latency, database locks, single points of failure, and queries tradeoffs as your schema expands.",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-[10px] font-mono text-[var(--landing-accent)] mt-[3px] font-bold">
                  0{idx + 1}
                </span>
                <div>
                  <h5 className="text-[12.5px] font-semibold text-[var(--landing-fg)] m-0 mb-0.5">
                    {item.title}
                  </h5>
                  <p className="text-[11.5px] leading-relaxed text-[var(--landing-fg-muted)] m-0">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Side: Interactive Sketching Whiteboard Canvas Mockup ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--landing-fg-muted)] flex items-center gap-1.5">
              <IconSparkles
                size={12}
                className="text-[var(--landing-accent)] animate-pulse"
              />
              Demo Whiteboard (Click nodes to test)
            </span>
            <button
              onClick={resetCanvas}
              className="text-[10px] font-mono text-[var(--landing-fg-muted)] hover:text-[var(--landing-fg)] flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer outline-none"
            >
              <IconRefresh size={10} />
              Reset Canvas
            </button>
          </div>

          <div
            className="w-full aspect-[4/3] rounded-2xl border shadow-2xl relative flex flex-col p-4 select-none overflow-hidden"
            style={{
              borderColor: "var(--landing-line)",
              background: "var(--landing-surface)",
              backgroundImage:
                "radial-gradient(circle, var(--landing-line) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            {/* Top Toolbar (Fixed floating layout) */}
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 rounded-xl border shadow-2xl z-10 bg-white dark:bg-[#0c0c0e]"
              style={{ borderColor: "var(--landing-line)" }}
            >
              {tools.map((t) => {
                const Icon = t.icon;
                const isSelected = activeTool === t.id;
                return (
                  <button
                    key={t.id}
                    title={t.label}
                    onClick={() => setActiveTool(t.id)}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer outline-none ${
                      isSelected
                        ? "border-[#b8a88a]/30 bg-[#b8a88a]/10 text-[#b8a88a]"
                        : "border-transparent text-[var(--landing-fg-muted)] hover:text-[var(--landing-fg)] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    <Icon size={14} />
                  </button>
                );
              })}
              <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-1" />
              <button
                onClick={() => {
                  setSelectedNodeId(null);
                }}
                className="p-1.5 rounded-lg border border-transparent text-[var(--landing-fg-muted)] hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer outline-none"
                title="Clear selection"
              >
                <IconTrash size={14} />
              </button>
            </div>

            {/* Scrollable Whiteboard Area for Mobile Compatibility */}
            <div className="flex-1 overflow-x-auto scrollbar-none mt-12 py-1.5 relative">
              <div className="min-w-[500px] h-[175px] relative mx-auto">
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {/* Custom sketchy marker indicators */}
                  <defs>
                    <marker
                      id="sketch-arrow"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path
                        d="M 0 1 L 10 5 L 0 9 z"
                        fill="var(--landing-line)"
                      />
                    </marker>
                    <marker
                      id="sketch-arrow-active"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#b8a88a" />
                    </marker>
                  </defs>

                  {/* Simulated Hand-Drawn Sketchy Connections */}
                  {/* Client -> Gateway */}
                  <path
                    d="M 100 132.5 L 130 132.5"
                    fill="none"
                    stroke={
                      selectedNodeId === "client" ||
                      selectedNodeId === "gateway"
                        ? "#b8a88a"
                        : "var(--landing-line)"
                    }
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    markerEnd={
                      selectedNodeId === "client" ||
                      selectedNodeId === "gateway"
                        ? "url(#sketch-arrow-active)"
                        : "url(#sketch-arrow)"
                    }
                  />

                  {/* Gateway -> Auth */}
                  <path
                    d="M 180 105 L 180 70"
                    fill="none"
                    stroke={
                      selectedNodeId === "gateway" || selectedNodeId === "auth"
                        ? "#b8a88a"
                        : "var(--landing-line)"
                    }
                    strokeWidth="1.5"
                    markerEnd={
                      selectedNodeId === "gateway" || selectedNodeId === "auth"
                        ? "url(#sketch-arrow-active)"
                        : "url(#sketch-arrow)"
                    }
                  />

                  {/* Gateway -> App */}
                  <path
                    d="M 230 132.5 L 260 132.5"
                    fill="none"
                    stroke={
                      selectedNodeId === "gateway" || selectedNodeId === "app"
                        ? "#b8a88a"
                        : "var(--landing-line)"
                    }
                    strokeWidth="1.5"
                    markerEnd={
                      selectedNodeId === "gateway" || selectedNodeId === "app"
                        ? "url(#sketch-arrow-active)"
                        : "url(#sketch-arrow)"
                    }
                  />

                  {/* App -> Cache */}
                  <path
                    d="M 310 105 L 310 70"
                    fill="none"
                    stroke={
                      selectedNodeId === "app" || selectedNodeId === "cache"
                        ? "#b8a88a"
                        : "var(--landing-line)"
                    }
                    strokeWidth="1.5"
                    markerEnd={
                      selectedNodeId === "app" || selectedNodeId === "cache"
                        ? "url(#sketch-arrow-active)"
                        : "url(#sketch-arrow)"
                    }
                  />

                  {/* App -> DB */}
                  <path
                    d="M 360 132.5 L 390 132.5"
                    fill="none"
                    stroke={
                      selectedNodeId === "app" || selectedNodeId === "database"
                        ? "#b8a88a"
                        : "var(--landing-line)"
                    }
                    strokeWidth="1.5"
                    markerEnd={
                      selectedNodeId === "app" || selectedNodeId === "database"
                        ? "url(#sketch-arrow-active)"
                        : "url(#sketch-arrow)"
                    }
                  />
                </svg>

                {/* Whiteboard Sketch Nodes */}
                {NODES.map((node) => {
                  const Icon = node.icon;
                  const isSelected = selectedNodeId === node.id;
                  return (
                    <motion.div
                      key={node.id}
                      onClick={() => {
                        setSelectedNodeId(node.id);
                      }}
                      className={`absolute flex flex-col p-1 border cursor-pointer select-none transition-all duration-300 group outline-none ${
                        isSelected
                          ? "shadow-[0_0_15px_rgba(184,168,138,0.1)] bg-black/[0.02] dark:bg-white/[0.02]"
                          : "bg-black/[0.005] dark:bg-white/[0.005] hover:bg-black/[0.015] dark:hover:bg-white/[0.015]"
                      }`}
                      style={{
                        left: node.x,
                        top: node.y,
                        width: node.w,
                        height: node.h,
                        borderColor: isSelected
                          ? "#b8a88a"
                          : "var(--landing-line)",
                        // sketchy hand-drawn border effect using irregular radii
                        borderRadius: isSelected
                          ? "10px 6px 12px 8px / 6px 12px 8px 10px"
                          : "6px 8px 5px 7px / 8px 6px 7px 5px",
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[8.5px] font-mono text-[var(--color-text-muted)] tracking-wider">
                        <Icon
                          size={11}
                          style={{ color: isSelected ? "#b8a88a" : node.color }}
                        />
                        <span className="truncate uppercase">{node.type}</span>
                      </div>
                      <span
                        className="text-[11px] font-semibold truncate leading-none mt-1 group-hover:text-accent transition-colors"
                        style={{
                          color: isSelected ? "#b8a88a" : "var(--landing-fg)",
                        }}
                      >
                        {node.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Bottom AI Code Review Panel (Static layout) */}
            <div
              className="mt-3 p-3.5 rounded-xl border bg-black/[0.01] dark:bg-white/[0.015] backdrop-blur-md relative overflow-hidden transition-all duration-300"
              style={{
                borderColor: selectedNode
                  ? `${selectedNode.color}25`
                  : "var(--landing-line)",
              }}
            >
              {/* background color flare for selected node */}
              {selectedNode && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-5 filter blur-[15px] transition-all"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${selectedNode.color} 0%, transparent 60%)`,
                  }}
                />
              )}

              <div className="flex items-center gap-2 mb-1.5">
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
                    "Click on any node in the system diagram above (e.g.
                    Postgres Main, App Cluster, Redis Cache) to test active
                    tradeoffs and see how the AI probes your architecture."
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
