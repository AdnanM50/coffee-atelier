'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight, CalendarCheck, Coffee, Compass, Flame, Layers, Sparkles, Star } from 'lucide-react';
import { HeroFrameScrubber } from '../components/HeroFrameScrubber';
import { useLocomotiveScroll } from '../components/LocomotiveScrollProvider';
import { BREW_SYSTEMS, COFFEES, CoffeeItem } from '../data/coffeeData';
import { useRouter } from '../context/RouterContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

type FlavorQuadrant = CoffeeItem['flavorQuadrant'];

const FLAVOR_QUADRANTS: {
  name: FlavorQuadrant;
  color: string;
  angleStart: number;
  angleEnd: number;
  notes: string;
}[] = [
  {
    name: 'Floral & Bergamot',
    color: '#C87D3B',
    angleStart: -90,
    angleEnd: -18,
    notes: 'Jasmine Blossom · Kochi Yuzu · White Peach',
  },
  {
    name: 'Red Berry & Winey',
    color: '#A62B2B',
    angleStart: -18,
    angleEnd: 54,
    notes: 'Blackcurrant · Wild Strawberry · Guava',
  },
  {
    name: 'Spiced Caramel & Bourbon',
    color: '#B0672B',
    angleStart: 54,
    angleEnd: 126,
    notes: 'Butterscotch · Cardamom · Smoked Maple',
  },
  {
    name: 'Dark Cacao & Hazelnut',
    color: '#3A2218',
    angleStart: 126,
    angleEnd: 198,
    notes: '75% Cacao · Roasted Hazelnut · Molasses',
  },
  {
    name: 'Matcha & Botanical',
    color: '#2D5A3F',
    angleStart: 198,
    angleEnd: 270,
    notes: 'First-Flush Uji · Sweet Umami · Herbs',
  },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeAnnularSector(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
) {
  const outerStart = polarToCartesian(cx, cy, rOuter, startAngle);
  const outerEnd = polarToCartesian(cx, cy, rOuter, endAngle);
  const innerEnd = polarToCartesian(cx, cy, rInner, endAngle);
  const innerStart = polarToCartesian(cx, cy, rInner, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', outerStart.x, outerStart.y,
    'A', rOuter, rOuter, 0, largeArc, 1, outerEnd.x, outerEnd.y,
    'L', innerEnd.x, innerEnd.y,
    'A', rInner, rInner, 0, largeArc, 0, innerStart.x, innerStart.y,
    'Z',
  ].join(' ');
}

export function HomePage() {
  const { navigate, addToTray, scrollTargetAfterNav, clearScrollTarget } = useRouter();
  const { scrollTo } = useLocomotiveScroll();
  const pageRef = useRef<HTMLDivElement>(null);
  const horizontalWrapperRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const flavorShowcaseRef = useRef<HTMLDivElement>(null);

  const [activeFlavor, setActiveFlavor] = useState<FlavorQuadrant>('Floral & Bergamot');
  const [omakaseDate, setOmakaseDate] = useState('Saturday · 11:00 AM');
  const [omakaseGuest, setOmakaseGuest] = useState('');
  const [omakaseBooked, setOmakaseBooked] = useState(false);

  useEffect(() => {
    if (scrollTargetAfterNav === 'story-scrubber') {
      scrollTo('#story-scrubber', { duration: 1.1 });
      clearScrollTarget();
    }
  }, [scrollTargetAfterNav, clearScrollTarget, scrollTo]);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
          desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
          mobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const reduce = context.conditions?.reduceMotion;

          const track = horizontalTrackRef.current;
          const wrapper = horizontalWrapperRef.current;
          if (track && wrapper && !reduce) {
            const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth + 120);

            const horizTween = gsap.to(track, {
              x: () => -getDistance(),
              ease: 'none',
              scrollTrigger: {
                id: 'brew-lab-horizontal',
                trigger: wrapper,
                pin: true,
                scrub: 1,
                start: 'top top',
                end: () => `+=${Math.max(1200, getDistance())}`,
                invalidateOnRefresh: true,
              },
            });

            gsap.utils.toArray<HTMLElement>('.brew-card', track).forEach((card) => {
              gsap.from(card, {
                y: 45,
                rotateY: -10,
                opacity: 0.4,
                duration: 0.7,
                ease: 'power2.out',
                scrollTrigger: {
                  containerAnimation: horizTween,
                  trigger: card,
                  start: 'left 85%',
                  toggleActions: 'play none none reverse',
                },
              });
            });
          }

          if (!reduce) {
            gsap.to('.parallax-slow', {
              y: -90,
              ease: 'none',
              scrollTrigger: {
                trigger: '.roastery-parallax-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            });

            gsap.to('.parallax-fast', {
              y: -170,
              ease: 'none',
              scrollTrigger: {
                trigger: '.roastery-parallax-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            });

            gsap.to('.parallax-down', {
              y: 70,
              ease: 'none',
              scrollTrigger: {
                trigger: '.roastery-parallax-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            });
          }

          gsap.set('.stat-reveal', { opacity: 0, y: 40, rotateX: 16 });
          ScrollTrigger.batch('.stat-reveal', {
            start: 'top 85%',
            onEnter: (batch) =>
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: reduce ? 0 : 0.75,
                stagger: 0.11,
                ease: 'power2.out',
              }),
          });
        }
      );

      return () => mm.revert();
    },
    { scope: pageRef }
  );

  const handleFlavorSelect = contextSafe((quadrant: FlavorQuadrant) => {
    setActiveFlavor(quadrant);
    if (flavorShowcaseRef.current) {
      gsap.fromTo(
        flavorShowcaseRef.current.querySelectorAll('.flavor-pair-card'),
        { opacity: 0, y: 24, rotateX: 12 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.45, stagger: 0.08, ease: 'power3.out' }
      );
    }
  });

  const matchingCoffees = COFFEES.filter((c) => c.flavorQuadrant === activeFlavor).slice(0, 3);
  const activeQuadrantMeta = FLAVOR_QUADRANTS.find((q) => q.name === activeFlavor) || FLAVOR_QUADRANTS[0];

  const handleBookOmakase = (e: React.FormEvent) => {
    e.preventDefault();
    setOmakaseBooked(true);
    setTimeout(() => setOmakaseBooked(false), 4000);
  };

  return (
    <div ref={pageRef} className="relative bg-[#FAF7F2] text-[#23140D]">
      {/* FIRST HALF: 1,000-Frame Real Farm-to-Shop Commercial Video Scrubber */}
      <HeroFrameScrubber />

      {/* Organic Porcelain Wave Divider */}
      <div className="relative -mt-1 bg-[#23140D] overflow-hidden leading-none">
        <svg viewBox="0 0 1440 110" className="w-full h-14 sm:h-20 text-[#FAF7F2]" preserveAspectRatio="none">
          <path
            fill="currentColor"
            d="M0,36 C280,110 620,-8 960,64 C1180,104 1340,42 1440,54 L1440,110 L0,110 Z"
          />
        </svg>
      </div>

      {/* SECTION 2: 3D Horizontal-Scroll Barista Brew Lab (Warm White & Espresso) */}
      <section
        ref={horizontalWrapperRef}
        aria-label="Architectural Brew Systems Lab"
        className="relative bg-[#FAF7F2] min-h-screen flex flex-col justify-center overflow-hidden py-16"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-mono-telemetry text-xs tracking-[0.24em] text-[#B0672B] uppercase font-semibold block">
              02 // Architectural Brew Lab
            </span>
            <h2 className="font-display text-4xl sm:text-6xl text-[#23140D] font-semibold mt-2 leading-tight">
              Six Instruments of Extraction
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#23140D]/70 max-w-md">
            Scroll horizontally through every brew method poured inside our white-marble coffee shop—from 9-bar espresso to 280°C quartz sand cezve.
          </p>
        </div>

        <div
          ref={horizontalTrackRef}
          className="flex items-stretch gap-6 sm:gap-8 px-6 sm:px-12 will-change-transform w-max perspective-1200"
        >
          {BREW_SYSTEMS.map((sys, idx) => (
            <article
              key={sys.id}
              data-cursor="interactive"
              onClick={() => navigate(`/products/${sys.slug}`)}
              className="brew-card group w-[310px] sm:w-[390px] shrink-0 rounded-[32px] bg-white border border-[#23140D]/10 p-6 sm:p-7 flex flex-col justify-between hover:border-[#B0672B] hover:-translate-y-2 transition-all duration-300 cursor-pointer shadow-xl shadow-[#23140D]/5"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="font-mono-telemetry text-xs px-3 py-1 rounded-full bg-[#F2ECE1] text-[#23140D] font-semibold">
                    LAB 0{idx + 1}
                  </span>
                  <span className="font-mono-telemetry text-[11px] text-[#B0672B] font-medium">
                    {sys.spec}
                  </span>
                </div>

                <div className="my-4 h-44 rounded-2xl overflow-hidden bg-[#F2ECE1]">
                  <img
                    src={sys.photoUrl}
                    alt={sys.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <h3 className="font-display text-3xl font-semibold text-[#23140D] group-hover:text-[#B0672B] transition-colors">
                  {sys.title}
                </h3>
                <p className="text-sm text-[#23140D]/70 mt-2.5 leading-relaxed">
                  {sys.summary}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-[#23140D]/10 flex items-center justify-between text-xs font-mono-telemetry font-semibold text-[#23140D]">
                <span>INSPECT 3D RECIPE</span>
                <ArrowRight className="w-4 h-4 text-[#B0672B] group-hover:translate-x-1.5 transition-transform" />
              </div>
            </article>
          ))}

          {/* End Cap Card */}
          <div className="w-[290px] sm:w-[340px] shrink-0 rounded-[32px] bg-[#23140D] text-[#FAF7F2] p-8 flex flex-col justify-between shadow-2xl">
            <div>
              <span className="font-mono-telemetry text-xs tracking-[0.2em] uppercase text-[#E5A95C]">
                Complete Menu
              </span>
              <h3 className="font-display text-4xl mt-3 leading-tight font-semibold text-white">
                Every {COFFEES.length} Coffees Ready to Pour
              </h3>
              <p className="text-sm mt-4 text-white/75 leading-relaxed">
                Browse espresso classics, single-origin pour-overs, nitro cold drafts, and whole bean roastery bags.
              </p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="mt-8 w-full py-3.5 rounded-full bg-white text-[#23140D] font-semibold text-sm hover:bg-[#F2ECE1] transition-colors flex items-center justify-center gap-2"
            >
              <span>Open Full Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: Interactive Sensory Flavor Wheel & Pairings (Pure White) */}
      <section className="relative py-24 sm:py-32 px-6 sm:px-8 bg-white overflow-hidden border-y border-[#23140D]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
            <div>
              <span className="font-mono-telemetry text-xs tracking-[0.24em] text-[#B0672B] uppercase font-semibold block">
                03 // Sensory Palate Matrix
              </span>
              <h2 className="font-display text-4xl sm:text-6xl text-[#23140D] font-semibold mt-2">
                Dial Your Flavor Architecture
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#23140D]/70 max-w-md">
              Select any sensory quadrant of our tasting wheel to preview matching coffees across espresso, pour-over, cold brew, and heritage cups.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Interactive SVG Flavor Wheel */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[380px] aspect-square">
                <svg viewBox="0 0 360 360" className="w-full h-full drop-shadow-xl">
                  <circle cx="180" cy="180" r="168" fill="#FAF7F2" stroke="#23140D" strokeOpacity="0.12" />
                  {FLAVOR_QUADRANTS.map((quad) => {
                    const isSelected = quad.name === activeFlavor;
                    const path = describeAnnularSector(
                      180,
                      180,
                      isSelected ? 66 : 72,
                      isSelected ? 162 : 152,
                      quad.angleStart + 2,
                      quad.angleEnd - 2
                    );
                    const midAngle = (quad.angleStart + quad.angleEnd) / 2;
                    const labelPos = polarToCartesian(180, 180, 114, midAngle);
                    return (
                      <g
                        key={quad.name}
                        onClick={() => handleFlavorSelect(quad.name)}
                        className="cursor-pointer transition-all duration-300"
                      >
                        <path
                          d={path}
                          fill={quad.color}
                          fillOpacity={isSelected ? 1 : 0.65}
                          stroke={isSelected ? '#23140D' : '#FFFFFF'}
                          strokeWidth={isSelected ? 3 : 2}
                        />
                        <text
                          x={labelPos.x}
                          y={labelPos.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#FFFFFF"
                          fontSize="9.5"
                          fontWeight="700"
                          className="pointer-events-none select-none"
                        >
                          {quad.name.split(' & ')[0]}
                        </text>
                      </g>
                    );
                  })}
                  <circle cx="180" cy="180" r="62" fill="#23140D" />
                  <text
                    x="180"
                    y="174"
                    textAnchor="middle"
                    fill="#E5A95C"
                    fontSize="10"
                    fontFamily="var(--font-jetbrains), monospace"
                  >
                    SCA PALATE
                  </text>
                  <text
                    x="180"
                    y="194"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="15"
                    fontFamily="var(--font-cormorant), serif"
                    fontWeight="600"
                  >
                    {matchingCoffees[0]?.scaScore.toFixed(1)} PTS
                  </text>
                </svg>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {FLAVOR_QUADRANTS.map((q) => (
                  <button
                    key={q.name}
                    onClick={() => handleFlavorSelect(q.name)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeFlavor === q.name
                        ? 'bg-[#23140D] text-white font-semibold shadow-md'
                        : 'bg-[#FAF7F2] border border-[#23140D]/15 text-[#23140D]/80 hover:border-[#B0672B]'
                    }`}
                  >
                    {q.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Matching Coffee Cards */}
            <div ref={flavorShowcaseRef} className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#23140D]/10">
                <div>
                  <h3 className="font-display text-3xl font-semibold text-[#23140D]">{activeFlavor}</h3>
                  <p className="font-mono-telemetry text-xs text-[#B0672B] mt-1 font-medium">
                    {activeQuadrantMeta.notes}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/products')}
                  className="text-xs font-mono-telemetry font-semibold text-[#23140D] hover:text-[#B0672B] inline-flex items-center gap-1.5"
                >
                  <span>VIEW ALL {COFFEES.length} COFFEES</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 perspective-1200">
                {matchingCoffees.map((coffee) => (
                  <div
                    key={coffee.id}
                    className="flavor-pair-card rounded-3xl bg-[#FAF7F2] border border-[#23140D]/12 p-4 flex flex-col justify-between hover:border-[#B0672B] transition-colors shadow-sm"
                  >
                    <div>
                      <div className="h-36 mb-3 rounded-2xl overflow-hidden bg-[#F2ECE1]">
                        <img
                          src={coffee.photoUrl}
                          alt={coffee.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono-telemetry text-[#B0672B] font-semibold">
                        <span>{coffee.temperature}</span>
                        <span>SCA {coffee.scaScore.toFixed(1)}</span>
                      </div>
                      <h4 className="font-display text-xl font-semibold text-[#23140D] mt-1 leading-snug">
                        {coffee.name}
                      </h4>
                      <p className="text-xs text-[#23140D]/65 mt-1 line-clamp-2">
                        {coffee.flavorNotes.join(' · ')}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#23140D]/10 flex items-center justify-between gap-2">
                      <span className="font-mono-telemetry text-sm font-semibold text-[#23140D]">
                        ${coffee.price.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1.5">
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
                          className="px-3 py-1.5 rounded-full bg-[#23140D] text-white hover:bg-[#B0672B] text-[11px] font-semibold transition-colors"
                        >
                          + Tray
                        </button>
                        <button
                          onClick={() => navigate(`/products/${coffee.slug}`)}
                          className="px-3 py-1.5 rounded-full border border-[#23140D]/20 text-[11px] font-semibold text-[#23140D] hover:bg-white transition-colors"
                        >
                          3D Spec
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Multi-Speed Parallax Farm-to-Shop Architecture (Soft Latte & White) */}
      <section className="roastery-parallax-section relative bg-[#F2ECE1] text-[#23140D] py-28 sm:py-36 px-6 sm:px-8 overflow-hidden">
        <div
          aria-hidden="true"
          data-scroll
          data-scroll-speed="0.18"
          className="animate-float-a absolute top-24 right-12 w-40 h-40 rounded-full border border-[#23140D]/10 pointer-events-none"
        />
        <div
          aria-hidden="true"
          data-scroll
          data-scroll-speed="-0.15"
          className="animate-float-b absolute bottom-20 left-10 w-56 h-56 rounded-full bg-white/60 blur-2xl pointer-events-none"
        />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="font-mono-telemetry text-xs tracking-[0.24em] text-[#B0672B] uppercase font-semibold block">
              04 // Direct-Trade Architecture
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-semibold leading-[1.03] text-[#23140D]">
              Sculpted in White Marble, Driven by Coffee Science
            </h2>
            <p className="text-base sm:text-lg text-[#23140D]/75 leading-relaxed max-w-xl">
              Once roasted green lots arrive at our SoHo sanctuary, every drop passes through custom 75ppm remineralized water, optical refractometry, and pressure-profiled brass groupheads.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 perspective-1200">
              <div className="stat-reveal rounded-2xl bg-white border border-[#23140D]/10 p-5 shadow-sm">
                <Flame className="w-5 h-5 text-[#B0672B] mb-2" />
                <div className="font-mono-telemetry text-2xl font-semibold text-[#23140D]">204.5°C</div>
                <div className="text-xs text-[#23140D]/65 mt-1">Cast-Iron First Crack</div>
              </div>
              <div className="stat-reveal rounded-2xl bg-white border border-[#23140D]/10 p-5 shadow-sm">
                <Layers className="w-5 h-5 text-[#B0672B] mb-2" />
                <div className="font-mono-telemetry text-2xl font-semibold text-[#23140D]">75 PPM</div>
                <div className="text-xs text-[#23140D]/65 mt-1">Custom Buffer Water</div>
              </div>
              <div className="stat-reveal rounded-2xl bg-white border border-[#23140D]/10 p-5 shadow-sm">
                <Compass className="w-5 h-5 text-[#2D5A3F] mb-2" />
                <div className="font-mono-telemetry text-2xl font-semibold text-[#23140D]">6 Estates</div>
                <div className="text-xs text-[#23140D]/65 mt-1">100% Farm-Gate Traceable</div>
              </div>
              <div className="stat-reveal rounded-2xl bg-white border border-[#23140D]/10 p-5 shadow-sm">
                <Star className="w-5 h-5 text-[#B0672B] mb-2" />
                <div className="font-mono-telemetry text-2xl font-semibold text-[#23140D]">94.5 SCA</div>
                <div className="text-xs text-[#23140D]/65 mt-1">Competition Geisha Peak</div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigate('/about')}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#23140D] text-white font-semibold text-sm hover:bg-[#3A2218] transition-colors shadow-xl"
              >
                <span>Read Our Full Farm &amp; Roastery Story</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Multi-Speed Parallax Photo Arches */}
          <div className="lg:col-span-6 relative h-[460px] sm:h-[540px] flex items-center justify-center">
            <div className="parallax-slow absolute left-4 sm:left-8 top-6 w-56 sm:w-64 h-80 arch-mask bg-white p-3 flex flex-col justify-between shadow-2xl border border-[#23140D]/10">
              <div className="flex-1 rounded-t-full rounded-b-2xl overflow-hidden">
                <img src="/images/farm-mountains.jpg" alt="Coffee farm mountains" className="w-full h-full object-cover" />
              </div>
              <div className="pt-3 pb-1 px-2 text-center">
                <span className="font-mono-telemetry text-[10px] tracking-[0.18em] text-[#2D5A3F] font-semibold block">
                  YIRGACHEFFE // 2,100M
                </span>
                <span className="font-display text-lg font-semibold text-[#23140D]">Highland Origin Farm</span>
              </div>
            </div>

            <div className="parallax-fast relative z-10 w-64 sm:w-72 h-96 arch-mask overflow-hidden bg-[#23140D] text-white p-4 flex flex-col justify-between shadow-2xl border-4 border-white">
              <div className="flex-1 rounded-t-full rounded-b-2xl overflow-hidden bg-[#3A2218]">
                <img src="/images/coffee-shop.jpg" alt="Flagship barista coffee shop" className="w-full h-full object-cover" />
              </div>
              <div className="pt-3 pb-1 px-2 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 font-mono-telemetry text-[10px] tracking-[0.18em] text-[#E5A95C]">
                  <Coffee className="w-3.5 h-3.5" />
                  <span>ATELIER BAR · 9.0 BAR</span>
                </div>
                <p className="font-display text-2xl font-semibold leading-tight">
                  120-Frame Precision
                </p>
                <button
                  onClick={() => navigate('/products/doppio-obsidian-espresso')}
                  className="w-full py-2.5 rounded-full bg-white text-[#23140D] text-xs font-semibold hover:bg-[#F2ECE1] transition-colors"
                >
                  Inspect Signature Espresso
                </button>
              </div>
            </div>

            <div className="parallax-down hidden sm:flex absolute right-4 bottom-8 w-52 h-64 asymmetric-chamfer bg-[#2D5A3F] text-white p-5 flex-col justify-between shadow-xl">
              <span className="font-mono-telemetry text-[10px] tracking-[0.2em] opacity-85">
                WATER CHEMISTRY
              </span>
              <div>
                <div className="font-display text-3xl">GH 45</div>
                <div className="font-display text-3xl text-[#E5A95C]">KH 30</div>
              </div>
              <span className="text-xs opacity-90">Custom Reverse Osmosis Mineralization</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Interactive Barista Omakase & Closing CTA (Pure White) */}
      <section className="relative py-24 sm:py-32 px-6 sm:px-8 bg-white">
        <div className="max-w-5xl mx-auto relative z-10 rounded-[36px] bg-[#FAF7F2] p-8 sm:p-14 border border-[#23140D]/12 shadow-2xl shadow-[#23140D]/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="inline-flex items-center gap-2 font-mono-telemetry text-xs tracking-[0.22em] text-[#B0672B] uppercase font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>05 // Flagship Tasting Counter</span>
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold text-[#23140D] leading-tight">
                Reserve a 3-Course Coffee Omakase
              </h2>
              <p className="text-sm sm:text-base text-[#23140D]/70 leading-relaxed">
                Sit at our white marble sensory bar with Mateo or Kenji for a guided 45-minute flight: Panama Geisha via Chemex, 9-Bar Obsidian Ristretto, and Yuzu Botanical Tonic.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/products')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-[#23140D]/20 text-[#23140D] font-semibold text-sm hover:bg-[#F2ECE1] transition-colors"
                >
                  <span>Order Ahead Instead</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              {omakaseBooked ? (
                <div className="rounded-3xl bg-white border border-[#2D5A3F] p-8 text-center space-y-3 shadow-md">
                  <CalendarCheck className="w-10 h-10 text-[#2D5A3F] mx-auto" />
                  <h3 className="font-display text-3xl font-semibold text-[#23140D]">Seat Reserved at the Bar</h3>
                  <p className="text-sm text-[#23140D]/70">
                    We look forward to hosting {omakaseGuest || 'you'} on <span className="text-[#B0672B] font-semibold">{omakaseDate}</span> at 418 Mercer St.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookOmakase} className="rounded-3xl bg-white border border-[#23140D]/12 p-6 space-y-4 shadow-md">
                  <div>
                    <label htmlFor="guest-name" className="font-mono-telemetry text-[11px] uppercase tracking-wider text-[#B0672B] font-semibold block mb-1.5">
                      Guest Name
                    </label>
                    <input
                      id="guest-name"
                      type="text"
                      required
                      value={omakaseGuest}
                      onChange={(e) => setOmakaseGuest(e.target.value)}
                      placeholder="Your name for the tasting ledger"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#23140D]/15 text-sm text-[#23140D] focus:outline-none focus:border-[#23140D]"
                    />
                  </div>
                  <div>
                    <label htmlFor="tasting-slot" className="font-mono-telemetry text-[11px] uppercase tracking-wider text-[#B0672B] font-semibold block mb-1.5">
                      Select Tasting Session
                    </label>
                    <select
                      id="tasting-slot"
                      value={omakaseDate}
                      onChange={(e) => setOmakaseDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#23140D]/15 text-sm text-[#23140D] focus:outline-none focus:border-[#23140D]"
                    >
                      <option>Friday · 4:00 PM (Roastery Cupping)</option>
                      <option>Saturday · 11:00 AM</option>
                      <option>Saturday · 2:30 PM</option>
                      <option>Sunday · 11:00 AM</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-[#23140D] text-white font-semibold text-sm hover:bg-[#3A2218] transition-colors shadow-lg"
                  >
                    Reserve 3-Course Tasting ($38)
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
