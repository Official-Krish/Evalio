import { useState } from "react";
import { motion } from "motion/react";
import { useInViewOnce } from "./hooks";

const TRAITS = [
  {
    num: "01",
    label: "Signal",
    desc: "Do you surface the right signal, or bury it in noise?",
  },
  {
    num: "02",
    label: "Agency",
    desc: "When uncertainty appears, do you step forward or wait?",
  },
  {
    num: "03",
    label: "Reasoning",
    desc: "Do you explain what you know or truly reason through it?",
  },
  {
    num: "04",
    label: "Navigation",
    desc: "Can you create structure when none exists?",
  },
  {
    num: "05",
    label: "Influence",
    desc: "Are you heard, or are you remembered?",
  },
  {
    num: "06",
    label: "Adaptation",
    desc: "Do you defend your answer, or evolve it?",
  },
];

function TraitBlock({
  trait,
  index,
  visible,
}: {
  trait: (typeof TRAITS)[number];
  index: number;
  visible: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const delay = 0.1 + index * 0.09;
  const offset = index % 2 === 1; // stagger second column down slightly

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative cursor-default ${offset ? "sm:mt-14" : ""}`}
    >
      {/* Content, offset right so it overlaps the numeral's right edge */}
      <div
        className="relative pl-12 sm:pl-16 pt-6 pb-10 sm:pb-12 border-l"
        style={{ borderColor: "var(--landing-line)" }}
      >
        <span className="block text-[10px] tracking-[0.14em] uppercase text-[var(--landing-accent)] mb-3">
          {trait.num}
        </span>

        <motion.h3
          animate={{ x: hovered ? 6 : 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="landing-serif italic text-[clamp(1.7rem,2.6vw,2.1rem)] leading-none mb-3"
          style={{ color: "var(--landing-fg)" }}
        >
          {trait.label}
        </motion.h3>

        <p className="font-sans text-[13px] leading-[1.65] text-[var(--landing-fg-muted)] max-w-[280px]">
          {trait.desc}
        </p>

        {/* Quiet accent tick that brightens on hover, replaces a literal line-device */}
        <motion.span
          aria-hidden
          animate={{
            backgroundColor: hovered
              ? "var(--landing-accent)"
              : "var(--landing-line)",
            height: hovered ? "100%" : "40%",
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 top-0 w-px"
        />
      </div>
    </motion.div>
  );
}

export type IdentityEmergenceProps = {
  className?: string;
};

export function IdentityEmergence({ className }: IdentityEmergenceProps) {
  const { ref: sectionRef, visible } = useInViewOnce<HTMLElement>(0.15);

  return (
    <section
      ref={sectionRef}
      className={`${className || ""} landing-container relative py-[16vh] border-b overflow-hidden`}
    >
      {/* Accent Background Glow */}
      <div
        className="absolute pointer-events-none right-0 top-1/4 w-[500px] h-[500px]"
        style={{
          background:
            "radial-gradient(circle, rgba(184,168,138,0.05) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column (Copy and Header) */}
        <div className="lg:col-span-5 flex flex-col justify-start lg:sticky lg:top-32">
          <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-[var(--landing-fg-faint)] mb-8">
            <span className="w-8 h-px bg-[var(--landing-line)]" aria-hidden />
            Chapter I &middot; The Emergence
          </span>
          <p className="text-[11px] tracking-[0.12em] uppercase text-[var(--landing-fg-faint)] mb-3">
            The first signals appear.
          </p>
          <h2 className="landing-display text-[clamp(1.85rem,3.8vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-[var(--landing-fg)]">
            Your answers fade.{" "}
            <span className="landing-serif italic text-[var(--landing-accent)]">
              Your identity remains.
            </span>
          </h2>
          <p className="mt-5 text-[13px] leading-[1.7] text-[var(--landing-fg-muted)] max-w-md">
            Your voice under pressure. The decisions you make when information
            is incomplete. The habits that repeat across interviews.
          </p>
          <p className="mt-2 text-[13px] leading-[1.7] text-[var(--landing-fg-muted)] max-w-md">
            Evalio tracks those signals and turns them into an evolving
            interview identity. No vague feedback. A sharp mirror.
          </p>
          <div className="mt-8 space-y-3 text-[12px] leading-relaxed text-[var(--landing-fg-faint)]">
            <p>
              <span className="text-[var(--landing-accent)]">I</span> &middot;
              The Emergence &mdash; signals appear
            </p>
            <p>
              <span className="text-[var(--landing-accent)]">II</span> &middot;
              The Pattern &mdash; behaviors repeat across sessions
            </p>
            <p>
              <span className="text-[var(--landing-accent)]">III</span> &middot;
              The Identity &mdash; a consistent profile forms
            </p>
          </div>
        </div>

        {/* Right Column (Ghost Numeral Masonry) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 sm:gap-x-10 pt-4">
          {TRAITS.map((t, idx) => (
            <TraitBlock key={t.label} trait={t} index={idx} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default IdentityEmergence;
