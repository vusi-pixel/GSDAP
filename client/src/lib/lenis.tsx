/**
 * Lenis smooth scroll provider
 * Disabled when prefers-reduced-motion or data-saver mode is on.
 */
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useLocation } from 'react-router-dom';
import { useThemeStore } from '../store';

let globalLenis: Lenis | null = null;

export function useLenis() {
  return globalLenis;
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { dataSaverMode } = useThemeStore();
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const isTouchDevice =
    typeof window !== 'undefined' ? window.matchMedia('(hover: none)').matches : false;

  const shouldDisableLenis = prefersReducedMotion || dataSaverMode || isTouchDevice;

  useEffect(() => {
    if (shouldDisableLenis) {
      globalLenis = null;
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
    });

    lenisRef.current = lenis;
    globalLenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }

    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
      globalLenis = null;
    };
  }, [shouldDisableLenis]);

  // Scroll to top on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return <>{children}</>;
}
