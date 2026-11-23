'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import type LocomotiveScroll from 'locomotive-scroll';
import type { ILenisScrollToOptions, lenisTargetScrollTo } from 'locomotive-scroll';
import 'locomotive-scroll/locomotive-scroll.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRouter } from '../context/RouterContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface LocomotiveScrollContextValue {
  scrollTo: (target: lenisTargetScrollTo, options?: ILenisScrollToOptions) => void;
  resize: () => void;
}

const LocomotiveScrollContext = createContext<LocomotiveScrollContextValue | null>(null);

export function LocomotiveScrollProvider({
  children,
  isLocked = false,
}: {
  children: React.ReactNode;
  isLocked?: boolean;
}) {
  const { currentPath, isTrayOpen } = useRouter();
  const locoRef = useRef<LocomotiveScroll | null>(null);
  const isLockedRef = useRef(isLocked);
  isLockedRef.current = isLocked;
  const isTrayOpenRef = useRef(isTrayOpen);
  isTrayOpenRef.current = isTrayOpen;

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let isCancelled = false;
    let locoInstance: LocomotiveScroll | null = null;
    let rafId = 0;
    let tickerFn: ((time: number, deltaTime: number, frame: number) => void) | null = null;

    gsap.ticker.lagSmoothing(0);

    import('locomotive-scroll').then(({ default: LocomotiveScrollCtor }) => {
      if (isCancelled) return;

      const loco = new LocomotiveScrollCtor({
        lenisOptions: {
          lerp: 0.085,
          duration: 1.2,
          smoothWheel: true,
          wheelMultiplier: 1.0,
        },
        scrollCallback: () => {
          ScrollTrigger.update();
        },
        initCustomTicker: (render) => {
          tickerFn = () => render();
          gsap.ticker.add(tickerFn);
        },
        destroyCustomTicker: () => {
          if (tickerFn) {
            gsap.ticker.remove(tickerFn);
            tickerFn = null;
          }
        },
      });

      locoInstance = loco;
      locoRef.current = loco;
      window.scrollTo(0, 0);

      rafId = requestAnimationFrame(() => {
        if (isCancelled) return;
        loco.scrollTo(0, { immediate: true });
        loco.resize();
        ScrollTrigger.refresh();
        if (isLockedRef.current || isTrayOpenRef.current) {
          loco.stop();
        }
      });
    });

    return () => {
      isCancelled = true;
      cancelAnimationFrame(rafId);
      if (locoInstance) {
        locoInstance.destroy();
        locoInstance = null;
      }
      locoRef.current = null;
    };
  }, [currentPath]);

  // Pause smooth scrolling when Preloader or Order Tray drawer is active
  useEffect(() => {
    const loco = locoRef.current;
    if (isLocked) {
      document.documentElement.style.overflow = 'hidden';
      loco?.stop();
    } else {
      document.documentElement.style.overflow = '';
      if (loco) {
        if (isTrayOpen) {
          loco.stop();
        } else {
          loco.start();
          loco.resize();
          ScrollTrigger.refresh();
        }
      }
    }

    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [isTrayOpen, isLocked]);

  const scrollTo = useCallback((target: lenisTargetScrollTo, options?: ILenisScrollToOptions) => {
    if (locoRef.current) {
      locoRef.current.scrollTo(target, options);
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else if (typeof target === 'string') {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    } else if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const resize = useCallback(() => {
    locoRef.current?.resize();
    ScrollTrigger.refresh();
  }, []);

  return (
    <LocomotiveScrollContext.Provider value={{ scrollTo, resize }}>
      {children}
    </LocomotiveScrollContext.Provider>
  );
}

export function useLocomotiveScroll() {
  const ctx = useContext(LocomotiveScrollContext);
  if (!ctx) {
    throw new Error('useLocomotiveScroll must be used within LocomotiveScrollProvider');
  }
  return ctx;
}
