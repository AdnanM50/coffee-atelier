'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowDown } from 'lucide-react';
import {
  HERO_TOTAL_FRAMES,
  getPass1Keyframes,
  heroFrames,
  heroNonKeyframeLoaded,
  heroRequestedFrames,
  isPinnedHeroKeyframe,
  preloadHeroFrame,
} from '../utils/heroFrameCache';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const TOTAL_FRAMES = HERO_TOTAL_FRAMES;
const MAX_CONCURRENT_LOADS = 8;
const MAX_LIVE_NON_KEYFRAMES = 550;
const PARTICLE_COUNT = 22;

interface StoryBeat {
  id: string;
  align: 'center' | 'left' | 'right';
  eyebrow: string;
  roman: string;
  headlinePre: string;
  headlineItalic: string;
  story: string;
  craftDatum: string;
  isOpening?: boolean;
}

const STORY_BEATS: StoryBeat[] = [
  {
    id: 'beat-opening',
    align: 'center',
    eyebrow: 'AETHER & CREMA · ORIGIN CHRONICLE',
    roman: '',
    headlinePre: 'From Misty Mountain Farms',
    headlineItalic: 'to Our Barista Shop',
    story:
      'Scroll gently to witness the true journey of every cup—cut into 1,000 cinema frames from highland coffee trees to our sunlit espresso bar.',
    craftDatum: '1,950 m Altitude',
    isOpening: true,
  },
  {
    id: 'beat-harvest',
    align: 'left',
    eyebrow: 'ACT I · THE BOTANICAL HARVEST',
    roman: 'I.',
    headlinePre: 'Grown at 1,950 Meters &',
    headlineItalic: 'Hand-Picked at Peak Ripeness',
    story:
      'Cool volcanic cloud-forest nights slow cherry maturation on the branch before selective farm-gate harvesting fills our woven collection baskets.',
    craftDatum: 'Hand-Selected Cherries',
  },
  {
    id: 'beat-drying',
    align: 'right',
    eyebrow: 'ACT II · RAISED-BED SUN DRYING',
    roman: 'II.',
    headlinePre: 'Turned by Hand Under',
    headlineItalic: 'Highland Morning Sun',
    story:
      'Washed parchment beans rest across elevated cedar beds, hand-raked hourly until moisture settles to an exact 11.2% equilibrium.',
    craftDatum: '11.2% Target Moisture',
  },
  {
    id: 'beat-roast',
    align: 'left',
    eyebrow: "ACT III · THE ROASTER'S FIRE",
    roman: 'III.',
    headlinePre: 'Caramelized in the Heat of',
    headlineItalic: 'First Crack at 204.5°C',
    story:
      'Tumbled inside our thermal roasting drum and swept across the cooling tray, green seeds awaken—forging over 850 cocoa, citrus, and caramel aromatics.',
    craftDatum: '204.5°C First Crack',
  },
  {
    id: 'beat-delivery',
    align: 'right',
    eyebrow: 'ACT IV · SEALED & DIRECT DELIVERY',
    roman: 'IV.',
    headlinePre: 'Packed at Peak Freshness &',
    headlineItalic: 'Delivered at Dawn',
    story:
      'Nitrogen-flushed whole-bean bags travel straight from our roastery by air and early-morning courier—arriving at our doors days off roast.',
    craftDatum: '72h Roast-to-Bar',
  },
  {
    id: 'beat-shop',
    align: 'center',
    eyebrow: 'ACT V · ARRIVAL AT OUR SHOP',
    roman: 'V.',
    headlinePre: 'Extracted at 9 Bars &',
    headlineItalic: 'Poured Fresh in Our Shop',
    story:
      'Ground to order, pulled under 9.0 bars of golden crema, and finished with silky micro-foam—ready for your table at Aether & Crema.',
    craftDatum: '9.0 Bar · 93.5°C',
  },
];

interface Particle {
  x: number;
  y: number;
  r: number;
  speedY: number;
  driftX: number;
  phase: number;
  alpha: number;
}

function createParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, idx) => {
    const seed = (idx + 1) * 1.6180339;
    return {
      x: (seed * 0.73) % 1,
      y: (seed * 0.41) % 1,
      r: 1.2 + ((idx * 37) % 24) / 10,
      speedY: 0.012 + ((idx * 19) % 18) / 1000,
      driftX: (((idx * 23) % 14) - 7) * 0.0022,
      phase: idx * 0.85,
      alpha: 0.16 + ((idx * 13) % 26) / 100,
    };
  });
}

function getActAtmosphere(progress: number) {
  if (progress < 0.3) {
    return { rgb: '243, 215, 179', speedMul: 0.65, driftMul: 1.0, stretchX: 1 };
  }
  if (progress < 0.48) {
    return { rgb: '229, 169, 92', speedMul: 0.85, driftMul: 1.15, stretchX: 1 };
  }
  if (progress < 0.68) {
    return { rgb: '255, 148, 66', speedMul: 1.75, driftMul: 0.8, stretchX: 1 };
  }
  if (progress < 0.85) {
    return { rgb: '238, 224, 206', speedMul: 0.7, driftMul: 1.8, stretchX: 2.2 };
  }
  return { rgb: '250, 247, 242', speedMul: 1.2, driftMul: 0.9, stretchX: 1 };
}

function buildMultiPassQueue(): number[] {
  const seen = new Set<number>();
  const queue: number[] = [];
  const add = (n: number) => {
    if (n >= 1 && n <= TOTAL_FRAMES && !seen.has(n)) {
      seen.add(n);
      queue.push(n);
    }
  };

  add(1);
  // Pass 1: shared 51 keyframes across timeline
  for (const kf of getPass1Keyframes()) add(kf);
  // Pass 2: stride 10 (completes 101 permanent keyframes)
  for (let i = 11; i <= TOTAL_FRAMES; i += 20) add(i);
  // Pass 3: stride 4
  for (let i = 5; i <= TOTAL_FRAMES; i += 4) add(i);
  // Pass 4: stride 2
  for (let i = 3; i <= TOTAL_FRAMES; i += 2) add(i);
  // Pass 5: remaining frames
  for (let i = 1; i <= TOTAL_FRAMES; i++) add(i);

  return queue;
}

function drawCoverFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  img: HTMLImageElement | undefined,
  mouseX: number,
  mouseY: number,
  overscan: number,
  showSpotlight: boolean
) {
  ctx.fillStyle = '#1B100A';
  ctx.fillRect(0, 0, width, height);

  if (img && img.complete && img.naturalWidth > 0) {
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight) * overscan;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (width - dw) / 2 - mouseX * 14;
    const dy = (height - dh) / 2 - mouseY * 9;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // Soft cinematic gradient scrim so white & gold fancy serif typography stays razor-sharp
  const radial = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    Math.min(width, height) * 0.12,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.78
  );
  radial.addColorStop(0, 'rgba(20, 11, 6, 0.30)');
  radial.addColorStop(1, 'rgba(14, 8, 4, 0.74)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);

  if (showSpotlight) {
    const sx = width * (0.5 + mouseX * 0.35);
    const sy = height * (0.5 + mouseY * 0.35);
    const spot = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.max(width, height) * 0.42);
    spot.addColorStop(0, 'rgba(229, 169, 92, 0.11)');
    spot.addColorStop(0.5, 'rgba(176, 103, 43, 0.04)');
    spot.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, width, height);
  }
}

export function HeroFrameScrubber() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const frameStateRef = useRef({
    frame: 1,
    progress: 0,
    mouseX: 0,
    mouseY: 0,
    targetVelocityBoost: 0,
    currentVelocityBoost: 0,
  });
  const introScaleRef = useRef({ scale: 1.035 });
  const prioritizeAroundRef = useRef<((targetFrame: number) => void) | null>(null);
  const isHeroVisibleRef = useRef(true);

  // Track hero visibility so idle/particle rendering pauses completely below the fold
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isHeroVisibleRef.current = entry.isIntersecting;
      },
      { rootMargin: '120px 0px' }
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  // Multi-pass 1,000-frame background loader using shared heroFrameCache + windowed LRU eviction
  useEffect(() => {
    let cancelled = false;
    fetch('/frames/manifest.json').catch(() => null);

    const backgroundQueue = buildMultiPassQueue();
    const urgentQueue: number[] = [];
    let bgCursor = 0;
    let activeLoads = 0;

    const evictIfNeeded = () => {
      if (heroNonKeyframeLoaded.size <= MAX_LIVE_NON_KEYFRAMES) return;

      const currentFrame = frameStateRef.current.frame;
      const candidates: { frame: number; dist: number }[] = [];
      for (const f of heroNonKeyframeLoaded) {
        const dist = Math.abs(f - currentFrame);
        if (dist > 20) {
          candidates.push({ frame: f, dist });
        }
      }
      candidates.sort((a, b) => b.dist - a.dist);

      const evictTarget = heroNonKeyframeLoaded.size - (MAX_LIVE_NON_KEYFRAMES - 30);
      for (let i = 0; i < Math.min(evictTarget, candidates.length); i++) {
        const victim = candidates[i].frame;
        heroNonKeyframeLoaded.delete(victim);
        heroRequestedFrames.delete(victim);
        heroFrames[victim] = undefined;
      }
    };

    const isFrameLoadedOrInflight = (fNum: number) => {
      const cached = heroFrames[fNum];
      if (cached && cached.complete && cached.naturalWidth > 0) return true;
      return heroRequestedFrames.has(fNum);
    };

    const startFrameLoad = (fNum: number, highPriority = false): boolean => {
      if (cancelled || fNum < 1 || fNum > TOTAL_FRAMES) return false;
      if (isFrameLoadedOrInflight(fNum)) return false;

      activeLoads++;
      preloadHeroFrame(fNum, highPriority).then((ok) => {
        activeLoads = Math.max(0, activeLoads - 1);
        if (!cancelled) {
          if (ok && !isPinnedHeroKeyframe(fNum)) {
            evictIfNeeded();
          }
          pumpQueue();
        }
      });
      return true;
    };

    const nextQueuedFrame = (): number | undefined => {
      while (urgentQueue.length > 0) {
        const candidate = urgentQueue.shift()!;
        if (!isFrameLoadedOrInflight(candidate)) {
          return candidate;
        }
      }
      while (bgCursor < backgroundQueue.length) {
        const candidate = backgroundQueue[bgCursor++];
        if (!isFrameLoadedOrInflight(candidate)) {
          return candidate;
        }
      }
      return undefined;
    };

    const pumpQueue = () => {
      if (cancelled) return;
      while (activeLoads < MAX_CONCURRENT_LOADS) {
        const nextFrame = nextQueuedFrame();
        if (nextFrame === undefined) break;
        startFrameLoad(nextFrame, urgentQueue.length > 0);
      }
    };

    prioritizeAroundRef.current = (targetFrame: number) => {
      if (cancelled) return;
      const clamped = Math.round(gsap.utils.clamp(1, TOTAL_FRAMES, targetFrame));
      const neighborhood = [
        clamped,
        clamped - 1,
        clamped + 1,
        clamped - 2,
        clamped + 2,
        clamped - 3,
        clamped + 3,
        clamped - 4,
        clamped + 4,
      ];

      const toFront: number[] = [];
      for (const f of neighborhood) {
        if (f >= 1 && f <= TOTAL_FRAMES && !isFrameLoadedOrInflight(f)) {
          if (activeLoads < MAX_CONCURRENT_LOADS + 4) {
            startFrameLoad(f, true);
          } else {
            toFront.push(f);
          }
        }
      }
      if (toFront.length > 0) {
        urgentQueue.unshift(...toFront);
        if (urgentQueue.length > 36) {
          urgentQueue.length = 36;
        }
      }
    };

    preloadHeroFrame(1, true).catch(() => null);
    pumpQueue();

    return () => {
      cancelled = true;
      prioritizeAroundRef.current = null;
    };
  }, []);

  // Render scrubbed frame, dynamic velocity breath, optical spotlight, and act-reactive particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const noHover = window.matchMedia('(hover: none)').matches;
    const particles = createParticles();

    if (!reducedMotionQuery.matches) {
      introScaleRef.current.scale = 1.08;
      gsap.to(introScaleRef.current, {
        scale: 1.035,
        duration: 1.45,
        ease: 'power3.out',
      });
    } else {
      introScaleRef.current.scale = 1.035;
    }

    const lastDraw = {
      img: undefined as HTMLImageElement | undefined,
      width: 0,
      height: 0,
      dpr: 0,
      mouseX: Number.NaN,
      mouseY: Number.NaN,
      overscan: Number.NaN,
    };

    const getBestFrameImg = (targetFrame: number) => {
      const exact = heroFrames[targetFrame];
      if (exact && exact.complete && exact.naturalWidth > 0) return exact;
      for (let offset = 1; offset <= 30; offset++) {
        const prev = heroFrames[targetFrame - offset];
        if (prev && prev.complete && prev.naturalWidth > 0) return prev;
        const next = heroFrames[targetFrame + offset];
        if (next && next.complete && next.naturalWidth > 0) return next;
      }
      return heroFrames[1];
    };

    const render = (_time = 0, deltaTime = 16.67) => {
      if (!isHeroVisibleRef.current) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w <= 0 || h <= 0) return;

      const state = frameStateRef.current;
      state.currentVelocityBoost += (state.targetVelocityBoost - state.currentVelocityBoost) * 0.16;
      state.targetVelocityBoost *= 0.88;
      if (state.currentVelocityBoost < 0.0001) state.currentVelocityBoost = 0;

      const overscan = introScaleRef.current.scale + state.currentVelocityBoost;
      const f = Math.round(gsap.utils.clamp(1, TOTAL_FRAMES, state.frame));
      const bestImg = getBestFrameImg(f);
      const mx = state.mouseX;
      const my = state.mouseY;
      const reduce = reducedMotionQuery.matches;

      if (reduce) {
        const unchanged =
          bestImg === lastDraw.img &&
          w === lastDraw.width &&
          h === lastDraw.height &&
          dpr === lastDraw.dpr &&
          Math.abs(mx - lastDraw.mouseX) < 0.0005 &&
          Math.abs(my - lastDraw.mouseY) < 0.0005 &&
          Math.abs(overscan - lastDraw.overscan) < 0.0002;
        if (unchanged) return;
      }

      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawCoverFrame(ctx, w, h, bestImg, mx, my, overscan, !noHover);

      if (!reduce) {
        const dt = Math.min(deltaTime || 16.67, 50) / 1000;
        const atmo = getActAtmosphere(state.progress);
        const nowSec = performance.now() * 0.001;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.y -= p.speedY * atmo.speedMul * dt;
          p.x += (p.driftX * atmo.driftMul + Math.sin(nowSec * 0.9 + p.phase) * 0.004) * dt;
          if (p.y < -0.05) p.y = 1.05;
          if (p.x < -0.05) p.x = 1.05;
          if (p.x > 1.05) p.x = -0.05;

          const px = p.x * w - mx * (4 + p.r * 2);
          const py = p.y * h - my * (3 + p.r * 1.5);
          const pulse = 0.72 + 0.28 * Math.sin(nowSec * 1.6 + p.phase);
          const alpha = p.alpha * pulse;

          ctx.fillStyle = `rgba(${atmo.rgb}, ${(alpha * 0.25).toFixed(3)})`;
          ctx.beginPath();
          ctx.ellipse(px, py, p.r * 2.2 * atmo.stretchX, p.r * 2.2, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(${atmo.rgb}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.ellipse(px, py, p.r * atmo.stretchX, p.r, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      lastDraw.img = bestImg;
      lastDraw.width = w;
      lastDraw.height = h;
      lastDraw.dpr = dpr;
      lastDraw.mouseX = mx;
      lastDraw.mouseY = my;
      lastDraw.overscan = overscan;
    };

    render(0, 16.67);
    const tickerCb = (time: number, deltaTime: number) => render(time, deltaTime);
    gsap.ticker.add(tickerCb);

    const xQuick = gsap.quickTo(frameStateRef.current, 'mouseX', { duration: 0.7, ease: 'power3.out' });
    const yQuick = gsap.quickTo(frameStateRef.current, 'mouseY', { duration: 0.7, ease: 'power3.out' });

    const onMouseMove = (e: MouseEvent) => {
      if (noHover) return;
      xQuick((e.clientX / window.innerWidth - 0.5) * 2);
      yQuick((e.clientY / window.innerHeight - 0.5) * 2);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => {
      gsap.ticker.remove(tickerCb);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  // Scroll-driven 1,000-frame mapping + Blur-to-sharp act typography reveals
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
          normal: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const reduce = context.conditions?.reduceMotion;
          const frameMapper = gsap.utils.mapRange(0, 1, 1, TOTAL_FRAMES);

          ScrollTrigger.create({
            id: 'video-story-frames',
            trigger: wrapperRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: reduce ? false : 0.35,
            onUpdate: (self) => {
              const p = self.progress;
              const nextFrame = Math.round(gsap.utils.clamp(1, TOTAL_FRAMES, frameMapper(p)));
              frameStateRef.current.frame = nextFrame;
              frameStateRef.current.progress = p;
              frameStateRef.current.targetVelocityBoost = Math.min(
                0.035,
                Math.abs(self.getVelocity()) * 0.000018
              );

              prioritizeAroundRef.current?.(nextFrame);

              if (progressBarRef.current) {
                progressBarRef.current.style.width = `${(p * 100).toFixed(2)}%`;
              }
            },
          });

          const sections = gsap.utils.toArray<HTMLElement>('.story-section', wrapperRef.current);
          sections.forEach((sec, index) => {
            const inner = sec.querySelector('.story-typography');
            if (!inner || reduce) return;

            if (index === 0) {
              const introInner = sec.querySelector('.story-opening-intro');
              if (introInner) {
                gsap.fromTo(
                  introInner,
                  { opacity: 0, y: 26, filter: 'blur(6px)' },
                  { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.95, ease: 'power3.out' }
                );
              }
              gsap.to(inner, {
                opacity: 0.14,
                y: -48,
                filter: 'blur(4px)',
                ease: 'none',
                scrollTrigger: {
                  trigger: sec,
                  start: 'top top',
                  end: 'bottom top',
                  scrub: true,
                },
              });
            } else {
              const tl = gsap.timeline({
                scrollTrigger: {
                  trigger: sec,
                  start: 'top 82%',
                  end: 'bottom 18%',
                  scrub: 0.5,
                },
              });

              tl.fromTo(
                inner,
                { opacity: 0, y: 56, filter: 'blur(8px)' },
                { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.36, ease: 'power2.out' }
              )
                .to(inner, { duration: 0.34 })
                .to(inner, {
                  opacity: 0.16,
                  y: -36,
                  filter: 'blur(4px)',
                  duration: 0.3,
                  ease: 'power1.in',
                });
            }
          });
        }
      );

      return () => mm.revert();
    },
    { scope: wrapperRef }
  );

  return (
    <section
      id="story-scrubber"
      ref={wrapperRef}
      aria-label="1,000-Frame Live Coffee Origin Video Story"
      className="relative w-full bg-[#1B100A]"
    >
      {/* LAYER 1: Sticky 1,000-Frame Atmospheric Canvas & 35mm Film Grain */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden z-0 pointer-events-none">
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div aria-hidden="true" className="cinema-grain absolute inset-0" />
      </div>

      {/* LAYER 2: Sticky Cinema HUD — Top Hairline Progress & 35mm Viewfinder Corners */}
      <div className="sticky top-0 left-0 w-full h-screen z-30 pointer-events-none -mt-[100vh]">
        {/* Hairline Top Scroll Progress Accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/10">
          <div ref={progressBarRef} className="h-full bg-[#E5A95C]" style={{ width: '0%' }} />
        </div>

        {/* 35mm Anamorphic Corner Viewfinder Brackets */}
        <div aria-hidden="true" className="hidden sm:block absolute inset-x-6 sm:inset-x-10 top-24 bottom-12 opacity-40">
          <span className="absolute top-0 left-0 w-5 h-5 border-t border-l border-[#E5A95C]/75" />
          <span className="absolute top-0 right-0 w-5 h-5 border-t border-r border-[#E5A95C]/75" />
          <span className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-[#E5A95C]/75" />
          <span className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-[#E5A95C]/75" />
        </div>
      </div>

      {/* LAYER 3: 6 Full-Viewport Typography Sections Scrolling Over the Scrubbed Cinema */}
      <div className="relative z-10 -mt-[100vh] pointer-events-none">
        {STORY_BEATS.map((beat) => {
          const alignClass =
            beat.align === 'center'
              ? 'items-center text-center mx-auto max-w-4xl'
              : beat.align === 'right'
              ? 'items-end text-right ml-auto max-w-3xl'
              : 'items-start text-left mr-auto max-w-3xl';

          const datumBorderClass =
            beat.align === 'right' ? 'justify-end' : beat.align === 'center' ? 'justify-center' : 'justify-start';

          return (
            <div
              key={beat.id}
              className={`story-section ${
                beat.isOpening ? 'min-h-screen pt-24 pb-20' : 'min-h-[150vh] py-28'
              } w-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center`}
            >
              <div className={`story-typography flex flex-col ${alignClass} space-y-5`}>
                <div className={beat.isOpening ? 'story-opening-intro flex flex-col items-center space-y-5' : 'contents'}>
                  <div className="flex items-center gap-3">
                    {beat.align !== 'left' && (
                      <span className="hidden sm:inline-block w-14 h-[1px] bg-[#E5A95C]" />
                    )}
                    <span className="font-mono-telemetry text-[11px] sm:text-xs tracking-[0.28em] text-[#E5A95C] uppercase font-medium text-editorial-shadow">
                      {beat.eyebrow}
                    </span>
                    {beat.align !== 'right' && (
                      <span className="hidden sm:inline-block w-14 h-[1px] bg-[#E5A95C]" />
                    )}
                  </div>

                  {beat.isOpening ? (
                    <h1 className="font-fancy-serif text-5xl sm:text-7xl lg:text-8xl text-white font-bold leading-[1.02] tracking-tight text-editorial-shadow">
                      {beat.headlinePre}
                      <span className="block italic font-normal text-[#F3D7B3] text-4xl sm:text-6xl lg:text-7xl mt-2">
                        {beat.headlineItalic}
                      </span>
                    </h1>
                  ) : (
                    <h2 className="font-fancy-serif text-4xl sm:text-6xl lg:text-7xl text-white font-bold leading-[1.04] tracking-tight text-editorial-shadow">
                      <span className="font-fancy-display text-[#E5A95C] font-normal mr-3 sm:mr-4">
                        {beat.roman}
                      </span>
                      {beat.headlinePre}
                      <span className="block italic font-normal text-[#F3D7B3] mt-1.5">
                        {beat.headlineItalic}
                      </span>
                    </h2>
                  )}

                  <p className="text-base sm:text-xl text-white/95 leading-relaxed max-w-2xl font-normal text-editorial-shadow">
                    {beat.story}
                  </p>

                  {beat.isOpening ? (
                    <div className="pt-8 flex flex-col items-center gap-2 text-xs font-mono-telemetry tracking-[0.24em] text-[#F3D7B3] uppercase text-editorial-shadow">
                      <span>Scroll to Watch the Journey</span>
                      <ArrowDown className="w-4 h-4 text-[#E5A95C] animate-scroll-bounce" />
                    </div>
                  ) : (
                    <div className={`pt-2 flex items-center gap-3 ${datumBorderClass}`}>
                      <span className="w-8 h-[1px] bg-[#E5A95C]/70" />
                      <span className="font-mono-telemetry text-[11px] sm:text-xs tracking-[0.22em] text-[#E5A95C] uppercase text-editorial-shadow">
                        {beat.craftDatum}
                      </span>
                      <span className="w-8 h-[1px] bg-[#E5A95C]/70" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
