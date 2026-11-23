'use client';

import { CoffeeItem } from '../data/coffeeData';

interface CoffeeIllustrationProps {
  coffee: CoffeeItem;
  exploded?: boolean;
  className?: string;
}

export function CoffeeIllustration({ coffee, exploded = false, className = '' }: CoffeeIllustrationProps) {
  const { vesselType, colorPalette, anatomyLayers } = coffee;

  if (exploded) {
    return (
      <div className={`relative w-full max-w-sm mx-auto py-4 space-y-3 ${className}`}>
        {anatomyLayers.map((layer, idx) => (
          <div
            key={layer.label}
            style={{
              backgroundColor: layer.color,
              color: layer.textColor || '#EFE7DA',
              transform: `translateZ(${(anatomyLayers.length - idx) * 20}px)`,
            }}
            className="rounded-2xl px-5 py-4 border border-white/15 shadow-xl transition-transform duration-500 flex items-center justify-between gap-4"
          >
            <div>
              <span className="font-mono-telemetry text-[10px] uppercase tracking-[0.2em] opacity-75 block">
                Stratum 0{idx + 1}
              </span>
              <span className="font-display text-xl font-semibold block">{layer.label}</span>
            </div>
            <span className="font-mono-telemetry text-xs px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-sm whitespace-nowrap">
              {layer.spec}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (vesselType === 'bag') {
    return (
      <svg viewBox="0 0 220 240" className={`w-full h-full drop-shadow-2xl ${className}`}>
        <defs>
          <linearGradient id={`bag-${coffee.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colorPalette.vessel} />
            <stop offset="100%" stopColor="#0B0806" />
          </linearGradient>
        </defs>
        <path
          d="M52 34 L168 34 L178 206 C178 214 170 220 162 220 L58 220 C50 220 42 214 42 206 Z"
          fill={`url(#bag-${coffee.id})`}
          stroke={colorPalette.accent}
          strokeWidth="2"
        />
        <rect x="52" y="22" width="116" height="16" rx="4" fill={colorPalette.accent} opacity="0.9" />
        <circle cx="110" cy="68" r="7" fill="#0B0806" stroke={colorPalette.crema} strokeWidth="2" />
        <rect x="64" y="96" width="92" height="86" rx="12" fill="#EFE7DA" opacity="0.95" />
        <rect x="74" y="108" width="72" height="5" rx="2.5" fill={colorPalette.liquid} />
        <circle cx="110" cy="142" r="18" fill={colorPalette.accent} opacity="0.22" />
        <ellipse cx="110" cy="142" rx="10" ry="14" fill={colorPalette.liquid} />
        <path d="M110 130 Q106 142 110 154" stroke="#EFE7DA" strokeWidth="1.5" fill="none" />
      </svg>
    );
  }

  if (vesselType === 'carafe') {
    return (
      <svg viewBox="0 0 220 240" className={`w-full h-full drop-shadow-2xl ${className}`}>
        <path
          d="M72 44 L148 44 L132 104 L162 184 C166 196 156 208 144 208 L76 208 C64 208 54 196 58 184 L88 104 Z"
          fill="rgba(239,231,218,0.08)"
          stroke="#EFE7DA"
          strokeOpacity="0.45"
          strokeWidth="2.5"
        />
        <path
          d="M72 145 L148 145 L159 183 C162 194 154 204 143 204 L77 204 C66 204 58 194 61 183 Z"
          fill={colorPalette.liquid}
        />
        <ellipse cx="110" cy="145" rx="38" ry="8" fill={colorPalette.crema} opacity="0.7" />
        <rect x="82" y="96" width="56" height="20" rx="5" fill="#7C4D2B" stroke="#C88A4B" strokeWidth="1.5" />
      </svg>
    );
  }

  if (vesselType === 'glass-tall') {
    return (
      <svg viewBox="0 0 220 240" className={`w-full h-full drop-shadow-2xl ${className}`}>
        <path
          d="M66 44 L154 44 L142 204 C141 212 135 216 128 216 L92 216 C85 216 79 212 78 204 Z"
          fill="rgba(255,255,255,0.07)"
          stroke="#EFE7DA"
          strokeOpacity="0.4"
          strokeWidth="2"
        />
        <path
          d="M72 92 L148 92 L140 198 C139 204 134 208 128 208 L92 208 C86 208 81 204 80 198 Z"
          fill={colorPalette.liquid}
        />
        <path d="M70 74 L150 74 L148 94 L72 94 Z" fill={colorPalette.crema} opacity="0.92" />
        <rect x="92" y="106" width="26" height="26" rx="5" transform="rotate(14 105 119)" fill="#EFE7DA" opacity="0.22" />
        <rect x="108" y="138" width="24" height="24" rx="5" transform="rotate(-12 120 150)" fill="#EFE7DA" opacity="0.18" />
      </svg>
    );
  }

  if (vesselType === 'cezve') {
    return (
      <svg viewBox="0 0 220 240" className={`w-full h-full drop-shadow-2xl ${className}`}>
        <path d="M138 112 L202 82" stroke="#B87333" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M74 90 L146 90 L158 186 C158 202 138 210 110 210 C82 210 62 202 62 186 Z"
          fill={colorPalette.vessel}
          stroke="#E5A95C"
          strokeWidth="2"
        />
        <ellipse cx="110" cy="90" rx="36" ry="12" fill={colorPalette.crema} />
        <ellipse cx="110" cy="88" rx="22" ry="7" fill={colorPalette.liquid} opacity="0.55" />
      </svg>
    );
  }

  // Default ceramic / demitasse architectural cup
  return (
    <svg viewBox="0 0 220 240" className={`w-full h-full drop-shadow-2xl ${className}`}>
      {/* Steam wisps */}
      <path
        d="M92 64 Q84 44 96 26"
        stroke="#EFE7DA"
        strokeOpacity="0.35"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        className="animate-steam"
      />
      <path
        d="M124 60 Q134 40 120 22"
        stroke="#EFE7DA"
        strokeOpacity="0.3"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        className="animate-steam"
      />
      {/* Saucer */}
      <ellipse cx="110" cy="192" rx="76" ry="16" fill="#2A1E16" stroke={colorPalette.accent} strokeOpacity="0.45" strokeWidth="1.5" />
      {/* Handle */}
      <path
        d="M162 106 C188 106 188 152 154 152"
        fill="none"
        stroke={colorPalette.vessel}
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Cup Body */}
      <path
        d="M54 92 L166 92 C164 166 142 190 110 190 C78 190 56 166 54 92 Z"
        fill={colorPalette.vessel}
        stroke={colorPalette.accent}
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      {/* Liquid & Crema Rim */}
      <ellipse cx="110" cy="92" rx="56" ry="18" fill={colorPalette.liquid} stroke={colorPalette.vessel} strokeWidth="3" />
      <ellipse cx="110" cy="92" rx="46" ry="13" fill={colorPalette.crema} opacity="0.88" />
      <path
        d="M84 92 Q110 82 136 92 Q110 102 84 92 Z"
        fill="#EFE7DA"
        opacity="0.38"
      />
    </svg>
  );
}
