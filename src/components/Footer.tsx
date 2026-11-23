'use client';

import { ArrowUpRight, Compass, MapPin } from 'lucide-react';
import { useRouter } from '../context/RouterContext';

export function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="relative bg-[#23140D] text-[#FAF7F2] pt-20 pb-12 px-6 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-[780px] h-[780px] rounded-full border border-[#E5A95C]/15 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/15">
          <div className="lg:col-span-5 space-y-5">
            <span className="font-mono-telemetry text-xs tracking-[0.25em] text-[#E5A95C] uppercase block">
              Flagship Roastery &amp; Sensory Bar
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-white leading-tight">
              Aether &amp; Crema
            </h2>
            <p className="text-white/70 text-sm sm:text-base max-w-md leading-relaxed">
              From volcanic cloud-forest cherries at 2,100m ASL to 9-bar naked extraction calibrated daily at 07:00. Every coffee style poured with thermodynamic precision.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#23140D] font-semibold text-sm hover:bg-[#F2ECE1] transition-colors"
              >
                <span>Explore All Coffees</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/about')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/25 text-white text-sm hover:bg-white/10 transition-colors"
              >
                <span>Our Farms &amp; Roastery</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <p className="font-mono-telemetry text-xs tracking-[0.2em] text-[#E5A95C] uppercase">
              Navigation
            </p>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-[#E5A95C] transition-colors">
                  01. Origin Advertisement Film
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-[#E5A95C] transition-colors">
                  02. Atelier &amp; Terroir Atlas
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/products')} className="hover:text-[#E5A95C] transition-colors">
                  03. Full Barista Menu &amp; Whole Beans
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/products/doppio-obsidian-espresso')}
                  className="hover:text-[#E5A95C] transition-colors"
                >
                  04. 3D Cup Anatomy &amp; Customizer
                </button>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <p className="font-mono-telemetry text-xs tracking-[0.2em] text-[#E5A95C] uppercase">
              Flagship Tasting Room
            </p>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-5 space-y-3">
              <div className="flex items-start gap-3 text-sm text-white/90">
                <MapPin className="w-4 h-4 text-[#E5A95C] shrink-0 mt-0.5" />
                <span>418 Mercer Gallery, SoHo District, New York</span>
              </div>
              <div className="flex items-start gap-3 text-xs font-mono-telemetry text-white/70">
                <Compass className="w-4 h-4 text-[#E5A95C] shrink-0 mt-0.5" />
                <span>MON–SUN // 07:00 – 20:00 · ROASTING TUES &amp; FRI</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-telemetry text-white/50">
          <span>© 2026 AETHER &amp; CREMA ATELIER · 100% DIRECT TRADE SPECIALTY COFFEE</span>
          <span>GSAP SCROLLTRIGGER · 1,000-FRAME VIDEO PIPELINE</span>
        </div>
      </div>
    </footer>
  );
}
