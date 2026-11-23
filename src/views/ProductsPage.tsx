'use client';

import { useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Flame, Search, SlidersHorizontal, Snowflake, Sparkles } from 'lucide-react';
import {
  CATEGORIES,
  COFFEES,
  CoffeeCategory,
  RoastLevel,
  TemperatureType,
} from '../data/coffeeData';
import { useRouter } from '../context/RouterContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Flip, useGSAP);
}

type SortOption = 'sca-desc' | 'price-asc' | 'price-desc' | 'caffeine-desc';

export function ProductsPage() {
  const { navigate, addToTray } = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<'All' | CoffeeCategory>('All');
  const [selectedTemp, setSelectedTemp] = useState<'All' | TemperatureType>('All');
  const [selectedRoast, setSelectedRoast] = useState<'All' | RoastLevel>('All');
  const [sortBy, setSortBy] = useState<SortOption>('sca-desc');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCoffees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = COFFEES.filter((c) => {
      if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
      if (selectedTemp !== 'All' && c.temperature !== selectedTemp) return false;
      if (selectedRoast !== 'All' && c.roastLevel !== selectedRoast) return false;
      if (q) {
        const hay = `${c.name} ${c.subtitle} ${c.origin.country} ${c.origin.region} ${c.flavorNotes.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'sca-desc') return b.scaScore - a.scaScore;
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return b.caffeineMg - a.caffeineMg;
    });
  }, [selectedCategory, selectedTemp, selectedRoast, sortBy, searchQuery]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cards = gsap.utils.toArray<HTMLElement>('.product-card', gridRef.current);
        if (cards.length === 0) return;
        gsap.fromTo(
          cards,
          { opacity: 0, y: 36, rotateX: 16 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.55,
            stagger: { each: 0.045, from: 'start' },
            ease: 'power2.out',
            clearProps: 'transform',
          }
        );
      });
      return () => mm.revert();
    },
    {
      dependencies: [selectedCategory, selectedTemp, selectedRoast, sortBy, searchQuery],
      scope: gridRef,
    }
  );

  const handleSortChange = (nextSort: SortOption) => {
    const cards = gsap.utils.toArray<HTMLElement>('.product-card', gridRef.current);
    const state = cards.length > 0 ? Flip.getState(cards) : null;
    setSortBy(nextSort);
    if (state) {
      requestAnimationFrame(() => {
        Flip.from(state, {
          duration: 0.45,
          ease: 'power2.inOut',
          simple: true,
        });
      });
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-[#FAF7F2] text-[#23140D] pt-28 pb-24 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Crisp White & Espresso Header Console */}
        <header className="relative rounded-[36px] bg-white border border-[#23140D]/12 p-8 sm:p-12 overflow-hidden shadow-xl shadow-[#23140D]/5">
          <div
            aria-hidden="true"
            className="animate-float-a absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#F2ECE1] blur-3xl pointer-events-none"
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="font-mono-telemetry text-xs tracking-[0.24em] text-[#B0672B] uppercase font-semibold block">
                Complete Barista Menu &amp; Roastery Archive
              </span>
              <h1 className="font-display text-5xl sm:text-6xl font-semibold text-[#23140D] leading-tight">
                Every Coffee Available
              </h1>
              <p className="text-sm sm:text-base text-[#23140D]/70 leading-relaxed">
                Explore {COFFEES.length} precision-calibrated coffees across classic 9-bar espresso, manual pour-overs, nitro cold drafts, heritage global brews, and nitrogen-flushed whole bean bags.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-[#23140D] text-white px-5 py-3 text-right shadow-md">
                <span className="font-mono-telemetry text-[10px] text-[#E5A95C] uppercase block">
                  Showing Lots
                </span>
                <span className="font-mono-telemetry text-2xl font-semibold">
                  {filteredCoffees.length} / {COFFEES.length}
                </span>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="relative z-10 flex flex-wrap gap-2 mt-8 pt-6 border-t border-[#23140D]/10">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                selectedCategory === 'All'
                  ? 'bg-[#23140D] text-white font-semibold shadow-md'
                  : 'bg-[#FAF7F2] text-[#23140D]/80 border border-[#23140D]/15 hover:border-[#B0672B]'
              }`}
            >
              All {COFFEES.length} Coffees
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#23140D] text-white font-semibold shadow-md'
                    : 'bg-[#FAF7F2] text-[#23140D]/80 border border-[#23140D]/15 hover:border-[#B0672B]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sub-Filters: Search, Temp, Roast, Sort */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 mt-4">
            <div className="lg:col-span-3 relative">
              <Search className="w-4 h-4 text-[#B0672B] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search origin, flavor, brew..."
                aria-label="Search coffees"
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#FAF7F2] border border-[#23140D]/15 text-sm text-[#23140D] focus:outline-none focus:border-[#23140D]"
              />
            </div>

            <div className="lg:col-span-4 flex items-center gap-1 bg-[#FAF7F2] border border-[#23140D]/15 rounded-full p-1">
              {(['All', 'Hot', 'Iced', 'Whole Bean'] as const).map((temp) => (
                <button
                  key={temp}
                  onClick={() => setSelectedTemp(temp)}
                  className={`flex-1 whitespace-nowrap py-1.5 px-2.5 rounded-full text-[11px] font-medium transition-colors ${
                    selectedTemp === temp
                      ? 'bg-[#23140D] text-white font-semibold shadow-sm'
                      : 'text-[#23140D]/70 hover:text-[#23140D]'
                  }`}
                >
                  {temp}
                </button>
              ))}
            </div>

            <div className="lg:col-span-3">
              <select
                value={selectedRoast}
                onChange={(e) => setSelectedRoast(e.target.value as 'All' | RoastLevel)}
                aria-label="Filter by roast level"
                className="w-full px-4 py-2.5 rounded-full bg-[#FAF7F2] border border-[#23140D]/15 text-xs text-[#23140D] focus:outline-none focus:border-[#23140D]"
              >
                <option value="All">All Roast Profiles</option>
                <option value="Light">Light Roast (Floral / Tea)</option>
                <option value="Medium-Light">Medium-Light Roast</option>
                <option value="Medium">Medium Roast (Balanced)</option>
                <option value="Medium-Dark">Medium-Dark Roast</option>
                <option value="Dark">Dark Roast (Phin Reserve)</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <div className="relative">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#B0672B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  aria-label="Sort coffees"
                  className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[#FAF7F2] border border-[#23140D]/15 text-xs text-[#23140D] focus:outline-none focus:border-[#23140D]"
                >
                  <option value="sca-desc">Highest SCA Score</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="caffeine-desc">Caffeine: Highest</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Product Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1200">
          {filteredCoffees.length === 0 ? (
            <div className="col-span-full rounded-3xl bg-white border border-[#23140D]/12 p-14 text-center space-y-4">
              <p className="font-display text-3xl text-[#23140D]">No Coffees Match Those Filters</p>
              <p className="text-sm text-[#23140D]/65">
                Try clearing your roast or search filter to see our full barista menu.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedTemp('All');
                  setSelectedRoast('All');
                  setSearchQuery('');
                }}
                className="px-6 py-2.5 rounded-full bg-[#23140D] text-white font-semibold text-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredCoffees.map((coffee) => (
              <article
                key={coffee.id}
                data-flip-id={coffee.id}
                className="product-card group rounded-[28px] bg-white border border-[#23140D]/10 p-6 flex flex-col justify-between hover:border-[#B0672B] hover:-translate-y-1.5 transition-all duration-300 shadow-lg shadow-[#23140D]/5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono-telemetry">
                    <span className="px-2.5 py-1 rounded-full bg-[#F2ECE1] text-[#23140D] font-semibold">
                      SCA {coffee.scaScore.toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#23140D]/65 font-medium">
                      {coffee.temperature === 'Iced' ? (
                        <Snowflake className="w-3.5 h-3.5 text-[#3B7EA1]" />
                      ) : (
                        <Flame className="w-3.5 h-3.5 text-[#B0672B]" />
                      )}
                      {coffee.roastLevel} · {coffee.caffeineMg}mg
                    </span>
                  </div>

                  {/* Real Coffee Photography Window */}
                  <div
                    onClick={() => navigate(`/products/${coffee.slug}`)}
                    data-cursor="interactive"
                    className="my-5 h-48 rounded-2xl overflow-hidden bg-[#F2ECE1] cursor-pointer"
                  >
                    <img
                      src={coffee.photoUrl}
                      alt={coffee.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <span className="font-mono-telemetry text-[10px] uppercase tracking-[0.18em] text-[#B0672B] font-semibold">
                    {coffee.category}
                  </span>
                  <h2
                    onClick={() => navigate(`/products/${coffee.slug}`)}
                    className="font-display text-2xl font-semibold text-[#23140D] mt-1 leading-snug cursor-pointer group-hover:text-[#B0672B] transition-colors"
                  >
                    {coffee.name}
                  </h2>
                  <p className="text-xs text-[#23140D]/68 mt-2 line-clamp-2 leading-relaxed">
                    {coffee.subtitle}
                  </p>

                  {/* Flavor Note Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {coffee.flavorNotes.map((note) => (
                      <span
                        key={note}
                        className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#23140D]/10 text-[11px] text-[#23140D]/80 font-medium"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-[#23140D]/10 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-mono-telemetry text-lg font-semibold text-[#23140D]">
                      ${coffee.price.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-[#23140D]/55 block">
                      {coffee.origin.country}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        addToTray({
                          coffee,
                          quantity: 1,
                          unitPrice: coffee.price,
                          customization: {
                            sizeLabel: coffee.vesselType === 'bag' ? '250g Bag' : 'Atelier Standard',
                            milkOrBase: coffee.temperature === 'Whole Bean' ? 'Whole Seed' : 'Barista Default',
                            extraShots: 0,
                            grindLabel: `${coffee.brewRecipe.grindMicrons}μm Calibrated`,
                            originNote: coffee.origin.region,
                            caffeineMg: coffee.caffeineMg,
                          },
                        })
                      }
                      className="px-3.5 py-2 rounded-full bg-[#FAF7F2] border border-[#23140D]/15 hover:bg-[#23140D] hover:text-white text-xs font-semibold transition-colors"
                    >
                      + Tray
                    </button>

                    <button
                      onClick={() => navigate(`/products/${coffee.slug}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#23140D] text-white text-xs font-semibold hover:bg-[#B0672B] transition-colors shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#E5A95C]" />
                      <span>3D Spec</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
