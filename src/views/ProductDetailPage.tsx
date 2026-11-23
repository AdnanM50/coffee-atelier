'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Layers,
  Pause,
  Play,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Thermometer,
  Timer,
} from 'lucide-react';
import { COFFEES } from '../data/coffeeData';
import { CoffeeIllustration } from '../components/CoffeeIllustration';
import { useRouter } from '../context/RouterContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

interface ProductDetailPageProps {
  slug: string;
}

function SensoryRadarChart({
  profile,
}: {
  profile: { acidity: number; body: number; sweetness: number; bitterness: number; aroma: number };
}) {
  const axes = [
    { key: 'Aroma', val: profile.aroma },
    { key: 'Acidity', val: profile.acidity },
    { key: 'Sweetness', val: profile.sweetness },
    { key: 'Body', val: profile.body },
    { key: 'Bitterness', val: profile.bitterness },
  ];
  const cx = 150;
  const cy = 150;
  const maxR = 100;

  const getPoint = (idx: number, pct: number) => {
    const angle = (-90 + idx * 72) * (Math.PI / 180);
    const r = (pct / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const polyPoints = axes
    .map((a, idx) => {
      const pt = getPoint(idx, a.val);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[280px] mx-auto">
      {[25, 50, 75, 100].map((ring) => {
        const ringPts = axes
          .map((_, idx) => {
            const pt = getPoint(idx, ring);
            return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
          })
          .join(' ');
        return (
          <polygon
            key={ring}
            points={ringPts}
            fill="none"
            stroke="rgba(35,20,13,0.12)"
            strokeWidth="1"
          />
        );
      })}
      {axes.map((a, idx) => {
        const outer = getPoint(idx, 100);
        const label = getPoint(idx, 122);
        return (
          <g key={a.key}>
            <line
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(176,103,43,0.28)"
              strokeWidth="1"
            />
            <text
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#23140D"
              fontSize="10"
              fontWeight="600"
              fontFamily="var(--font-jetbrains), monospace"
            >
              {a.key}
            </text>
          </g>
        );
      })}
      <polygon
        points={polyPoints}
        fill="rgba(176, 103, 43, 0.25)"
        stroke="#23140D"
        strokeWidth="2.5"
      />
      {axes.map((a, idx) => {
        const pt = getPoint(idx, a.val);
        return <circle key={a.key} cx={pt.x} cy={pt.y} r="4.5" fill="#B0672B" stroke="#FFFFFF" strokeWidth="2" />;
      })}
    </svg>
  );
}

export function ProductDetailPage({ slug }: ProductDetailPageProps) {
  const { navigate, addToTray } = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const priceDisplayRef = useRef<HTMLSpanElement>(null);

  const coffee = useMemo(() => COFFEES.find((c) => c.slug === slug) || COFFEES[0], [slug]);
  const isBag = coffee.vesselType === 'bag';

  const [viewMode, setViewMode] = useState<'photo' | '3d' | 'exploded'>('photo');
  const [sizeOpt, setSizeOpt] = useState<'std' | 'reserve'>('std');
  const [milkOpt, setMilkOpt] = useState(
    isBag ? 'Whole Seed' : coffee.temperature === 'Iced' ? 'Barista Oat Milk' : 'Jersey Whole Milk'
  );
  const [extraShots, setExtraShots] = useState(0);
  const [grindOpt, setGrindOpt] = useState(
    isBag ? 'Whole Bean (Recommended)' : `${coffee.brewRecipe.grindMicrons}μm Atelier Calibrated`
  );
  const [addedFeedback, setAddedFeedback] = useState(false);

  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    setViewMode('photo');
    setSizeOpt('std');
    setExtraShots(0);
    setMilkOpt(
      coffee.vesselType === 'bag'
        ? 'Whole Seed'
        : coffee.temperature === 'Iced'
        ? 'Barista Oat Milk'
        : 'Jersey Whole Milk'
    );
    setGrindOpt(
      coffee.vesselType === 'bag'
        ? 'Whole Bean (Recommended)'
        : `${coffee.brewRecipe.grindMicrons}μm Atelier Calibrated`
    );
    setTimerRunning(false);
    setElapsedSec(0);
  }, [coffee]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setElapsedSec((prev) => {
        if (prev + 1 >= coffee.brewRecipe.totalTimeSec) {
          setTimerRunning(false);
          return coffee.brewRecipe.totalTimeSec;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, coffee.brewRecipe.totalTimeSec]);

  const computedPrice = useMemo(() => {
    const sizeUpcharge = sizeOpt === 'reserve' ? (isBag ? 42.0 : 1.75) : 0;
    const milkUpcharge = milkOpt === 'Barista Oat Milk' || milkOpt === 'Macadamia Velvet' ? 0.75 : 0;
    const shotUpcharge = extraShots * 1.5;
    return coffee.price + sizeUpcharge + milkUpcharge + shotUpcharge;
  }, [coffee.price, sizeOpt, isBag, milkOpt, extraShots]);

  const computedCaffeine = useMemo(() => {
    return coffee.caffeineMg + extraShots * 70 + (sizeOpt === 'reserve' && !isBag ? 45 : 0);
  }, [coffee.caffeineMg, extraShots, sizeOpt, isBag]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set('.detail-reveal', { opacity: 0, y: 28 });
        gsap.to('.detail-reveal', {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.09,
          ease: 'power3.out',
          clearProps: 'transform',
        });

        const noHover = window.matchMedia('(hover: none)').matches;
        const viewer = viewerRef.current;
        if (viewer && !noHover) {
          const rotY = gsap.quickTo(viewer, 'rotateY', { duration: 0.45, ease: 'power3.out' });
          const rotX = gsap.quickTo(viewer, 'rotateX', { duration: 0.45, ease: 'power3.out' });

          const onMove = (e: MouseEvent) => {
            const rect = viewer.getBoundingClientRect();
            const nx = (e.clientX - rect.left) / rect.width - 0.5;
            const ny = (e.clientY - rect.top) / rect.height - 0.5;
            rotY(nx * 20);
            rotX(-ny * 14);
          };

          const onLeave = () => {
            rotY(0);
            rotX(0);
          };

          viewer.addEventListener('mousemove', onMove);
          viewer.addEventListener('mouseleave', onLeave);
          return () => {
            viewer.removeEventListener('mousemove', onMove);
            viewer.removeEventListener('mouseleave', onLeave);
          };
        }
      });
      return () => mm.revert();
    },
    { scope: pageRef, dependencies: [coffee.slug] }
  );

  useGSAP(
    () => {
      if (!priceDisplayRef.current) return;
      gsap.fromTo(
        priceDisplayRef.current,
        { scale: 1.14, color: '#B0672B' },
        { scale: 1, color: '#23140D', duration: 0.35, ease: 'power2.out' }
      );
    },
    { dependencies: [computedPrice] }
  );

  const handleAddCustomBuild = () => {
    addToTray({
      coffee,
      quantity: 1,
      unitPrice: computedPrice,
      customization: {
        sizeLabel:
          sizeOpt === 'std'
            ? isBag
              ? '250g Roastery Bag'
              : 'Atelier Standard'
            : isBag
            ? '1kg Reserve Tin'
            : 'Large Double Vessel',
        milkOrBase: milkOpt,
        extraShots,
        grindLabel: grindOpt,
        originNote: coffee.origin.region,
        caffeineMg: computedCaffeine,
      },
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  const relatedCoffees = useMemo(() => {
    return COFFEES.filter((c) => c.id !== coffee.id)
      .sort((a, b) => (a.category === coffee.category ? -1 : 1) - (b.category === coffee.category ? -1 : 1))
      .slice(0, 3);
  }, [coffee]);

  const timerPct = Math.min(100, (elapsedSec / coffee.brewRecipe.totalTimeSec) * 100);
  const timerCircumference = 2 * Math.PI * 52;
  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <div ref={pageRef} className="min-h-screen bg-[#FAF7F2] text-[#23140D] pt-28 pb-24 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Top Back Breadcrumb */}
        <div className="detail-reveal flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 text-xs font-mono-telemetry font-semibold text-[#B0672B] hover:text-[#23140D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO ALL COFFEES</span>
          </button>

          <span className="font-mono-telemetry text-xs text-[#23140D]/60">
            {coffee.category.toUpperCase()} // SCA {coffee.scaScore.toFixed(1)}
          </span>
        </div>

        {/* Main 3D Cup Visualizer + Live Barista Customizer */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Interactive 3D Tilting Showcase + Photo + Exploded Layer Cutaway */}
          <div className="detail-reveal lg:col-span-6 space-y-5 perspective-1200">
            <div
              ref={viewerRef}
              className="preserve-3d relative rounded-[36px] bg-white border border-[#23140D]/12 p-7 sm:p-9 min-h-[460px] flex flex-col justify-between shadow-xl shadow-[#23140D]/5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono-telemetry text-[11px] px-3 py-1 rounded-full bg-[#F2ECE1] text-[#23140D] font-semibold">
                  {viewMode === 'exploded'
                    ? '3D ANATOMY CUTAWAY'
                    : viewMode === '3d'
                    ? '3D VESSEL MODEL'
                    : 'STUDIO PHOTOGRAPH'}
                </span>

                <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#23140D]/10 p-1 rounded-full">
                  <button
                    onClick={() => setViewMode('photo')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      viewMode === 'photo' ? 'bg-[#23140D] text-white' : 'text-[#23140D]/70 hover:text-[#23140D]'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Photo</span>
                  </button>
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      viewMode === '3d' ? 'bg-[#23140D] text-white' : 'text-[#23140D]/70 hover:text-[#23140D]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>3D Cup</span>
                  </button>
                  <button
                    onClick={() => setViewMode('exploded')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      viewMode === 'exploded' ? 'bg-[#B0672B] text-white' : 'text-[#23140D]/70 hover:text-[#23140D]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Explode 3D Layers</span>
                  </button>
                </div>
              </div>

              <div className="my-auto py-6">
                {viewMode === 'photo' ? (
                  <div className="h-72 rounded-2xl overflow-hidden bg-[#F2ECE1]">
                    <img
                      src={coffee.photoUrl}
                      alt={coffee.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <CoffeeIllustration
                    coffee={coffee}
                    exploded={viewMode === 'exploded'}
                    className={viewMode === 'exploded' ? 'mx-auto' : 'max-h-72 mx-auto'}
                  />
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#23140D]/10 text-center font-mono-telemetry">
                <div>
                  <span className="text-[10px] text-[#23140D]/55 block">DOSE / RATIO</span>
                  <span className="text-xs sm:text-sm font-semibold text-[#23140D]">
                    {coffee.brewRecipe.doseGrams}g / {coffee.brewRecipe.waterMl}ml
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#23140D]/55 block">BREW TEMP</span>
                  <span className="text-xs sm:text-sm font-semibold text-[#B0672B]">{coffee.brewRecipe.tempC}°C</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#23140D]/55 block">CAFFEINE</span>
                  <span className="text-xs sm:text-sm font-semibold text-[#23140D]">{computedCaffeine}mg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Barista Customizer Console */}
          <div className="detail-reveal lg:col-span-6 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {coffee.flavorNotes.map((note) => (
                  <span
                    key={note}
                    className="px-3 py-1 rounded-full bg-white border border-[#23140D]/15 text-xs font-medium text-[#23140D]"
                  >
                    {note}
                  </span>
                ))}
              </div>
              <h1 className="font-display text-4xl sm:text-6xl font-semibold text-[#23140D] leading-tight">
                {coffee.name}
              </h1>
              <p className="text-sm sm:text-base text-[#23140D]/75 mt-3 leading-relaxed">
                {coffee.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl bg-white border border-[#23140D]/12 p-4 text-xs shadow-sm">
              <div>
                <span className="font-mono-telemetry text-[10px] text-[#B0672B] font-semibold block">ORIGIN</span>
                <span className="text-[#23140D] font-semibold">{coffee.origin.country}</span>
              </div>
              <div>
                <span className="font-mono-telemetry text-[10px] text-[#B0672B] font-semibold block">ALTITUDE</span>
                <span className="text-[#23140D] font-semibold">{coffee.origin.altitude}</span>
              </div>
              <div>
                <span className="font-mono-telemetry text-[10px] text-[#B0672B] font-semibold block">VARIETAL</span>
                <span className="text-[#23140D] font-semibold">{coffee.origin.varietal}</span>
              </div>
              <div>
                <span className="font-mono-telemetry text-[10px] text-[#B0672B] font-semibold block">PROCESS</span>
                <span className="text-[#23140D] font-semibold">{coffee.origin.process}</span>
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-[#23140D]/12 p-6 space-y-5 shadow-lg shadow-[#23140D]/5">
              <div className="flex items-center justify-between">
                <span className="font-mono-telemetry text-xs tracking-wider text-[#B0672B] uppercase font-semibold">
                  Barista Calibration &amp; Build
                </span>
                <span ref={priceDisplayRef} className="font-mono-telemetry text-2xl font-semibold text-[#23140D]">
                  ${computedPrice.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#23140D]/80 block">
                  {isBag ? 'Bag Weight' : 'Vessel Size'}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSizeOpt('std')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-medium border transition-all ${
                      sizeOpt === 'std'
                        ? 'bg-[#23140D] text-white border-[#23140D] font-semibold'
                        : 'bg-[#FAF7F2] text-[#23140D]/80 border-[#23140D]/15'
                    }`}
                  >
                    {isBag ? '250g Roastery Bag' : 'Atelier Standard'}
                  </button>
                  <button
                    onClick={() => setSizeOpt('reserve')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-medium border transition-all ${
                      sizeOpt === 'reserve'
                        ? 'bg-[#23140D] text-white border-[#23140D] font-semibold'
                        : 'bg-[#FAF7F2] text-[#23140D]/80 border-[#23140D]/15'
                    }`}
                  >
                    {isBag ? '1kg Roaster Tin (+$42.00)' : 'Large Double (+$1.75)'}
                  </button>
                </div>
              </div>

              {isBag ? (
                <div className="space-y-2">
                  <label htmlFor="grind-select" className="text-xs font-semibold text-[#23140D]/80 block">
                    Precision Burr Grind Setting
                  </label>
                  <select
                    id="grind-select"
                    value={grindOpt}
                    onChange={(e) => setGrindOpt(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#23140D]/15 text-sm text-[#23140D] focus:outline-none focus:border-[#23140D]"
                  >
                    <option>Whole Bean (Recommended)</option>
                    <option>240μm — Home Espresso</option>
                    <option>620μm — Hario V60 / Filter</option>
                    <option>850μm — French Press / Cold Brew</option>
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="milk-select" className="text-xs font-semibold text-[#23140D]/80 block">
                      Milk / Base Emulsion
                    </label>
                    <select
                      id="milk-select"
                      value={milkOpt}
                      onChange={(e) => setMilkOpt(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#23140D]/15 text-xs text-[#23140D] focus:outline-none focus:border-[#23140D]"
                    >
                      <option>Jersey Whole Milk</option>
                      <option>Barista Oat Milk (+$0.75)</option>
                      <option>Macadamia Velvet (+$0.75)</option>
                      <option>Black / Pure Extraction</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#23140D]/80 block">
                      Extra Ristretto Shot (+$1.50 ea)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((shots) => (
                        <button
                          key={shots}
                          onClick={() => setExtraShots(shots)}
                          className={`py-2.5 rounded-xl text-xs font-mono-telemetry border transition-colors ${
                            extraShots === shots
                              ? 'bg-[#23140D] text-white border-[#23140D] font-semibold'
                              : 'bg-[#FAF7F2] text-[#23140D]/80 border-[#23140D]/15'
                          }`}
                        >
                          +{shots}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddCustomBuild}
                className="w-full py-4 rounded-full bg-[#23140D] text-white font-semibold text-sm hover:bg-[#3A2218] transition-colors flex items-center justify-center gap-2 shadow-xl"
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-[#E5A95C]" />
                    <span>Added Custom Build to Barista Tray</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#E5A95C]" />
                    <span>Add Custom Build to Barista Tray — ${computedPrice.toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Sensory Radar Chart + Interactive Live Brew Timer */}
        <section className="detail-reveal grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 rounded-[32px] bg-white border border-[#23140D]/12 p-7 flex flex-col justify-between shadow-lg shadow-[#23140D]/5">
            <div>
              <span className="font-mono-telemetry text-xs tracking-[0.2em] text-[#B0672B] uppercase font-semibold block">
                Sensory Telemetry
              </span>
              <h2 className="font-display text-3xl font-semibold text-[#23140D] mt-1">
                5-Axis Flavor Profile
              </h2>
            </div>

            <div className="my-6">
              <SensoryRadarChart profile={coffee.flavorProfile} />
            </div>

            <div className="grid grid-cols-5 gap-2 text-center font-mono-telemetry text-[11px] pt-4 border-t border-[#23140D]/10">
              <div>
                <span className="text-[#23140D]/55 block">ACID</span>
                <span className="text-[#B0672B] font-semibold">{coffee.flavorProfile.acidity}</span>
              </div>
              <div>
                <span className="text-[#23140D]/55 block">BODY</span>
                <span className="text-[#B0672B] font-semibold">{coffee.flavorProfile.body}</span>
              </div>
              <div>
                <span className="text-[#23140D]/55 block">SWEET</span>
                <span className="text-[#B0672B] font-semibold">{coffee.flavorProfile.sweetness}</span>
              </div>
              <div>
                <span className="text-[#23140D]/55 block">BITTER</span>
                <span className="text-[#B0672B] font-semibold">{coffee.flavorProfile.bitterness}</span>
              </div>
              <div>
                <span className="text-[#23140D]/55 block">AROMA</span>
                <span className="text-[#B0672B] font-semibold">{coffee.flavorProfile.aroma}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-[32px] bg-white border border-[#23140D]/12 p-7 sm:p-9 space-y-6 shadow-lg shadow-[#23140D]/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-mono-telemetry text-xs tracking-[0.2em] text-[#B0672B] uppercase font-semibold flex items-center gap-1.5">
                  <Timer className="w-4 h-4" />
                  <span>Interactive Barista Brew Timer</span>
                </span>
                <h2 className="font-display text-3xl font-semibold text-[#23140D] mt-1">
                  {coffee.brewRecipe.method}
                </h2>
              </div>

              <div className="flex items-center gap-2 font-mono-telemetry text-xs text-[#23140D]/75 font-medium">
                <Thermometer className="w-4 h-4 text-[#B0672B]" />
                <span>{coffee.brewRecipe.tempC}°C · {coffee.brewRecipe.grindMicrons}μm</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-4 flex flex-col items-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="rgba(35,20,13,0.1)"
                      strokeWidth="7"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="#B0672B"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={timerCircumference}
                      strokeDashoffset={timerCircumference * (1 - timerPct / 100)}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono-telemetry text-2xl text-[#23140D] font-semibold">
                      {formatTime(elapsedSec)}
                    </span>
                    <span className="font-mono-telemetry text-[10px] text-[#23140D]/55">
                      / {formatTime(coffee.brewRecipe.totalTimeSec)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => setTimerRunning((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#23140D] text-white text-xs font-semibold hover:bg-[#B0672B] transition-colors"
                  >
                    {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{timerRunning ? 'Pause' : elapsedSec > 0 ? 'Resume' : 'Start Extraction'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setTimerRunning(false);
                      setElapsedSec(0);
                    }}
                    aria-label="Reset brew timer"
                    className="w-8 h-8 rounded-full border border-[#23140D]/20 flex items-center justify-center hover:bg-[#FAF7F2]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="sm:col-span-8 space-y-3">
                {coffee.brewRecipe.steps.map((step) => {
                  const isActivePhase =
                    elapsedSec >= step.startSec &&
                    (elapsedSec < step.endSec ||
                      (elapsedSec === coffee.brewRecipe.totalTimeSec &&
                        step.endSec === coffee.brewRecipe.totalTimeSec));
                  const isDone = elapsedSec >= step.endSec && elapsedSec > 0;
                  return (
                    <div
                      key={step.timeRange}
                      className={`rounded-2xl p-4 border transition-all ${
                        isActivePhase
                          ? 'bg-[#F2ECE1] border-[#B0672B] shadow-md'
                          : isDone
                          ? 'bg-[#2D5A3F]/10 border-[#2D5A3F]/40'
                          : 'bg-[#FAF7F2] border-[#23140D]/10'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono-telemetry text-[11px]">
                        <span className="text-[#B0672B] font-semibold">
                          {step.timeRange}
                        </span>
                        {isActivePhase && <span className="text-[#23140D] font-semibold">ACTIVE PHASE</span>}
                        {!isActivePhase && isDone && <span className="text-[#2D5A3F] font-semibold">COMPLETE</span>}
                      </div>
                      <h3 className="font-display text-xl font-semibold text-[#23140D] mt-0.5">{step.title}</h3>
                      <p className="text-xs text-[#23140D]/75 mt-1 leading-relaxed">{step.instruction}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Complementary Coffee Pairings */}
        <section className="detail-reveal space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono-telemetry text-xs tracking-[0.2em] text-[#B0672B] uppercase font-semibold block">
                Curated Follow-Up
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#23140D] mt-1">
                Complementary Tasting Pairings
              </h2>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-xs font-mono-telemetry font-semibold text-[#23140D] hover:text-[#B0672B] hover:underline"
            >
              VIEW FULL CATALOG
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedCoffees.map((rel) => (
              <div
                key={rel.id}
                onClick={() => navigate(`/products/${rel.slug}`)}
                data-cursor="interactive"
                className="group rounded-3xl bg-white border border-[#23140D]/12 p-4 flex items-center gap-4 hover:border-[#B0672B] transition-colors cursor-pointer shadow-sm"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#F2ECE1] shrink-0">
                  <img src={rel.photoUrl} alt={rel.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-mono-telemetry text-[10px] text-[#B0672B] font-semibold block">
                    {rel.category}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-[#23140D] truncate group-hover:text-[#B0672B] transition-colors">
                    {rel.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2 text-xs font-mono-telemetry text-[#23140D]/70 font-medium">
                    <span>${rel.price.toFixed(2)}</span>
                    <span className="inline-flex items-center gap-1 text-[#B0672B]">
                      <Sparkles className="w-3 h-3" />
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
