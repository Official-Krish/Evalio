import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useTheme } from "../../lib/use-theme";

interface SiteLoaderProps {
  isReady: boolean;
  children: React.ReactNode;
}

type LoaderPhase = "loading" | "zoom" | "fadeout" | "complete";

interface AnimatedLogoProps {
  size?: number;
  isLight?: boolean;
  shouldAnimate?: boolean;
}

export function AnimatedLogo({
  size = 80,
  isLight = false,
  shouldAnimate = true,
}: AnimatedLogoProps) {
  const accentColor = isLight ? "#8a7a5c" : "#b8a88a";
  const fgColor = isLight ? "#121110" : "#eceae6";

  // Staggered loading ripple variants
  const rectVariants: Variants = {
    initial: (custom: { opacity: number }) => ({
      scaleX: 1,
      opacity: custom.opacity,
    }),
    animate: (custom: { opacity: number; delay: number }) => {
      if (!shouldAnimate) {
        return {
          scaleX: 1,
          opacity: custom.opacity,
        };
      }
      return {
        scaleX: [1, 1.16, 1],
        opacity: [custom.opacity * 0.45, custom.opacity, custom.opacity * 0.45],
        transition: {
          duration: 1.4,
          ease: "easeInOut" as const,
          repeat: Infinity,
          delay: custom.delay,
        },
      };
    },
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      {/* Rect 1 */}
      <motion.rect
        x="6"
        y="9"
        width="18"
        height="2.5"
        rx="1.25"
        fill={fgColor}
        style={{ originX: 0 }}
        custom={{ opacity: 0.9, delay: 0.0 }}
        initial="initial"
        animate="animate"
        variants={rectVariants}
      />
      {/* Rect 2 */}
      <motion.rect
        x="6"
        y="13.5"
        width="14"
        height="2.5"
        rx="1.25"
        fill={fgColor}
        style={{ originX: 0 }}
        custom={{ opacity: 0.7, delay: 0.15 }}
        initial="initial"
        animate="animate"
        variants={rectVariants}
      />
      {/* Rect 3 */}
      <motion.rect
        x="6"
        y="18"
        width="10"
        height="2.5"
        rx="1.25"
        fill={fgColor}
        style={{ originX: 0 }}
        custom={{ opacity: 0.5, delay: 0.3 }}
        initial="initial"
        animate="animate"
        variants={rectVariants}
      />
      {/* Rect 4 (Accent) */}
      <motion.rect
        x="6"
        y="22.5"
        width="6"
        height="2.5"
        rx="1.25"
        fill={accentColor}
        style={{ originX: 0 }}
        custom={{ opacity: 1.0, delay: 0.45 }}
        initial="initial"
        animate="animate"
        variants={rectVariants}
      />
    </svg>
  );
}

export function SiteLoader({ isReady, children }: SiteLoaderProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const systemPrefersReducedMotion = useReducedMotion();

  // 1. Determine load context (cold load vs repeat visit)
  const [isColdLoad] = useState(() => {
    if (typeof window === "undefined") return true;
    return !sessionStorage.getItem("evalio_loaded");
  });

  // Decide if we should run the advanced animation or skip to fast fade
  const shouldAnimate = isColdLoad && !systemPrefersReducedMotion;

  // Initialize phase to loading
  const [phase, setPhase] = useState<LoaderPhase>("loading");

  // Track minimum loader duration elapsed. If warm load/reduced motion, initialize to true.
  const [minTimeElapsed, setMinTimeElapsed] = useState(() => !shouldAnimate);

  useEffect(() => {
    if (!shouldAnimate) return;

    // Enforce a minimum loader duration of 1000ms to show the loading effect
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [shouldAnimate]);

  // Transition to zoom/fadeout once ready and minimum time has passed. Defer to avoid synchronous cascading renders.
  useEffect(() => {
    if (phase === "loading" && isReady && minTimeElapsed) {
      const timer = setTimeout(() => {
        if (shouldAnimate) {
          setPhase("zoom");
        } else {
          setPhase("fadeout");
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [phase, isReady, minTimeElapsed, shouldAnimate]);

  // Handle Zoom and Fadeout phase end timers
  useEffect(() => {
    if (phase === "zoom") {
      // Zoom animation lasts 450ms
      const timer = setTimeout(() => {
        setPhase("complete");
        sessionStorage.setItem("evalio_loaded", "true");
      }, 450);
      return () => clearTimeout(timer);
    }

    if (phase === "fadeout") {
      // Plain fadeout animation lasts 300ms
      const timer = setTimeout(() => {
        setPhase("complete");
        sessionStorage.setItem("evalio_loaded", "true");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const overlayHidden = phase === "complete";

  // Define colors based on active theme
  const bgColor = isLight ? "#f6f4f0" : "#08080D";

  // Overlay variant definitions for transitions
  const overlayVariants: Variants = {
    initial: {
      backgroundColor: bgColor,
      opacity: 1,
    },
    zoom: {
      opacity: [1, 1, 0],
      transition: {
        times: [0, 0.66, 1],
        duration: 0.45,
        ease: "easeOut" as const,
      },
    },
    fadeout: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
      },
    },
    complete: {
      opacity: 0,
      transition: {
        duration: 0,
      },
    },
  };

  // Logo animation properties based on phase
  const logoVariants: Variants = {
    loading: {
      opacity: 1,
      scale: [1, 1.02, 1],
      transition: {
        scale: {
          duration: 2.0,
          ease: "easeInOut" as const,
          repeat: Infinity,
          repeatType: "reverse" as const,
        },
      },
    },
    zoom: {
      scale: 22,
      opacity: [1, 1, 0.4, 0],
      transition: {
        scale: {
          duration: 0.45,
          ease: [0.6, 0, 1, 1] as const,
        },
        opacity: {
          duration: 0.45,
          ease: "easeIn" as const,
        },
      },
    },
    fadeout: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
      },
    },
    complete: {
      opacity: 0,
      transition: {
        duration: 0,
      },
    },
  };

  return (
    <>
      <div
        style={{
          opacity: overlayHidden
            ? 1
            : phase === "zoom" || phase === "fadeout"
              ? 1
              : 0,
          transition: "opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "opacity",
          height: "100%",
          width: "100%",
        }}
      >
        {children}
      </div>

      {!overlayHidden && (
        <motion.div
          aria-hidden="true"
          variants={overlayVariants}
          initial="initial"
          animate={phase}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: bgColor,
            willChange: "opacity",
            pointerEvents: "none",
          }}
        >
          <motion.div
            variants={logoVariants}
            initial="loading"
            animate={phase}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              willChange: "transform, opacity",
              transformStyle: "preserve-3d",
              width: "clamp(128px, 14vw, 176px)",
              height: "clamp(128px, 14vw, 176px)",
            }}
          >
            <AnimatedLogo
              size={192}
              isLight={isLight}
              shouldAnimate={shouldAnimate}
            />
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
