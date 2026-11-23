import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const VIDEO_DIR = path.join(ROOT, 'public', 'videos');
const FRAMES_DIR = path.join(ROOT, 'public', 'frames');
const DEFAULT_VIDEO_OUT = path.join(VIDEO_DIR, 'coffee-commercial.mp4');

const TARGET_FRAMES = 1000;
const FPS = 50;
const WIDTH = 1280;
const HEIGHT = 720;
const INITIAL_QUALITY = Number(process.env.WEBP_QUALITY || 70);
const FALLBACK_QUALITY = 62;
const MAX_TOTAL_MB = 48;

function cleanFramesDir() {
  for (const file of fs.readdirSync(FRAMES_DIR)) {
    if (/\.(jpg|jpeg|svg|webp|png)$/i.test(file)) {
      fs.unlinkSync(path.join(FRAMES_DIR, file));
    }
  }
}

function getSortedFrames() {
  return fs
    .readdirSync(FRAMES_DIR)
    .filter((f) => /^frame_\d{4}\.webp$/.test(f))
    .sort();
}

function extractFrames(videoPath, quality) {
  cleanFramesDir();

  console.log(
    `Cutting ${TARGET_FRAMES} interpolated WebP frames (${FPS} fps, ${WIDTH}x${HEIGHT}, q=${quality}) from ${videoPath}...`
  );

  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      videoPath,
      '-vf',
      `framerate=fps=${FPS}:interp_start=0:interp_end=255:scene=8.2,scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT},setsar=1`,
      '-frames:v',
      String(TARGET_FRAMES),
      '-c:v',
      'libwebp',
      '-quality',
      String(quality),
      '-compression_level',
      '1',
      '-f',
      'image2',
      path.join(FRAMES_DIR, 'frame_%04d.webp'),
    ],
    { stdio: 'inherit' }
  );

  let frames = getSortedFrames();
  if (frames.length < 990) {
    throw new Error(
      `Expected at least 990 frames from ffmpeg, but only ${frames.length} were generated.`
    );
  }

  if (frames.length < TARGET_FRAMES) {
    const lastFramePath = path.join(FRAMES_DIR, frames[frames.length - 1]);
    for (let i = frames.length + 1; i <= TARGET_FRAMES; i++) {
      const paddedName = `frame_${String(i).padStart(4, '0')}.webp`;
      fs.copyFileSync(lastFramePath, path.join(FRAMES_DIR, paddedName));
    }
    frames = getSortedFrames();
  }

  if (frames.length !== TARGET_FRAMES) {
    throw new Error(`Expected strictly ${TARGET_FRAMES} frames, got ${frames.length}.`);
  }

  const totalBytes = frames.reduce(
    (sum, file) => sum + fs.statSync(path.join(FRAMES_DIR, file)).size,
    0
  );
  const totalMB = totalBytes / (1024 * 1024);
  const avgKB = totalBytes / frames.length / 1024;

  return { frames, totalMB, avgKB };
}

function main() {
  const inputArg = process.argv[2];
  const sourcePath = inputArg ? path.resolve(inputArg) : DEFAULT_VIDEO_OUT;

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source video not found: ${sourcePath}`);
  }

  fs.mkdirSync(VIDEO_DIR, { recursive: true });
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  if (path.resolve(sourcePath) !== path.resolve(DEFAULT_VIDEO_OUT)) {
    console.log(`Copying source video to ${DEFAULT_VIDEO_OUT}...`);
    fs.copyFileSync(sourcePath, DEFAULT_VIDEO_OUT);
  }

  let result = extractFrames(DEFAULT_VIDEO_OUT, INITIAL_QUALITY);

  if (result.totalMB > MAX_TOTAL_MB && INITIAL_QUALITY > FALLBACK_QUALITY) {
    console.log(
      `Total size ${result.totalMB.toFixed(2)} MB exceeds ${MAX_TOTAL_MB} MB; re-encoding at quality ${FALLBACK_QUALITY}...`
    );
    result = extractFrames(DEFAULT_VIDEO_OUT, FALLBACK_QUALITY);
  }

  const manifest = {
    fps: FPS,
    totalFrames: result.frames.length,
    width: WIDTH,
    height: HEIGHT,
    format: 'webp',
    videoUrl: '/videos/coffee-commercial.mp4',
    frames: result.frames.map((file, idx) => ({
      frame: idx + 1,
      file: `/frames/${file}`,
    })),
  };

  fs.writeFileSync(
    path.join(FRAMES_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  console.log(
    `✓ Cut ${result.frames.length} WebP frames | Total: ${result.totalMB.toFixed(2)} MB | Avg: ${result.avgKB.toFixed(1)} KB/frame`
  );
}

main();
