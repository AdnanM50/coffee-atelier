export const HERO_TOTAL_FRAMES = 1000;

export const heroFrames: (HTMLImageElement | undefined)[] = [];
export const heroRequestedFrames = new Set<number>();
export const heroNonKeyframeLoaded = new Set<number>();

const inflightPromises = new Map<number, Promise<boolean>>();

export function getHeroFrameUrl(n: number): string {
  return `/frames/frame_${String(n).padStart(4, '0')}.webp`;
}

export function isPinnedHeroKeyframe(n: number): boolean {
  return n === 1 || n === HERO_TOTAL_FRAMES || (n - 1) % 10 === 0;
}

export function getPass1Keyframes(): number[] {
  const seen = new Set<number>();
  const frames: number[] = [];
  const add = (n: number) => {
    if (n >= 1 && n <= HERO_TOTAL_FRAMES && !seen.has(n)) {
      seen.add(n);
      frames.push(n);
    }
  };

  for (let i = 1; i <= HERO_TOTAL_FRAMES; i += 20) {
    add(i);
  }
  add(HERO_TOTAL_FRAMES);

  return frames;
}

export function preloadHeroFrame(frameNum: number, highPriority = false): Promise<boolean> {
  if (frameNum < 1 || frameNum > HERO_TOTAL_FRAMES) {
    return Promise.resolve(false);
  }

  const existing = heroFrames[frameNum];
  if (existing && existing.complete && existing.naturalWidth > 0) {
    return Promise.resolve(true);
  }

  const inflight = inflightPromises.get(frameNum);
  if (inflight) {
    return inflight;
  }

  heroRequestedFrames.add(frameNum);

  const promise = new Promise<boolean>((resolve) => {
    const img = new Image();
    if (highPriority && 'fetchPriority' in img) {
      (img as HTMLImageElement & { fetchPriority: string }).fetchPriority = 'high';
    }

    img.onload = () => {
      inflightPromises.delete(frameNum);
      heroFrames[frameNum] = img;
      if (!isPinnedHeroKeyframe(frameNum)) {
        heroNonKeyframeLoaded.add(frameNum);
      }
      resolve(true);
    };

    img.onerror = () => {
      inflightPromises.delete(frameNum);
      resolve(false);
    };

    img.src = getHeroFrameUrl(frameNum);
  });

  inflightPromises.set(frameNum, promise);
  return promise;
}
