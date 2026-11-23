'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useRouter } from '../context/RouterContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

function getRouteTelemetryLabel(path: string | null) {
  if (!path || path === '/') return 'ORIGIN FILM // 1,000 FRAMES';
  if (path === '/about') return 'ATELIER & TERROIR ATLAS';
  if (path === '/products') return 'BARISTA MENU // ALL COFFEES';
  if (path.startsWith('/products/')) {
    const slug = path.replace('/products/', '').toUpperCase().replace(/-/g, ' ');
    return `3D SPEC // ${slug}`;
  }
  return 'AETHER & CREMA';
}

export function PageTransition() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const layerWhiteRef = useRef<HTMLDivElement>(null);
  const layerCremaRef = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);

  const { isTransitioning, pendingPath, completeTransitionNavigation, finishTransition } =
    useRouter();

  useGSAP(
    () => {
      if (!isTransitioning || !pendingPath) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
          normal: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const reduce = context.conditions?.reduceMotion;

          if (reduce) {
            ScrollTrigger.getAll().forEach((st) => st.kill());
            completeTransitionNavigation();
            window.scrollTo(0, 0);
            requestAnimationFrame(() => {
              ScrollTrigger.refresh();
              finishTransition();
            });
            return;
          }

          gsap.set(overlayRef.current, { autoAlpha: 1, pointerEvents: 'all' });
          gsap.set(layerCremaRef.current, { yPercent: 105 });
          gsap.set(layerWhiteRef.current, { yPercent: 112 });
          gsap.set(emblemRef.current, { opacity: 0, y: 24, scale: 0.94 });

          const tl = gsap.timeline({
            onComplete: () => {
              gsap.set(overlayRef.current, { autoAlpha: 0, pointerEvents: 'none' });
              ScrollTrigger.refresh();
              finishTransition();
            },
          });

          tl.to(layerCremaRef.current, {
            yPercent: 0,
            duration: 0.42,
            ease: 'power3.inOut',
          })
            .to(
              layerWhiteRef.current,
              {
                yPercent: 0,
                duration: 0.48,
                ease: 'power3.inOut',
              },
              '-=0.32'
            )
            .to(
              emblemRef.current,
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.28,
                ease: 'power2.out',
              },
              '-=0.18'
            )
            .add(() => {
              ScrollTrigger.getAll().forEach((st) => st.kill());
              completeTransitionNavigation();
              window.scrollTo(0, 0);
            })
            .to(emblemRef.current, {
              opacity: 0,
              y: -20,
              duration: 0.24,
              delay: 0.12,
              ease: 'power2.in',
            })
            .to(
              layerWhiteRef.current,
              {
                yPercent: -108,
                duration: 0.52,
                ease: 'power3.inOut',
              },
              '-=0.06'
            )
            .to(
              layerCremaRef.current,
              {
                yPercent: -112,
                duration: 0.5,
                ease: 'power3.inOut',
              },
              '-=0.4'
            );
        }
      );

      return () => mm.revert();
    },
    { dependencies: [isTransitioning, pendingPath] }
  );

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] pointer-events-none opacity-0 invisible overflow-hidden"
    >
      {/* Rich Espresso Crema Curtain */}
      <div ref={layerCremaRef} className="absolute inset-0 bg-[#23140D]">
        <svg
          className="absolute -top-16 left-0 w-full h-20 text-[#23140D]"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,64 C320,130 620,-10 960,64 C1200,115 1350,30 1440,56 L1440,120 L0,120 Z"
          />
        </svg>
      </div>

      {/* Warm Porcelain White Curtain */}
      <div
        ref={layerWhiteRef}
        className="absolute inset-0 bg-[#FAF7F2] flex items-center justify-center"
      >
        <svg
          className="absolute -top-16 left-0 w-full h-20 text-[#FAF7F2]"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,70 C360,10 720,125 1080,45 C1260,8 1380,65 1440,42 L1440,120 L0,120 Z"
          />
        </svg>

        <div ref={emblemRef} className="text-center px-6">
          <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-[#23140D] flex items-center justify-center shadow-lg">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <ellipse cx="16" cy="16" rx="10" ry="13" stroke="#E5A95C" strokeWidth="1.5" />
              <path d="M16 4 C12 12 20 20 16 28" stroke="#FAF7F2" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="font-mono-telemetry text-[11px] tracking-[0.28em] text-[#B0672B] uppercase font-semibold">
            {getRouteTelemetryLabel(pendingPath)}
          </p>
          <p className="font-display text-3xl sm:text-4xl text-[#23140D] mt-2 tracking-wide font-semibold">
            Aether &amp; Crema
          </p>
        </div>
      </div>
    </div>
  );
}
