import type { CameraFacingMode, CameraStreamResult } from '@/types/camera-setup';

/**
 * Phase 16 — live camera stream platform adapter.
 *
 * This is the single Phase 16 chokepoint for requesting a live workout
 * setup stream with `navigator.mediaDevices.getUserMedia`. It is
 * separate from `camera-permission.ts`, which still handles the Phase
 * 12 onboarding primer and immediately stops its temporary stream.
 *
 * Privacy and lifecycle contract:
 * - Requests video only: no microphone, no audio constraints.
 * - Keeps the granted stream alive only while `/workout/:id/setup` is
 *   mounted so the user can see a live preview.
 * - Never stores the stream globally and never uploads, records, saves,
 *   or persists frames.
 * - Callers must stop tracks on unmount, route change, cancel, retry
 *   replacement, continue, and error recovery via `stopCameraStream`.
 * - Real pose inference, landmarks, and skeleton overlays begin in
 *   Phase 17+, not here.
 */

const SETUP_CAMERA_WIDTH = 640;
const SETUP_CAMERA_HEIGHT = 480;

type MediaDevicesLike = {
  getUserMedia?: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
};

function mediaDevices(): MediaDevicesLike | null {
  if (typeof navigator === 'undefined') {
    return null;
  }
  return (navigator as { mediaDevices?: MediaDevicesLike }).mediaDevices ?? null;
}

function hasGetUserMedia(): boolean {
  return typeof mediaDevices()?.getUserMedia === 'function';
}

function isSecureContext(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.isSecureContext === true;
}

function constraintsFor(facingMode: CameraFacingMode): MediaStreamConstraints {
  return {
    audio: false,
    video: {
      facingMode: { ideal: facingMode },
      width: { ideal: SETUP_CAMERA_WIDTH },
      height: { ideal: SETUP_CAMERA_HEIGHT },
    },
  };
}

function classifyCameraError(error: unknown): Exclude<CameraStreamResult, { kind: 'granted' }> {
  if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
      case 'SecurityError':
        return {
          kind: 'denied',
          errorKind: 'permission-denied',
          message:
            'Camera access was blocked. Allow camera access in your browser settings, then try again.',
        };
      case 'NotFoundError':
      case 'DevicesNotFoundError':
      case 'OverconstrainedError':
        return {
          kind: 'unavailable',
          errorKind: 'no-camera',
          message: 'No camera was found for this browser.',
        };
      case 'NotReadableError':
      case 'TrackStartError':
        return {
          kind: 'error',
          errorKind: 'camera-busy',
          message: 'Your camera is busy in another app or tab. Close it and try again.',
        };
      case 'AbortError':
        return {
          kind: 'error',
          errorKind: 'unreadable',
          message: 'The camera request was interrupted. Please try again.',
        };
      default:
        return {
          kind: 'error',
          errorKind: 'request-failed',
          message: error.message || 'Camera setup could not start. Please try again.',
        };
    }
  }

  if (error instanceof Error) {
    return { kind: 'error', errorKind: 'request-failed', message: error.message };
  }

  return {
    kind: 'error',
    errorKind: 'request-failed',
    message: 'Camera setup could not start. Please try again.',
  };
}

/**
 * Request the live Phase 16 camera setup stream.
 *
 * Invoke only from a user-initiated action such as tapping
 * "Turn on camera". The granted stream belongs to the caller until it
 * is stopped with `stopCameraStream`.
 */
export async function requestCameraStreamForSetup(
  facingMode: CameraFacingMode = 'user',
): Promise<CameraStreamResult> {
  if (!hasGetUserMedia()) {
    return {
      kind: 'unavailable',
      errorKind: 'unsupported-browser',
      message: 'This browser does not expose the camera API Motionly needs.',
    };
  }

  if (!isSecureContext()) {
    return {
      kind: 'unavailable',
      errorKind: 'insecure-context',
      message:
        'Camera setup needs HTTPS or localhost. Open Motionly from a secure URL and try again.',
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraintsFor(facingMode));
    if (stream.getVideoTracks().length === 0) {
      stopCameraStream(stream);
      return {
        kind: 'unavailable',
        errorKind: 'no-camera',
        message: 'No camera video track was returned by this browser.',
      };
    }
    return { kind: 'granted', stream, facingMode };
  } catch (error: unknown) {
    return classifyCameraError(error);
  }
}

/** Stop every track in a camera stream safely. Safe to call repeatedly. */
export function stopCameraStream(stream: MediaStream | null | undefined): void {
  if (stream === null || stream === undefined) {
    return;
  }

  try {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        // Ignore: stopping an already-ended track is harmless.
      }
    });
  } catch {
    // Defensive: some embedded browsers throw on `.getTracks()`.
  }
}

/** Return whether a granted stream still has at least one live track. */
export function isCameraStreamActive(stream: MediaStream | null | undefined): boolean {
  if (stream === null || stream === undefined) {
    return false;
  }

  try {
    return stream.active && stream.getTracks().some((track) => track.readyState === 'live');
  } catch {
    return false;
  }
}
