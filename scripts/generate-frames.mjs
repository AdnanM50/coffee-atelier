import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve(process.cwd(), 'public', 'frames');
fs.mkdirSync(OUT_DIR, { recursive: true });

const TOTAL_FRAMES = 150;
const FPS = 24;

const CHAPTERS = [
  {
    id: 1,
    start: 1,
    end: 30,
    slug: 'botanical-origin',
    title: 'Botanical Origin & Cloud Forest Growth',
    metric: '1,950m ASL',
    palette: { skyTop: '#0E1C17', skyBot: '#1B2E24', accent: '#A62B2B', glow: '#4E7A5B' },
  },
  {
    id: 2,
    start: 31,
    end: 60,
    slug: 'harvest-fermentation',
    title: 'Harvest & Honey/Washed Fermentation',
    metric: '11.2% H2O',
    palette: { skyTop: '#1A140E', skyBot: '#2D2115', accent: '#D8823B', glow: '#8AA37B' },
  },
  {
    id: 3,
    start: 61,
    end: 90,
    slug: 'drum-roasting',
    title: 'Cast-Iron Drum Roasting & First Crack',
    metric: '204.5°C ROAST',
    palette: { skyTop: '#140906', skyBot: '#2A120A', accent: '#E57C35', glow: '#FF9D42' },
  },
  {
    id: 4,
    start: 91,
    end: 120,
    slug: 'precision-extraction',
    title: 'Precision Conical Grinding & 9-Bar Extraction',
    metric: '9.0 BAR / 93°C',
    palette: { skyTop: '#0B0806', skyBot: '#1F150E', accent: '#C88A4B', glow: '#E5A95C' },
  },
  {
    id: 5,
    start: 121,
    end: 150,
    slug: 'barista-sanctuary',
    title: 'Arrival at the Flagship Barista Sanctuary',
    metric: '62.0°C SERVE',
    palette: { skyTop: '#0E0A08', skyBot: '#241A13', accent: '#EFE7DA', glow: '#C88A4B' },
  },
];

function pad4(n) {
  return String(n).padStart(4, '0');
}

function toSMPTE(frame) {
  const f = frame - 1;
  const secs = Math.floor(f / FPS);
  const remFrames = f % FPS;
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  return `00:${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}:${String(remFrames).padStart(2, '0')}`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function buildFrameSvg(frameNum) {
  const chapter = CHAPTERS.find((c) => frameNum >= c.start && frameNum <= c.end) || CHAPTERS[0];
  const localT = (frameNum - chapter.start) / (chapter.end - chapter.start);
  const globalT = (frameNum - 1) / (TOTAL_FRAMES - 1);
  const { skyTop, skyBot, accent, glow } = chapter.palette;

  let subjectSvg = '';

  if (chapter.id === 1) {
    // Cloud forest ridges, rising sun & ripening cherries
    const sunY = lerp(520, 310, localT).toFixed(1);
    const branchRot = lerp(-6, 2, localT).toFixed(2);
    const cherryR = lerp(18, 28, localT).toFixed(1);
    const mistShift = lerp(-80, 80, localT).toFixed(1);
    subjectSvg = `
      <circle cx="960" cy="${sunY}" r="140" fill="${glow}" opacity="0.24" />
      <path d="M0 780 Q320 620 640 700 T1280 650 T1920 740 L1920 1080 L0 1080 Z" fill="#13221A" opacity="0.9" />
      <path d="M0 860 Q480 730 960 820 T1920 790 L1920 1080 L0 1080 Z" fill="#0B140F" />
      <ellipse cx="${960 + Number(mistShift)}" cy="690" rx="680" ry="70" fill="#EFE7DA" opacity="0.06" />
      <g transform="translate(960, 480) rotate(${branchRot})">
        <path d="M-420 -80 Q-120 -20 340 40" stroke="#3B2B1E" stroke-width="14" fill="none" stroke-linecap="round" />
        <ellipse cx="-160" cy="-95" rx="75" ry="30" transform="rotate(-28 -160 -95)" fill="#2D4A36" />
        <ellipse cx="140" cy="-35" rx="82" ry="32" transform="rotate(18 140 -35)" fill="#3D5A45" />
        <circle cx="-110" cy="18" r="${cherryR}" fill="${accent}" />
        <circle cx="-40" cy="34" r="${Number(cherryR) + 3}" fill="#C0392B" />
        <circle cx="35" cy="24" r="${cherryR}" fill="${accent}" />
        <circle cx="110" cy="48" r="${Number(cherryR) - 2}" fill="#8B1E1E" />
      </g>`;
  } else if (chapter.id === 2) {
    // Raised drying beds, water wash wave, green-to-parchment beans
    const waveOffset = lerp(0, 220, localT).toFixed(1);
    const beanScale = lerp(0.9, 1.18, localT).toFixed(3);
    subjectSvg = `
      <path d="M0 ${700 - Number(waveOffset) * 0.2} Q480 640 960 710 T1920 680 L1920 1080 L0 1080 Z" fill="#2A1D13" />
      <line x1="220" y1="680" x2="1700" y2="680" stroke="#8C6239" stroke-width="4" opacity="0.5" />
      <g transform="translate(960, 500) scale(${beanScale})">
        <ellipse cx="-190" cy="20" rx="54" ry="76" transform="rotate(-18 -190 20)" fill="#8AA37B" stroke="#EFE7DA" stroke-opacity="0.2" stroke-width="2" />
        <path d="M-195 -40 Q-170 20 -195 80" stroke="#4D6641" stroke-width="4" fill="none" />
        <ellipse cx="0" cy="-10" rx="64" ry="88" transform="rotate(6 0 -10)" fill="#C9A875" stroke="#EFE7DA" stroke-opacity="0.25" stroke-width="2" />
        <path d="M-4 -80 Q18 -10 -4 62" stroke="#785B35" stroke-width="5" fill="none" />
        <ellipse cx="195" cy="24" rx="54" ry="76" transform="rotate(22 195 24)" fill="#A67647" stroke="#EFE7DA" stroke-opacity="0.2" stroke-width="2" />
        <path d="M192 -35 Q214 24 192 84" stroke="#5C3B1E" stroke-width="4" fill="none" />
      </g>`;
  } else if (chapter.id === 3) {
    // Cast iron drum roaster & rotating caramelized beans
    const drumAngle = lerp(0, 360, localT).toFixed(1);
    const glowR = lerp(180, 310, localT).toFixed(1);
    subjectSvg = `
      <circle cx="960" cy="520" r="${glowR}" fill="${glow}" opacity="0.18" />
      <g transform="translate(960, 520)">
        <circle cx="0" cy="0" r="245" fill="none" stroke="#C88A4B" stroke-width="3" stroke-dasharray="18 12" opacity="0.6" transform="rotate(${drumAngle})" />
        <circle cx="0" cy="0" r="195" fill="#1C0D08" stroke="#E57C35" stroke-width="5" />
        <g transform="rotate(${Number(drumAngle) * 0.6})">
          <ellipse cx="-70" cy="-40" rx="34" ry="48" transform="rotate(-24 -70 -40)" fill="#4A2715" />
          <path d="M-74 -75 Q-56 -40 -74 -5" stroke="#1E0E07" stroke-width="4" fill="none" />
          <ellipse cx="68" cy="-25" rx="36" ry="50" transform="rotate(19 68 -25)" fill="#5C311B" />
          <path d="M66 -62 Q82 -25 66 12" stroke="#261209" stroke-width="4" fill="none" />
          <ellipse cx="0" cy="68" rx="38" ry="52" transform="rotate(-8 0 68)" fill="#3B1E10" />
          <path d="M-2 28 Q14 68 -2 108" stroke="#140905" stroke-width="4" fill="none" />
        </g>
      </g>`;
  } else if (chapter.id === 4) {
    // Portafilter & 9-bar espresso liquid extraction stream
    const streamH = lerp(60, 320, localT).toFixed(1);
    const cupFill = lerp(0, 100, localT).toFixed(1);
    subjectSvg = `
      <g transform="translate(960, 300)">
        <rect x="-140" y="-40" width="280" height="58" rx="12" fill="#2A2019" stroke="#C88A4B" stroke-width="2" />
        <rect x="140" y="-22" width="240" height="24" rx="12" fill="#1B130E" stroke="#5A4534" stroke-width="2" />
        <path d="M-28 18 Q-14 ${Number(streamH) * 0.5} 0 ${streamH}" stroke="#C88A4B" stroke-width="11" fill="none" stroke-linecap="round" />
        <path d="M28 18 Q14 ${Number(streamH) * 0.5} 0 ${streamH}" stroke="#E5A95C" stroke-width="8" fill="none" stroke-linecap="round" />
        <ellipse cx="0" cy="360" rx="135" ry="34" fill="#1D140F" stroke="#EFE7DA" stroke-opacity="0.3" stroke-width="2" />
        <path d="M-135 360 Q-115 510 0 510 Q115 510 135 360 Z" fill="#EFE7DA" opacity="0.92" />
        <ellipse cx="0" cy="360" rx="120" ry="26" fill="#C88A4B" opacity="${(0.4 + Number(cupFill) * 0.006).toFixed(2)}" />
      </g>`;
  } else {
    // Flagship store latte rosetta & ceramic vessel on travertine
    const foamProgress = lerp(0.3, 1.0, localT).toFixed(2);
    const steamY = lerp(0, -45, localT).toFixed(1);
    subjectSvg = `
      <rect x="0" y="720" width="1920" height="360" fill="#261C15" />
      <g transform="translate(960, 560)">
        <ellipse cx="0" cy="140" rx="260" ry="52" fill="#3B2E24" opacity="0.65" />
        <path d="M-190 -40 Q-175 160 0 160 Q175 160 190 -40 Z" fill="#EFE7DA" />
        <ellipse cx="0" cy="-40" rx="190" ry="48" fill="#5D3A21" stroke="#EFE7DA" stroke-width="6" />
        <g opacity="${foamProgress}" transform="scale(${foamProgress})">
          <ellipse cx="0" cy="-40" rx="95" ry="26" fill="#F7EFE2" />
          <path d="M-55 -40 Q0 -58 55 -40 Q0 -22 -55 -40 Z" fill="#C88A4B" opacity="0.7" />
        </g>
        <g transform="translate(0, ${steamY})" opacity="0.32">
          <path d="M-45 -110 Q-65 -170 -35 -230" stroke="#EFE7DA" stroke-width="4" fill="none" stroke-linecap="round" />
          <path d="M15 -120 Q40 -180 10 -245" stroke="#EFE7DA" stroke-width="4" fill="none" stroke-linecap="round" />
        </g>
      </g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${skyTop}" />
      <stop offset="100%" stop-color="${skyBot}" />
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="65%">
      <stop offset="55%" stop-color="transparent" />
      <stop offset="100%" stop-color="#0B0806" stop-opacity="0.82" />
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#bg)" />
  ${subjectSvg}
  <rect width="1920" height="1080" fill="url(#vignette)" />
  <text x="80" y="1020" fill="#EFE7DA" fill-opacity="0.35" font-family="monospace" font-size="22" letter-spacing="4">AETHER &amp; CREMA // FRAME ${pad4(frameNum)}/${TOTAL_FRAMES} // ${toSMPTE(frameNum)} // ${chapter.metric}</text>
  <rect x="80" y="1042" width="${Math.round(1760 * globalT)}" height="3" fill="${accent}" opacity="0.7" />
</svg>`;
}

const manifest = {
  fps: FPS,
  totalFrames: TOTAL_FRAMES,
  chapters: CHAPTERS,
  frames: [],
};

for (let i = 1; i <= TOTAL_FRAMES; i++) {
  const filename = `frame_${pad4(i)}.svg`;
  const filePath = path.join(OUT_DIR, filename);
  fs.writeFileSync(filePath, buildFrameSvg(i), 'utf8');
  const chapter = CHAPTERS.find((c) => i >= c.start && i <= c.end) || CHAPTERS[0];
  manifest.frames.push({
    frame: i,
    file: `/frames/${filename}`,
    smpte: toSMPTE(i),
    chapterId: chapter.id,
    metric: chapter.metric,
  });
}

fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log(`Generated ${TOTAL_FRAMES} cut cinema frames and manifest.json in ${OUT_DIR}`);
