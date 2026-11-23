'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Compass, Droplets, Flame, MapPin, Mountain, Sparkles } from 'lucide-react';
import { CONDUIT_PILLARS, MASTER_BARISTAS, PARTNER_ESTATES } from '../data/aboutData';
import { useRouter } from '../context/RouterContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function AboutPage() {
  const { navigate } = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const conduitPathRef = useRef<SVGPathElement>(null);
  const estateCardRef = useRef<HTMLDivElement>(null);

  const [activeEstateIdx, setActiveEstateIdx] = useState(0);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
          noHover: '(hover: none)',
          desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const reduce = context.conditions?.reduceMotion;
          const noHover = context.conditions?.noHover;

          gsap.set(['.about-eyebrow', '.about-h1', '.about-sub', '.about-cta', '.about-arch'], {
            opacity: 0,
            y: 30,
          });

          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
          tl.to('.about-eyebrow', { opacity: 1, y: 0, duration: reduce ? 0 : 0.6 })
            .to('.about-h1', { opacity: 1, y: 0, duration: reduce ? 0 : 0.8 }, '-=0.3')
            .to('.about-sub', { opacity: 1, y: 0, duration: reduce ? 0 : 0.6 }, '-=0.5')
            .to('.about-cta', { opacity: 1, y: 0, duration: reduce ? 0 : 0.5 }, '-=0.3')
            .to('.about-arch', { opacity: 1, y: 0, duration: reduce ? 0 : 0.7 }, '-=0.5');

          if (!noHover && !reduce && heroRef.current) {
            const xBack = gsap.quickTo('.about-parallax-back', 'x', { duration: 0.8, ease: 'power3.out' });
            const yBack = gsap.quickTo('.about-parallax-back', 'y', { duration: 0.8, ease: 'power3.out' });
            const xMid = gsap.quickTo('.about-parallax-mid', 'x', { duration: 0.8, ease: 'power3.out' });
            const yMid = gsap.quickTo('.about-parallax-mid', 'y', { duration: 0.8, ease: 'power3.out' });
            const xFront = gsap.quickTo('.about-parallax-front', 'x', { duration: 0.8, ease: 'power3.out' });
            const yFront = gsap.quickTo('.about-parallax-front', 'y', { duration: 0.8, ease: 'power3.out' });

            const onMove = (e: MouseEvent) => {
              const nx = (e.clientX / window.innerWidth - 0.5) * 2;
              const ny = (e.clientY / window.innerHeight - 0.5) * 2;
              xBack(nx * 45);
              yBack(ny * 22);
              xMid(nx * 22);
              yMid(ny * 11);
              xFront(nx * 8);
              yFront(ny * 5);
            };

            const el = heroRef.current;
            el.addEventListener('mousemove', onMove);
            return () => el.removeEventListener('mousemove', onMove);
          }
        }
      );

      const path = conduitPathRef.current;
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: '.conduit-section',
            start: 'top 65%',
            end: 'bottom 75%',
            scrub: 0.8,
          },
        });
      }

      gsap.set(['.pillar-card', '.barista-card'], { opacity: 0, y: 45, rotateX: 16 });
      ScrollTrigger.batch(['.pillar-card', '.barista-card'], {
        start: 'top 84%',
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.75,
            stagger: 0.11,
            ease: 'power2.out',
          }),
      });

      return () => mm.revert();
    },
    { scope: pageRef }
  );

  const handleSelectEstate = contextSafe((idx: number) => {
    setActiveEstateIdx(idx);
    if (estateCardRef.current) {
      gsap.fromTo(
        estateCardRef.current,
        { opacity: 0.25, y: 18, rotateX: 8 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.45, ease: 'power3.out' }
      );
    }
  });

  const activeEstate = PARTNER_ESTATES[activeEstateIdx];

  return (
    <div ref={pageRef} className="bg-[#FAF7F2] text-[#23140D] pt-24">
      {/* SECTION 1: 3D Mouse-Parallax Editorial Hero */}
      <section
        ref={heroRef}
        className="relative min-h-[88vh] flex items-center py-16 px-6 sm:px-8 overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="about-parallax-back absolute inset-0 pointer-events-none flex items-center justify-center"
        >
          <div className="animate-float-a absolute -top-12 right-12 w-80 h-80 rounded-full bg-[#C87D3B]/15 blur-3xl" />
          <div className="animate-float-b absolute bottom-8 left-12 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>

        <div
          aria-hidden="true"
          data-scroll
          data-scroll-speed="0.16"
          className="about-parallax-mid absolute right-10 top-1/4 w-72 h-72 rounded-full border border-[#23140D]/10 pointer-events-none hidden lg:block"
        />

        <div className="about-parallax-front max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="about-eyebrow inline-flex items-center gap-2 font-mono-telemetry text-xs tracking-[0.24em] text-[#B0672B] uppercase font-semibold">
              <Compass className="w-4 h-4" />
              <span>Atelier Manifesto // Seed to Cup Architecture</span>
            </span>

            <h1 className="about-h1 font-display text-5xl sm:text-7xl leading-[0.96] font-semibold text-[#23140D]">
              Where Volcanic Soil Meets Cast-Iron Physics
            </h1>

            <p className="about-sub text-base sm:text-lg text-[#23140D]/75 leading-relaxed max-w-2xl">
              Founded in 2019 on Mercer Street, Aether &amp; Crema operates as both a sunlit white-marble espresso sanctuary and a thermodynamic roasting laboratory—tracing every single micro-lot directly back to six high-altitude farming families.
            </p>

            <div className="about-cta flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#23140D] text-white font-semibold text-sm hover:bg-[#3A2218] transition-colors shadow-xl"
              >
                <span>Taste Our Current Lots</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/', { scrollToTarget: 'story-scrubber' })}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white border border-[#23140D]/20 text-[#23140D] font-semibold text-sm hover:bg-[#F2ECE1] transition-colors shadow-sm"
              >
                <span>Watch 120-Frame Film</span>
              </button>
            </div>
          </div>

          {/* Arched White Frame with Real Roastery Photo */}
          <div className="about-arch lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm h-[450px] arch-mask bg-white text-[#23140D] p-5 flex flex-col justify-between shadow-2xl border border-[#23140D]/10">
              <div className="flex items-center justify-between font-mono-telemetry text-[11px] text-[#B0672B] font-semibold px-3 pt-2">
                <span>EST. 2019 // SOHO</span>
                <span>ROAST LOG #482</span>
              </div>

              <div className="flex-1 my-3 rounded-t-full rounded-b-2xl overflow-hidden bg-[#F2ECE1]">
                <img
                  src="/images/roaster.jpg"
                  alt="Cast-iron drum coffee roaster"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="px-2 pb-1 text-center space-y-1">
                <p className="font-display text-2xl font-semibold leading-tight text-[#23140D]">
                  850+ Aromatic Compounds
                </p>
                <div className="pt-2 border-t border-[#23140D]/10 flex items-center justify-between font-mono-telemetry text-[11px]">
                  <span>DIRECT TRADE</span>
                  <span className="text-[#2D5A3F] font-semibold">100% VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Scroll-Scrubbed SVG Roastery & Supply-Chain Conduit (Pure White) */}
      <section className="conduit-section relative py-24 sm:py-32 px-6 sm:px-8 bg-white border-y border-[#23140D]/10 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="font-mono-telemetry text-xs tracking-[0.24em] text-[#B0672B] uppercase font-semibold">
              02 // Supply-Chain Conduit
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-semibold text-[#23140D]">
              Four Pillars of Extraction Integrity
            </h2>
          </div>

          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 120 800"
              className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 h-full w-24 pointer-events-none"
              preserveAspectRatio="none"
            >
              <path
                d="M60 0 C110 140, 10 260, 60 400 C110 540, 10 660, 60 800"
                stroke="rgba(35,20,13,0.12)"
                strokeWidth="3"
                fill="none"
              />
              <path
                ref={conduitPathRef}
                d="M60 0 C110 140, 10 260, 60 400 C110 540, 10 660, 60 800"
                stroke="#B0672B"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <div className="space-y-12 md:space-y-16 perspective-1200">
              {CONDUIT_PILLARS.map((pillar, idx) => {
                const isLeft = idx % 2 === 0;
                return (
                  <div
                    key={pillar.step}
                    className="grid grid-cols-1 md:grid-cols-12 items-center gap-6"
                  >
                    <div
                      className={`pillar-card md:col-span-5 ${
                        isLeft ? 'md:col-start-1' : 'md:col-start-8'
                      } rounded-3xl bg-[#FAF7F2] border border-[#23140D]/12 p-7 space-y-3 shadow-lg`}
                    >
                      <div className="flex items-center justify-between font-mono-telemetry text-xs">
                        <span className="text-[#B0672B] font-semibold">PILLAR {pillar.step}</span>
                        <span className="text-[#23140D]/60">{pillar.metric}</span>
                      </div>
                      <h3 className="font-display text-3xl font-semibold text-[#23140D] leading-snug">
                        {pillar.title}
                      </h3>
                      <p className="text-sm text-[#23140D]/75 leading-relaxed">{pillar.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Interactive Global Terroir & Farm Cooperative Atlas */}
      <section className="py-24 sm:py-32 px-6 sm:px-8 bg-[#FAF7F2] text-[#23140D]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
            <div>
              <span className="font-mono-telemetry text-xs tracking-[0.24em] text-[#B0672B] uppercase font-semibold block">
                03 // Global Terroir Atlas
              </span>
              <h2 className="font-display text-4xl sm:text-6xl font-semibold text-[#23140D] mt-2">
                Six Partner Estates &amp; Cooperatives
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#23140D]/70 max-w-md">
              Select a producing micro-region to inspect altitude contours, harvest seasons, farm photography, and the coffees we roast from each partner farm.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-3">
              {PARTNER_ESTATES.map((estate, idx) => {
                const active = idx === activeEstateIdx;
                return (
                  <button
                    key={estate.slug}
                    onClick={() => handleSelectEstate(idx)}
                    className={`w-full text-left rounded-2xl p-5 transition-all duration-300 border ${
                      active
                        ? 'bg-[#23140D] text-white border-[#23140D] shadow-xl translate-x-1'
                        : 'bg-white text-[#23140D] border-[#23140D]/10 hover:border-[#B0672B]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono-telemetry text-[11px]">
                      <span className={active ? 'text-[#E5A95C]' : 'text-[#B0672B] font-semibold'}>
                        {estate.country.toUpperCase()}
                      </span>
                      <span className="opacity-70">{estate.elevation}</span>
                    </div>
                    <div className="font-display text-2xl font-semibold mt-1">{estate.name}</div>
                    <div className={`text-xs mt-0.5 ${active ? 'text-white/75' : 'text-[#23140D]/65'}`}>
                      {estate.region}
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              ref={estateCardRef}
              className="lg:col-span-7 rounded-[32px] bg-white text-[#23140D] p-7 sm:p-10 border border-[#23140D]/12 shadow-2xl space-y-6"
            >
              <div className="h-52 sm:h-60 rounded-2xl overflow-hidden bg-[#F2ECE1]">
                <img
                  src={activeEstate.photoUrl}
                  alt={activeEstate.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 font-mono-telemetry text-xs text-[#B0672B] font-semibold">
                  <MapPin className="w-4 h-4" />
                  <span>{activeEstate.coordinates}</span>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-[#2D5A3F]/10 border border-[#2D5A3F]/30 font-mono-telemetry text-xs text-[#2D5A3F] font-semibold">
                  HARVEST: {activeEstate.harvestWindow}
                </span>
              </div>

              <div>
                <h3 className="font-display text-4xl sm:text-5xl font-semibold text-[#23140D]">
                  {activeEstate.name}
                </h3>
                <p className="text-sm sm:text-base text-[#23140D]/75 mt-3 leading-relaxed">
                  {activeEstate.story}
                </p>
              </div>

              <div className="rounded-2xl bg-[#FAF7F2] border border-[#23140D]/10 p-5">
                <div className="flex items-center justify-between text-[11px] font-mono-telemetry text-[#B0672B] font-semibold mb-3">
                  <span className="inline-flex items-center gap-1.5">
                    <Mountain className="w-4 h-4" /> TERROIR ELEVATION PROFILE
                  </span>
                  <span>{activeEstate.elevation}</span>
                </div>
                <svg viewBox="0 0 600 100" className="w-full h-20">
                  <defs>
                    <linearGradient id="ridgeGradWhite" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B0672B" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#B0672B" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 95 Q120 65 210 42 T380 22 T510 52 L600 78 L600 100 L0 100 Z"
                    fill="url(#ridgeGradWhite)"
                  />
                  <path
                    d="M0 95 Q120 65 210 42 T380 22 T510 52 L600 78"
                    fill="none"
                    stroke="#23140D"
                    strokeWidth="2.5"
                  />
                  <circle cx="380" cy="22" r="5.5" fill="#B0672B" />
                </svg>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl bg-[#FAF7F2] p-4 border border-[#23140D]/10">
                  <span className="font-mono-telemetry text-[10px] uppercase tracking-wider text-[#B0672B] font-semibold block">
                    Varietal Genetics
                  </span>
                  <span className="text-[#23140D] font-medium mt-1 block">{activeEstate.varietals}</span>
                </div>
                <div className="rounded-2xl bg-[#FAF7F2] p-4 border border-[#23140D]/10">
                  <span className="font-mono-telemetry text-[10px] uppercase tracking-wider text-[#B0672B] font-semibold block">
                    Fermentation &amp; Drying
                  </span>
                  <span className="text-[#23140D] font-medium mt-1 block">{activeEstate.processSignature}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate(`/products/${activeEstate.linkedCoffeeSlug}`)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#23140D] text-white font-semibold text-sm hover:bg-[#3A2218] transition-colors shadow-lg"
                >
                  <Sparkles className="w-4 h-4 text-[#E5A95C]" />
                  <span>Taste Signature Coffee From This Farm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: The Master Baristas & Sensory Lab (Pure White) */}
      <section className="py-24 sm:py-32 px-6 sm:px-8 bg-white border-t border-[#23140D]/10">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14 space-y-3">
            <span className="font-mono-telemetry text-xs tracking-[0.24em] text-[#B0672B] uppercase font-semibold block">
              04 // Sensory Lab Team
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-semibold text-[#23140D]">
              Architects Behind the Bar
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 perspective-1200">
            {MASTER_BARISTAS.map((person, idx) => (
              <article
                key={person.name}
                className="barista-card group rounded-3xl bg-[#FAF7F2] border border-[#23140D]/12 p-7 flex flex-col justify-between hover:border-[#B0672B] transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 arch-mask bg-[#23140D] text-[#E5A95C] flex items-center justify-center font-display text-2xl font-semibold">
                      {person.initials}
                    </div>
                    <span className="font-mono-telemetry text-[11px] px-3 py-1 rounded-full bg-white border border-[#23140D]/10 text-[#B0672B] font-semibold">
                      {idx === 0 ? <Flame className="w-3.5 h-3.5 inline mr-1" /> : <Droplets className="w-3.5 h-3.5 inline mr-1" />}
                      {person.accolade}
                    </span>
                  </div>

                  <h3 className="font-display text-3xl font-semibold text-[#23140D]">{person.name}</h3>
                  <p className="font-mono-telemetry text-xs text-[#B0672B] font-semibold mt-1 uppercase tracking-wider">
                    {person.role}
                  </p>
                  <p className="text-sm text-[#23140D]/75 mt-4 leading-relaxed">
                    <strong className="text-[#23140D] font-semibold">Focus:</strong> {person.specialty}
                  </p>
                  <p className="text-xs text-[#23140D]/65 mt-3 italic border-l-2 border-[#B0672B] pl-3">
                    “{person.recipeNote}”
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/products/${person.favoriteSlug}`)}
                  className="mt-6 pt-4 border-t border-[#23140D]/10 w-full flex items-center justify-between text-xs font-mono-telemetry font-semibold text-[#23140D] hover:text-[#B0672B] transition-colors"
                >
                  <span>BREW SIGNATURE CUP</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
