'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { getPass1Keyframes, preloadHeroFrame } from '../utils/heroFrameCache';

interface SitePreloaderProps {
  onComplete: () => void;
}

const RING_RADIUS = 50;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const PRELOAD_CONCURRENCY = 8;
const MAX_WAIT_MS = 3800;

function getCalibrationLabel(pct: number): string {
  if (pct >= 100) return 'Ready to pour';
  if (pct >= 70) return 'Dialing 9.0 bar extraction...';
  if (pct >= 35) return 'Calibrating 1,000 origin frames...';
  return 'Warming the roastery...';
}

export function SitePreloader({ onComplete }: SitePreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trailingCurtainRef = useRef<HTMLDivElement>(null);
  const primaryCurtainRef = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);
  const brandTitleRef = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ringArcRef = useRef<SVGCircleElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const stageTextRef = useRef<HTMLSpanElement>(null);
  const percentTextRef = useRef<HTMLSpanElement>(null);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let cancelled = false;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minDurationMs = prefersReduced ? 300 : 1400;

    let rafId = 0;
    let maxTimeoutId = 0;
    let exitDelayTimer = 0;
    let enterTl: gsap.core.Timeline | null = null;
    let exitTl: gsap.core.Timeline | null = null;

    if (!prefersReduced) {
      enterTl = gsap.timeline();
      if (brandTitleRef.current) {
        enterTl.fromTo(
          brandTitleRef.current,
          { yPercent: 108, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.72, ease: 'power3.out' }
        );
      }
      if (subtitleRef.current) {
        enterTl.fromTo(
          subtitleRef.current,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out' },
          '-=0.45'
        );
      }
    }

    const keyframes = getPass1Keyframes();
    const totalTasks = keyframes.length + 1;
    let completedTasks = 0;
    let assetsReady = false;

    const fontsReadyPromise =
      'fonts' in document && document.fonts?.ready
        ? document.fonts.ready.catch(() => null).then(() => {
            if (!cancelled) completedTasks++;
          })
        : Promise.resolve().then(() => {
            if (!cancelled) completedTasks++;
          });

    // Prioritize Frame 1 immediately, then warm remaining 50 Pass-1 keyframes with concurrency 8
    const remainingQueue = keyframes.slice(1);
    const frameOnePromise = preloadHeroFrame(keyframes[0], true).then(() => {
      if (!cancelled) completedTasks++;
    });

    const runWorkers = async () => {
      const workerCount = Math.min(PRELOAD_CONCURRENCY, remainingQueue.length);
      const workers = Array.from({ length: workerCount }, async () => {
        while (!cancelled) {
          const nextFrame = remainingQueue.shift();
          if (nextFrame === undefined) break;
          await preloadHeroFrame(nextFrame, false);
          if (!cancelled) completedTasks++;
        }
      });
      await Promise.all(workers);
    };

    Promise.all([fontsReadyPromise, frameOnePromise, runWorkers()]).then(() => {
      if (!cancelled) {
        assetsReady = true;
      }
    });

    maxTimeoutId = window.setTimeout(() => {
      if (!cancelled) {
        assetsReady = true;
      }
    }, MAX_WAIT_MS);

    const startTime = performance.now();
    let displayedPct = 0;
    let exitStarted = false;

    const updateProgressDom = (pct: number) => {
      const clamped = Math.max(0, Math.min(100, pct));
      const rounded = Math.round(clamped);

      if (ringArcRef.current) {
        const offset = RING_CIRCUMFERENCE * (1 - clamped / 100);
        ringArcRef.current.style.strokeDashoffset = offset.toFixed(2);
      }
      if (barFillRef.current) {
        barFillRef.current.style.width = `${clamped.toFixed(1)}%`;
      }
      if (percentTextRef.current) {
        percentTextRef.current.textContent = `${String(rounded).padStart(2, '0')}%`;
      }
      if (stageTextRef.current) {
        stageTextRef.current.textContent = getCalibrationLabel(rounded);
      }
    };

    const startExitSequence = () => {
      if (cancelled) return;
      exitDelayTimer = window.setTimeout(() => {
        if (cancelled) return;

        if (prefersReduced) {
          gsap.to(rootRef.current, {
            opacity: 0,
            duration: 0.25,
            ease: 'power1.out',
            onComplete: () => {
              if (!cancelled) onCompleteRef.current();
            },
          });
          return;
        }

        exitTl = gsap.timeline({
          onComplete: () => {
            if (!cancelled) onCompleteRef.current();
          },
        });

        if (emblemRef.current) {
          exitTl.to(emblemRef.current, {
            y: -28,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.in',
          });
        }

        if (primaryCurtainRef.current) {
          exitTl.to(
            primaryCurtainRef.current,
            {
              yPercent: -114,
              duration: 0.72,
              ease: 'power4.inOut',
            },
            '-=0.14'
          );
        }

        if (trailingCurtainRef.current) {
          exitTl.to(
            trailingCurtainRef.current,
            {
              yPercent: -114,
              duration: 0.76,
              ease: 'power4.inOut',
            },
            '<0.09'
          );
        }
      }, 180);
    };

    const tick = (now: number) => {
      if (cancelled) return;

      const elapsed = now - startTime;
      const timeRatio = Math.min(1, elapsed / minDurationMs);
      const assetRatio = completedTasks / totalTasks;

      const assetTarget = assetsReady ? 100 : Math.min(94, assetRatio * 94);
      const pacedTarget = Math.min(100, timeRatio * 100);
      const targetPct = assetsReady && elapsed >= minDurationMs ? 100 : Math.min(assetTarget, pacedTarget);

      if (targetPct >= 100 && displayedPct >= 99.4) {
        displayedPct = 100;
      } else if (displayedPct < targetPct) {
        const step = Math.max(0.45, (targetPct - displayedPct) * 0.18);
        displayedPct = Math.min(targetPct, displayedPct + step);
      }

      updateProgressDom(displayedPct);

      if (displayedPct >= 100 && !exitStarted) {
        exitStarted = true;
        startExitSequence();
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.clearTimeout(maxTimeoutId);
      window.clearTimeout(exitDelayTimer);
      enterTl?.kill();
      exitTl?.kill();
      if (rootRef.current) {
        gsap.killTweensOf(rootRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label="Loading Aether and Crema origin film"
      className="fixed inset-0 z-[120] overflow-hidden select-none pointer-events-auto"
    >
      {/* Trailing Warm Bronze-Crema Wave Curtain */}
      <div ref={trailingCurtainRef} className="absolute inset-0 bg-[#2A170E]">
        <svg
          aria-hidden="true"
          className="absolute -bottom-16 left-0 w-full h-20 text-[#2A170E]"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,0 L1440,0 L1440,54 C1220,115 860,12 520,76 C260,120 110,48 0,68 Z"
          />
        </svg>
      </div>

      {/* Primary Deep Roasted-Espresso Wave Curtain */}
      <div
        ref={primaryCurtainRef}
        className="absolute inset-0 bg-[#160C07] flex items-center justify-center px-6"
      >
        <div aria-hidden="true" className="cinema-grain absolute inset-0" />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 48%, rgba(229, 169, 92, 0.10) 0%, rgba(22, 12, 7, 0) 62%)',
          }}
        />

        {/* Subtle 35mm Viewfinder Corners */}
        <div aria-hidden="true" className="hidden sm:block absolute inset-8 sm:inset-12 pointer-events-none">
          <span className="absolute top-0 left-0 w-5 h-5 border-t border-l border-[#E5A95C]/30" />
          <span className="absolute top-0 right-0 w-5 h-5 border-t border-r border-[#E5A95C]/30" />
          <span className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-[#E5A95C]/30" />
          <span className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-[#E5A95C]/30" />
        </div>

        <svg
          aria-hidden="true"
          className="absolute -bottom-16 left-0 w-full h-20 text-[#160C07]"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,0 L1440,0 L1440,62 C1160,18 820,120 460,52 C220,14 90,82 0,44 Z"
          />
        </svg>

        {/* Centerpiece Ritual Emblem */}
        <div ref={emblemRef} className="relative z-10 flex flex-col items-center text-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg width="112" height="112" viewBox="0 0 112 112" fill="none" aria-hidden="true">
              {/* Outer Calibration Track */}
              <circle
                cx="56"
                cy="56"
                r={RING_RADIUS}
                stroke="rgba(243, 215, 179, 0.14)"
                strokeWidth="1.25"
              />
              {/* Cardinal Dial Marks */}
              <line x1="56" y1="2" x2="56" y2="8" stroke="rgba(229, 169, 92, 0.45)" strokeWidth="1.2" />
              <line x1="56" y1="104" x2="56" y2="110" stroke="rgba(229, 169, 92, 0.45)" strokeWidth="1.2" />
              <line x1="2" y1="56" x2="8" y2="56" stroke="rgba(229, 169, 92, 0.45)" strokeWidth="1.2" />
              <line x1="104" y1="56" x2="110" y2="56" stroke="rgba(229, 169, 92, 0.45)" strokeWidth="1.2" />
              {/* Live Golden Calibration Progress Arc */}
              <circle
                ref={ringArcRef}
                cx="56"
                cy="56"
                r={RING_RADIUS}
                stroke="#E5A95C"
                strokeWidth="2"
                strokeLinecap="round"
                transform="rotate(-90 56 56)"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE}
              />
              {/* Delicate Steam Wisps */}
              <g className="animate-steam">
                <path
                  d="M49 35 C47 30 51 26 49 21"
                  stroke="#F3D7B3"
                  strokeOpacity="0.6"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M63 36 C65 31 61 27 63 22"
                  stroke="#E5A95C"
                  strokeOpacity="0.65"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </g>
              {/* Signature Coffee Bean Crest */}
              <ellipse cx="56" cy="59" rx="14" ry="18" stroke="#E5A95C" strokeWidth="1.5" />
              <path
                d="M56 42 C51 53 61 65 56 76"
                stroke="#FAF7F2"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="mt-5 overflow-hidden">
            <span
              ref={brandTitleRef}
              className="block font-fancy-serif text-4xl sm:text-5xl text-[#FAF7F2] font-bold tracking-tight"
            >
              Aether &amp; Crema
            </span>
          </div>

          <div ref={subtitleRef} className="mt-2.5 flex items-center gap-3">
            <span className="w-8 sm:w-12 h-[1px] bg-[#E5A95C]/60" />
            <span className="font-mono-telemetry text-[10px] sm:text-[11px] tracking-[0.28em] text-[#E5A95C] uppercase">
              Atelier de Torréfaction
            </span>
            <span className="w-8 sm:w-12 h-[1px] bg-[#E5A95C]/60" />
          </div>

          {/* Slim Golden Progress Bar */}
          <div className="mt-8 w-56 sm:w-72 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              ref={barFillRef}
              className="h-full rounded-full bg-gradient-to-r from-[#B0672B] via-[#E5A95C] to-[#F3D7B3]"
              style={{ width: '0%' }}
            />
          </div>

          {/* Dynamic Stage Text & Tabular Percentage */}
          <div className="mt-3.5 w-56 sm:w-72 flex items-baseline justify-between gap-4">
            <span
              ref={stageTextRef}
              className="font-mono-telemetry text-[10px] sm:text-[11px] tracking-[0.12em] text-[#F3D7B3]/75 text-left"
            >
              Warming the roastery...
            </span>
            <span
              ref={percentTextRef}
              className="font-display italic text-2xl sm:text-3xl text-[#F3D7B3] tabular-nums leading-none shrink-0"
            >
              00%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
