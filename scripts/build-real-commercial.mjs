import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const RAW_VIDEOS_DIR = path.join(ROOT, 'scripts', 'raw_videos');
const VIDEO_DIR = path.join(ROOT, 'public', 'videos');
const FRAMES_DIR = path.join(ROOT, 'public', 'frames');

for (const d of [RAW_VIDEOS_DIR, VIDEO_DIR, FRAMES_DIR]) {
  fs.mkdirSync(d, { recursive: true });
}

for (const f of fs.readdirSync(FRAMES_DIR)) {
  if (f.endsWith('.jpg') || f.endsWith('.svg')) {
    fs.unlinkSync(path.join(FRAMES_DIR, f));
  }
}

const SEGMENTS = [
  {
    file: '01_farm_cherries.webm',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Ripen_coffee_fruits%2C_Kodagu%2C_Karnataka.webm',
    ss: 2.0,
    segDur: 3.5,
  },
  {
    file: '03_bean_sorter.webm',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Color_sorter_coffeebeans.webm',
    ss: 1.0,
    segDur: 3.5,
  },
  {
    file: 'roast_bed.webm',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Kaffeemaschine_2.0_Bohnen_r%C3%B6sten_mit_Wirbelschicht_ICEBE_B25.webm',
    ss: 98.0,
    segDur: 3.5,
  },
  {
    file: '05_espresso_extraction.webm',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Sunday_Morning_Espresso_Routine_-_Grind_%2B_distribute_%2B_tamp_%2B_extraction_%2815-Second_Abridged_Version%29.webm',
    ss: 5.5,
    segDur: 3.5,
  },
  {
    file: 'macro_espresso.webm',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Macro_Espresso_Process.webm',
    ss: 19.5,
    segDur: 4.5,
  },
  {
    file: '06_latte_art_shop.ogv',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Latte_art_leaf_-_01.ogv',
    ss: 2.0,
    segDur: 3.5,
  },
];

async function ensureVideo(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 500000) {
    return;
  }
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AetherCrema/1.0; +http://localhost)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function main() {
  console.log('1. Verifying 6 real live-action coffee video segments...');
  for (const seg of SEGMENTS) {
    const dest = path.join(RAW_VIDEOS_DIR, seg.file);
    await ensureVideo(seg.url, dest);
    console.log(`   ✓ ${seg.file} (ss=${seg.ss}s, dur=${seg.segDur}s)`);
  }

  console.log('2. Stitching 20-second 1280x720 H.264 commercial video via ffmpeg...');
  const videoOut = path.join(VIDEO_DIR, 'coffee-commercial.mp4');
  const inputs = [];
  const filterSteps = [];

  SEGMENTS.forEach((seg, i) => {
    const filePath = path.join(RAW_VIDEOS_DIR, seg.file);
    inputs.push('-ss', seg.ss.toFixed(2), '-t', seg.segDur.toFixed(2), '-i', filePath);
    filterSteps.push(
      `[${i}:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,` +
        `fps=24,eq=contrast=1.06:saturation=1.1,format=yuv420p[v${i}]`
    );
  });

  // 3.5+3.5+3.5+3.5+4.5+3.5 - 5*0.4 = 20.0s exact
  const xfadeDur = 0.4;
  let runningDur = SEGMENTS[0].segDur;
  let lastLabel = 'v0';

  for (let i = 1; i < SEGMENTS.length; i++) {
    const outLabel = i === SEGMENTS.length - 1 ? 'vout' : `xf${i}`;
    const offset = Math.max(0.5, runningDur - xfadeDur);
    filterSteps.push(
      `[${lastLabel}][v${i}]xfade=transition=fade:duration=${xfadeDur}:offset=${offset.toFixed(2)}[${outLabel}]`
    );
    runningDur = offset + SEGMENTS[i].segDur;
    lastLabel = outLabel;
  }

  execFileSync(
    'ffmpeg',
    [
      '-y',
      ...inputs,
      '-filter_complex',
      filterSteps.join(';'),
      '-map',
      '[vout]',
      '-an',
      '-t',
      '20',
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-preset',
      'medium',
      '-crf',
      '20',
      '-movflags',
      '+faststart',
      videoOut,
    ],
    { stdio: 'inherit' }
  );

  console.log('3. Cutting video into 240 real JPEG frames (12 fps)...');
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      videoOut,
      '-vf',
      'fps=12,scale=1280:720',
      '-frames:v',
      '240',
      '-q:v',
      '3',
      path.join(FRAMES_DIR, 'frame_%04d.jpg'),
    ],
    { stdio: 'inherit' }
  );

  const generatedFrames = fs
    .readdirSync(FRAMES_DIR)
    .filter((f) => /^frame_\d{4}\.jpg$/.test(f))
    .sort();

  const manifest = {
    fps: 12,
    totalFrames: generatedFrames.length,
    videoUrl: '/videos/coffee-commercial.mp4',
    frames: generatedFrames.map((file, idx) => ({
      frame: idx + 1,
      file: `/frames/${file}`,
    })),
  };

  fs.writeFileSync(path.join(FRAMES_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`   ✓ Cut ${generatedFrames.length} real JPG frames + manifest.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
