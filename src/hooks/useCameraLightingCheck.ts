import { useEffect, useState, type RefObject } from 'react';

import type { LightingStatus } from '@/types/camera-setup';
import { createCameraLightingSampler } from '@platform/camera-lighting';
import { CAMERA_LIGHTING_CHECK_INTERVAL_MS } from '@utils/camera-lighting';

export type CameraLightingCheckState = {
  status: LightingStatus;
  averageBrightness: number | null;
  errorMessage: string | null;
};

const INITIAL_LIGHTING_STATE: CameraLightingCheckState = {
  status: 'unknown',
  averageBrightness: null,
  errorMessage: null,
};

/**
 * Sample the current camera preview every 500ms while enabled.
 *
 * The hook owns only interval orchestration. Browser canvas access is
 * delegated to `@platform/camera-lighting`; frame data stays in memory
 * and is discarded after brightness is computed.
 */
export function useCameraLightingCheck(
  videoRef: RefObject<HTMLVideoElement>,
  enabled: boolean,
): CameraLightingCheckState {
  const [state, setState] = useState<CameraLightingCheckState>(INITIAL_LIGHTING_STATE);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    const sampler = createCameraLightingSampler();

    const sampleLighting = (): void => {
      const video = videoRef.current;
      if (video === null) {
        setState({ status: 'checking', averageBrightness: null, errorMessage: null });
        return;
      }

      const sample = sampler.sample(video);
      if (sample.kind === 'checking') {
        setState({ status: 'checking', averageBrightness: null, errorMessage: null });
        return;
      }

      if (sample.kind === 'error') {
        setState({ status: 'error', averageBrightness: null, errorMessage: sample.message });
        return;
      }

      setState({
        status: sample.status,
        averageBrightness: sample.averageBrightness,
        errorMessage: null,
      });
    };

    const firstSampleId = window.setTimeout(sampleLighting, 0);
    const intervalId = window.setInterval(sampleLighting, CAMERA_LIGHTING_CHECK_INTERVAL_MS);

    return () => {
      window.clearTimeout(firstSampleId);
      window.clearInterval(intervalId);
      sampler.dispose();
    };
  }, [enabled, videoRef]);

  return enabled ? state : INITIAL_LIGHTING_STATE;
}
