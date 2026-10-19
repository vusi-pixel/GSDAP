/**
 * Motion primitives for GSDAP (Ghana Student Digital Access Programme)
 * Enhanced with pronounced, high-fidelity cinematic easing,
 * subtle blur reveals, and interconnected visual energy.
 * All animations respect prefers-reduced-motion.
 */
import { useRef, useEffect, useState } from 'react';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
  type Variants,
  type MotionProps,
} from 'framer-motion';

// High-end cinematic bezier curve
const cinematicEase = [0.16, 1, 0.3, 1] as const;

// Shared check for accessibility
function useReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ─── FadeIn (Pronounced) ─────────────────────────────────────────────────────
interface FadeInProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Fraction of element visible before triggering (0-1) */
  amount?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  amount = 0.15,
  direction = 'up',
  distance = 32,
  ...props
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount });
  const reduced = useReducedMotion();

  const getOffset = () => {
    switch (direction) {
      case 'up': return { y: distance, x: 0 };
      case 'down': return { y: -distance, x: 0 };
      case 'left': return { x: distance, y: 0 };
      case 'right': return { x: -distance, y: 0 };
      default: return { x: 0, y: 0 };
    }
  };

  const offset = getOffset();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduced ? false : { opacity: 0, ...offset, scale: 0.98, filter: 'blur(6px)' }}
      animate={
        isInView || reduced
          ? { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }
          : { opacity: 0, ...offset, scale: 0.98, filter: 'blur(6px)' }
      }
      transition={{ duration: 0.75, delay, ease: cinematicEase }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ─── FadeInStagger (Pronounced Cascading Sequence) ───────────────────────────
interface FadeInStaggerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  amount?: number;
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: (staggerDelay: number) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.05,
    },
  }),
};

const staggerChild: Variants = {
  hidden: {
    opacity: 0,
    y: 26,
    scale: 0.98,
    filter: 'blur(5px)',
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: cinematicEase,
    },
  },
};

export function FadeInStagger({
  children,
  className,
  staggerDelay = 0.09,
  amount = 0.12,
}: FadeInStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount });
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
      custom={staggerDelay}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}

// ─── PageTransition (Pronounced Silk Reveal) ─────────────────────────────────
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.99, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -18, scale: 0.99, filter: 'blur(6px)' }}
      transition={{ duration: 0.48, ease: cinematicEase }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

// ─── FadeInOut (Pronounced Component Presence) ──────────────────────────────
export function FadeInOut({
  children,
  className,
  duration = 0.4,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.94, y: 12, filter: 'blur(4px)' }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.95, y: -12, filter: 'blur(4px)' }}
      transition={{ duration, ease: cinematicEase }}
    >
      {children}
    </motion.div>
  );
}

// ─── ScaleFadeIn (Pronounced Card & Widget Reveal) ───────────────────────────
export function ScaleFadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
      animate={
        isInView
          ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
          : { opacity: 0, scale: 0.92, filter: 'blur(8px)' }
      }
      transition={{ duration: 0.65, delay, ease: cinematicEase }}
    >
      {children}
    </motion.div>
  );
}

// ─── FadeOnScroll (Hero Fade & Parallax) ──────────────────────────────────────
export function FadeOnScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.75], [0, -60]);
  const scale = useTransform(scrollYProgress, [0, 0.75], [1, 0.96]);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div ref={ref} className={className} style={{ opacity, y, scale }}>
      {children}
    </motion.div>
  );
}

// ─── CountUp ────────────────────────────────────────────────────────────────
interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  separator?: string;
}

export function CountUp({
  end,
  duration = 2.2,
  prefix = '',
  suffix = '',
  className,
  separator = ',',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isInView || hasRun.current) return;
    if (reduced) {
      setValue(end);
      return;
    }
    hasRun.current = true;
    const start = performance.now();
    function step(now: number) {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 4); // ease-out quartic
      setValue(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [isInView, end, duration, reduced]);

  const formatted = value.toLocaleString('en').replace(/,/g, separator);

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

// ─── Presence & Motion Exports ──────────────────────────────────────────────
export { AnimatePresence, motion };
