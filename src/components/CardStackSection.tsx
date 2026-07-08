import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";

interface CardStackSectionProps {
  children: React.ReactNode;
  id: string;
  zIndex: number;
}

export default function CardStackSection({ children, id, zIndex }: CardStackSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  // 1. High-Performance Viewport Scroll Tracking
  // progress of section entering the viewport (start of card goes from bottom of screen to top of screen)
  const { scrollYProgress: enterProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start start"],
  });

  // progress of section exiting the viewport (start of card goes from top of screen to end of card at top of screen)
  const { scrollYProgress: exitProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // 2. Map Scroll Progresses to GPU-accelerated Properties
  // Scale: enters at 0.96, is 1.0 active, scales down to 0.94 on exit
  const scale = useTransform<any, number>(
    [enterProgress, exitProgress],
    ([latestEnter, latestExit]: number[]) => {
      if (latestExit > 0) {
        return 1 - latestExit * 0.06; // 1 -> 0.94
      }
      return 0.96 + latestEnter * 0.04; // 0.96 -> 1.0
    }
  );

  // TranslateY: enters at 120px, is 0px active, translates to -60px on exit
  const y = useTransform<any, number>(
    [enterProgress, exitProgress],
    ([latestEnter, latestExit]: number[]) => {
      if (latestExit > 0) {
        return -latestExit * 60; // 0 -> -60px
      }
      return (1 - latestEnter) * 120; // 120px -> 0
    }
  );

  // Opacity: enters from 0 to 1, exits to 0.95
  const opacity = useTransform<any, number>(
    [enterProgress, exitProgress],
    ([latestEnter, latestExit]: number[]) => {
      if (latestExit > 0) {
        return 1 - latestExit * 0.05; // 1 -> 0.95
      }
      return latestEnter; // 0 -> 1
    }
  );

  // Border Radius: 0px when entering/active, up to 28px on exit (responsive)
  const borderRadiusValue = useTransform<any, number>(
    [enterProgress, exitProgress],
    ([_, latestExit]: number[]) => {
      if (latestExit > 0) {
        return latestExit * 28; // 0 -> 28px
      }
      return 0;
    }
  );

  // Shadow Opacity (overlay): 0 when entering/active, up to 1 on exit
  const shadowOpacity = useTransform<any, number>(
    [enterProgress, exitProgress],
    ([_, latestExit]: number[]) => {
      if (latestExit > 0) {
        return latestExit;
      }
      return 0;
    }
  );

  // Blur Opacity (overlay): 0 when entering/active, up to 0.4 on exit for a very soft depth
  const blurOpacity = useTransform<any, number>(
    [enterProgress, exitProgress],
    ([_, latestExit]: number[]) => {
      if (latestExit > 0) {
        return latestExit * 0.4;
      }
      return 0;
    }
  );

  // 3. Smooth with Springs for weighting and filtering trackpad/scroll wheel jerks
  const springConfig = { damping: 35, stiffness: 280, mass: 0.5 };
  const smoothScale = useSpring(scale, springConfig);
  const smoothY = useSpring(y, springConfig);
  const smoothOpacity = useSpring(opacity, springConfig);
  const smoothBorderRadiusValue = useSpring(borderRadiusValue, springConfig);
  const smoothShadowOpacity = useSpring(shadowOpacity, springConfig);
  const smoothBlurOpacity = useSpring(blurOpacity, springConfig);

  // Convert Border Radius numeric spring to pixel string representation
  const smoothBorderRadius = useTransform(smoothBorderRadiusValue, (v) => `${v}px`);

  // 4. Set active state based on intersection observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      {
        root: null,
        // Trigger active when at least 25% of the viewport is occupied by this section's container for instant reveal
        threshold: 0.25,
      }
    );

    observer.observe(el);
    return () => {
      observer.unobserve(el);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id={id}
      className={`relative w-full snap-section ${isActive ? "card-active" : "card-inactive"}`}
      style={{
        zIndex,
        // Scroll depth spacer: adds a premium padding so cards overlap elegantly on scroll
        minHeight: "110vh",
      }}
    >
      <motion.div
        style={{
          scale: smoothScale,
          y: smoothY,
          opacity: smoothOpacity,
          borderRadius: smoothBorderRadius,
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
        className="sticky top-[1vh] h-[98vh] max-w-full md:top-[2vh] md:h-[96vh] md:max-w-[98vw] lg:top-[4vh] lg:h-[92vh] lg:max-w-[96vw] mx-auto bg-white overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.01)] border border-neutral-200/20"
      >
        {/* Scrollable inner container to safeguard against clipping vertical overflow on mid-range/small screens */}
        <div className="w-full h-full overflow-y-auto scrollbar-none card-container-inner relative">
          {children}
        </div>

        {/* High-speed GPU-accelerated Shadow Overlay (prevents layout paint during shadow transitions) */}
        <motion.div
          style={{ opacity: smoothShadowOpacity }}
          className="absolute inset-0 rounded-[inherit] shadow-[0_40px_100px_rgba(0,0,0,0.12)] pointer-events-none border border-black/5"
        />

        {/* High-speed GPU-accelerated Blur Overlay */}
        <motion.div
          style={{ opacity: smoothBlurOpacity }}
          className="absolute inset-0 rounded-[inherit] bg-[#0B0B0B]/[0.02] backdrop-blur-[4px] pointer-events-none"
        />
      </motion.div>
    </div>
  );
}
