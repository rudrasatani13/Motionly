import type { LightingStatus } from '@/types/camera-setup';
import {
  CAMERA_LIGHTING_SAMPLE_WIDTH,
  averageBrightnessFromPixels,
  classifyAverageBrightness,
} from '@utils/camera-lighting';

/**
 * Browser-only local frame sampler for the Phase 16 lighting check.
 *
 * The sampler draws the current `<video>` frame to an in-memory canvas,
 * reads a tiny downscaled pixel buffer, computes brightness, and then
 * overwrites that buffer on the next sample. It never stores frames,
 * never persists image data, and never sends pixels anywhere. Pose
 * inference remains Phase 17+.
 */

const HAVE_CURRENT_DATA_READY_STATE = 2;

export type CameraLightingFrameSample =
  | {
      kind: 'sampled';
      status: Exclude<LightingStatus, 'unknown' | 'checking' | 'error'>;
      averageBrightness: number;
    }
  | { kind: 'checking' }
  | { kind: 'error'; message: string };

export type CameraLightingSampler = {
  sample: (video: HTMLVideoElement) => CameraLightingFrameSample;
  dispose: () => void;
};

function canUseCanvas(): boolean {
  return typeof document !== 'undefined' && typeof document.createElement === 'function';
}

/** Create a short-lived sampler owned by a single setup screen mount. */
export function createCameraLightingSampler(): CameraLightingSampler {
  let canvas: HTMLCanvasElement | null = null;
  let context: CanvasRenderingContext2D | null = null;

  function ensureContext(): CanvasRenderingContext2D | null {
    if (!canUseCanvas()) {
      return null;
    }
    if (canvas === null) {
      canvas = document.createElement('canvas');
    }
    if (context === null) {
      context = canvas.getContext('2d', { willReadFrequently: true });
    }
    return context;
  }

  return {
    sample(video: HTMLVideoElement): CameraLightingFrameSample {
      if (
        video.readyState < HAVE_CURRENT_DATA_READY_STATE ||
        video.videoWidth <= 0 ||
        video.videoHeight <= 0
      ) {
        return { kind: 'checking' };
      }

      const canvasContext = ensureContext();
      if (canvasContext === null || canvas === null) {
        return {
          kind: 'error',
          message: 'This browser could not create the local canvas needed for lighting checks.',
        };
      }

      const sampleHeight = Math.max(
        1,
        Math.round((video.videoHeight / video.videoWidth) * CAMERA_LIGHTING_SAMPLE_WIDTH),
      );

      try {
        canvas.width = CAMERA_LIGHTING_SAMPLE_WIDTH;
        canvas.height = sampleHeight;
        canvasContext.drawImage(video, 0, 0, CAMERA_LIGHTING_SAMPLE_WIDTH, sampleHeight);
        const frame = canvasContext.getImageData(0, 0, CAMERA_LIGHTING_SAMPLE_WIDTH, sampleHeight);
        const averageBrightness = averageBrightnessFromPixels(frame.data);
        const status = classifyAverageBrightness(averageBrightness);

        if (status !== 'good' && status !== 'too_dark' && status !== 'too_bright') {
          return { kind: 'error', message: 'Lighting could not be read from this frame.' };
        }

        return { kind: 'sampled', status, averageBrightness };
      } catch {
        return {
          kind: 'error',
          message: 'Lighting could not be read from the camera preview on this browser.',
        };
      }
    },
    dispose(): void {
      canvas = null;
      context = null;
    },
  };
}
