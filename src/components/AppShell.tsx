'use client';

import React, { useCallback, useState } from 'react';
import { CustomCursor } from './CustomCursor';
import { Footer } from './Footer';
import { LocomotiveScrollProvider } from './LocomotiveScrollProvider';
import { Navbar } from './Navbar';
import { OrderTrayDrawer } from './OrderTrayDrawer';
import { PageTransition } from './PageTransition';
import { SitePreloader } from './SitePreloader';
import { RouterProvider } from '../context/RouterContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isPreloading, setIsPreloading] = useState(true);
  const handlePreloaderComplete = useCallback(() => {
    setIsPreloading(false);
  }, []);

  return (
    <RouterProvider>
      <LocomotiveScrollProvider isLocked={isPreloading}>
        <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#23140D]">
          {isPreloading && <SitePreloader onComplete={handlePreloaderComplete} />}
          <CustomCursor />
          <Navbar />
          <PageTransition />
          <OrderTrayDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </LocomotiveScrollProvider>
    </RouterProvider>
  );
}
