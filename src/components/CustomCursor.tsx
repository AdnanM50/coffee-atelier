'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const noHover = window.matchMedia('(hover: none)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (noHover || reduced) return;

    setEnabled(true);

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

    const xDot = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
    const yDot = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
    const xRing = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3.out' });
    const yRing = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3.out' });

    let visible = false;

    const onMove = (e: MouseEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.25 });
      }
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);

      const target = e.target as HTMLElement | null;
      const interactive = target?.closest('a, button, [data-cursor="interactive"]');
      if (interactive) {
        gsap.to(ring, { scale: 1.75, borderColor: '#B0672B', duration: 0.25, overwrite: 'auto' });
        gsap.to(dot, { scale: 0.5, backgroundColor: '#B0672B', duration: 0.2, overwrite: 'auto' });
      } else {
        gsap.to(ring, { scale: 1, borderColor: 'rgba(176, 103, 43, 0.6)', duration: 0.25, overwrite: 'auto' });
        gsap.to(dot, { scale: 1, backgroundColor: '#23140D', duration: 0.2, overwrite: 'auto' });
      }
    };

    const onLeave = () => {
      visible = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#23140D] pointer-events-none z-[90] opacity-0 ring-1 ring-white/50"
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-9 h-9 rounded-full border border-[#B0672B]/60 pointer-events-none z-[90] opacity-0"
      />
    </>
  );
}
