'use client';

import { useState } from 'react';
import { Coffee, Film, Menu, ShoppingBag, X } from 'lucide-react';
import { useLocomotiveScroll } from './LocomotiveScrollProvider';
import { useRouter } from '../context/RouterContext';

export function Navbar() {
  const { currentPath, navigate, setIsTrayOpen, trayCount } = useRouter();
  const { scrollTo } = useLocomotiveScroll();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Origin Film', path: '/' },
    { label: 'Atelier & Farms', path: '/about' },
    { label: 'Every Coffee', path: '/products' },
  ];

  const handleJumpToStoryFrame = () => {
    setMobileOpen(false);
    if (currentPath === '/') {
      scrollTo('#story-scrubber', { duration: 1.1 });
    } else {
      navigate('/', { scrollToTarget: 'story-scrubber' });
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-[60] px-4 sm:px-8 py-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 glass-white rounded-full px-5 sm:px-7 py-3 pointer-events-auto shadow-xl shadow-[#23140D]/10">
        {/* Brand Emblem */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#23140D] rounded-full pr-2"
        >
          <span className="w-9 h-9 rounded-full bg-[#23140D] text-[#FAF7F2] flex items-center justify-center group-hover:bg-[#B0672B] transition-colors duration-300">
            <Coffee className="w-4 h-4" />
          </span>
          <div>
            <span className="font-display text-lg sm:text-xl font-bold tracking-wide text-[#23140D] block leading-none">
              Aether &amp; Crema
            </span>
            <span className="font-mono-telemetry text-[10px] tracking-[0.2em] text-[#B0672B] uppercase hidden sm:block mt-0.5">
              Atelier de Torréfaction
            </span>
          </div>
        </button>

        {/* Desktop Links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active =
              item.path === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'bg-[#23140D] text-white font-semibold shadow-md shadow-[#23140D]/15'
                    : 'text-[#23140D]/75 hover:text-[#23140D] hover:bg-[#23140D]/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Pills */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleJumpToStoryFrame}
            className="hidden lg:inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#23140D]/15 text-xs font-mono-telemetry text-[#3A2218] hover:bg-[#F2ECE1] transition-colors"
            title="Jump to 1,000-Frame Farm-to-Shop Film"
          >
            <Film className="w-3.5 h-3.5 text-[#B0672B]" />
            <span>1,000-Frame Film</span>
          </button>

          <button
            onClick={() => setIsTrayOpen(true)}
            aria-label="Open Barista Order Tray"
            className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#23140D] text-white text-xs sm:text-sm font-semibold hover:bg-[#3A2218] transition-colors shadow-md"
          >
            <ShoppingBag className="w-4 h-4 text-[#E5A95C]" />
            <span className="hidden sm:inline">Barista Tray</span>
            <span className="font-mono-telemetry text-xs px-1.5 py-0.5 rounded-full bg-white text-[#23140D]">
              {trayCount}
            </span>
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden w-9 h-9 rounded-full border border-[#23140D]/20 flex items-center justify-center text-[#23140D]"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden mt-2 max-w-7xl mx-auto glass-white rounded-3xl p-4 pointer-events-auto space-y-2 shadow-2xl">
          {navItems.map((item) => {
            const active =
              item.path === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  setMobileOpen(false);
                  navigate(item.path);
                }}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#23140D] text-white font-semibold'
                    : 'text-[#23140D] hover:bg-[#23140D]/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            onClick={handleJumpToStoryFrame}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl border border-[#23140D]/15 text-xs font-mono-telemetry text-[#B0672B]"
          >
            <Film className="w-4 h-4" />
            <span>Jump to 1,000-Frame Story Film</span>
          </button>
        </div>
      )}
    </header>
  );
}
