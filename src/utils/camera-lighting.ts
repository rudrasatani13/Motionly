import type { LightingStatus } from '@/types/camera-setup';

export const CAMERA_LIGHTING_CHECK_INTERVAL_MS = 500;
export const CAMERA_LIGHTING_SAMPLE_WIDTH = 32;

const TOO_DARK_BRIGHTNESS = 65;
const TOO_BRIGHT_BRIGHTNESS = 220;

/** Compute average perceived brightness from RGBA pixel bytes. */
export function averageBrightnessFromPixels(pixels: Uint8ClampedArray): number {
  if (pixels.length < 4) {
    return Number.NaN;
  }

  let totalBrightness = 0;
  let pixelCount = 0;

  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index] ?? 0;
    const green = pixels[index + 1] ?? 0;
    const blue = pixels[index + 2] ?? 0;
    totalBrightness += red * 0.2126 + green * 0.7152 + blue * 0.0722;
    pixelCount += 1;
  }

  return pixelCount === 0 ? Number.NaN : totalBrightness / pixelCount;
}

/** Classify average brightness into a Phase 16 lighting status. */
export function classifyAverageBrightness(averageBrightness: number): LightingStatus {
  if (!Number.isFinite(averageBrightness)) {
    return 'error';
  }
  if (averageBrightness < TOO_DARK_BRIGHTNESS) {
    return 'too_dark';
  }
  if (averageBrightness > TOO_BRIGHT_BRIGHTNESS) {
    return 'too_bright';
  }
  return 'good';
}
