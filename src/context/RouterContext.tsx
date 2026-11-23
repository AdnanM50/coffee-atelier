'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { usePathname, useRouter as useNextRouter } from 'next/navigation';
import { CoffeeItem } from '../data/coffeeData';

export interface TrayItem {
  uid: string;
  coffee: CoffeeItem;
  quantity: number;
  unitPrice: number;
  customization: {
    sizeLabel: string;
    milkOrBase: string;
    extraShots: number;
    grindLabel: string;
    originNote: string;
    caffeineMg: number;
  };
}

interface RouterContextValue {
  currentPath: string;
  pendingPath: string | null;
  isTransitioning: boolean;
  navigate: (path: string, options?: { scrollToTarget?: string }) => void;
  completeTransitionNavigation: () => void;
  finishTransition: () => void;
  scrollTargetAfterNav: string | null;
  clearScrollTarget: () => void;
  trayItems: TrayItem[];
  isTrayOpen: boolean;
  setIsTrayOpen: (open: boolean) => void;
  addToTray: (item: Omit<TrayItem, 'uid'>) => void;
  updateTrayQty: (uid: string, delta: number) => void;
  removeFromTray: (uid: string) => void;
  clearTray: () => void;
  trayCount: number;
  traySubtotal: number;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const nextRouter = useNextRouter();

  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollTargetAfterNav, setScrollTargetAfterNav] = useState<string | null>(null);

  const [trayItems, setTrayItems] = useState<TrayItem[]>([]);
  const [isTrayOpen, setIsTrayOpen] = useState(false);

  const currentPath = pathname;

  const navigate = useCallback(
    (path: string, options?: { scrollToTarget?: string }) => {
      const normalized = path.startsWith('/') ? path : `/${path}`;
      if (normalized === currentPath && !options?.scrollToTarget) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (normalized === currentPath && options?.scrollToTarget) {
        setScrollTargetAfterNav(options.scrollToTarget);
        return;
      }
      if (isTransitioning) return;

      nextRouter.prefetch(normalized);
      setScrollTargetAfterNav(options?.scrollToTarget ?? null);
      setPendingPath(normalized);
      setIsTransitioning(true);
    },
    [currentPath, isTransitioning, nextRouter]
  );

  const completeTransitionNavigation = useCallback(() => {
    if (pendingPath) {
      nextRouter.push(pendingPath);
    }
  }, [pendingPath, nextRouter]);

  const finishTransition = useCallback(() => {
    setPendingPath(null);
    setIsTransitioning(false);
  }, []);

  const clearScrollTarget = useCallback(() => {
    setScrollTargetAfterNav(null);
  }, []);

  const addToTray = useCallback((item: Omit<TrayItem, 'uid'>) => {
    const key = `${item.coffee.id}-${item.customization.sizeLabel}-${item.customization.milkOrBase}-${item.customization.extraShots}-${item.customization.grindLabel}`;
    setTrayItems((prev) => {
      const existing = prev.find((t) => t.uid === key);
      if (existing) {
        return prev.map((t) =>
          t.uid === key ? { ...t, quantity: t.quantity + item.quantity } : t
        );
      }
      return [...prev, { ...item, uid: key }];
    });
    setIsTrayOpen(true);
  }, []);

  const updateTrayQty = useCallback((uid: string, delta: number) => {
    setTrayItems((prev) =>
      prev
        .map((t) => (t.uid === uid ? { ...t, quantity: t.quantity + delta } : t))
        .filter((t) => t.quantity > 0)
    );
  }, []);

  const removeFromTray = useCallback((uid: string) => {
    setTrayItems((prev) => prev.filter((t) => t.uid !== uid));
  }, []);

  const clearTray = useCallback(() => {
    setTrayItems([]);
  }, []);

  const trayCount = trayItems.reduce((sum, item) => sum + item.quantity, 0);
  const traySubtotal = trayItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <RouterContext.Provider
      value={{
        currentPath,
        pendingPath,
        isTransitioning,
        navigate,
        completeTransitionNavigation,
        finishTransition,
        scrollTargetAfterNav,
        clearScrollTarget,
        trayItems,
        isTrayOpen,
        setIsTrayOpen,
        addToTray,
        updateTrayQty,
        removeFromTray,
        clearTray,
        trayCount,
        traySubtotal,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
