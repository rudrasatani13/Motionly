/**
 * Phase 12 — Camera permission platform adapter.
 *
 * Single chokepoint for `navigator.mediaDevices.getUserMedia` in
 * Phase 12. Following the platform-adapter rule
 * (`docs/ARCHITECTURE.md` §6), all browser-camera access lives here
 * instead of leaking into product code.
 *
 * Scope (Phase 12 — permission priming only):
 * - Request **video only** so the browser shows the user a clear
 *   camera-permission prompt before the first real workout.
 * - Stop every media track immediately after permission resolves. No
 *   stream, no frames, no preview leaves this module. Phase 12 must
 *   not keep a camera stream alive.
 * - Translate browser-specific failure modes into a typed result so
 *   the UI can render honest copy without inspecting DOM exceptions.
 *
 * Out of scope (deferred to later camera / pose-detection phases):
 * - Live camera preview, silhouette detection, frame capture, pose
 *   inference, recording, upload, or storage.
 * - Audio capture. This module never requests audio.
 * - Re-using or returning the `MediaStream`. The stream is always
 *   stopped before the function returns.
 *
 * The result is a tagged union rather than a thrown error so callers
 * stay declarative and the type system guarantees every outcome is
 * handled.
 */

export type CameraPermissionResult =
  | { kind: 'granted' }
  | { kind: 'denied'; reason: 'user-blocked' | 'security' }
  | { kind: 'unavailable'; reason: 'no-camera' | 'unsupported-browser' | 'insecure-context' }
  | { kind: 'error'; message: string };

type MediaDevicesLike = {
  getUserMedia?: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
};

function hasGetUserMedia(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  const mediaDevices = (navigator as { mediaDevices?: MediaDevicesLike }).mediaDevices;
  return typeof mediaDevices?.getUserMedia === 'function';
}

function isSecureContext(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  // `window.isSecureContext` is `true` for HTTPS and `http://localhost`.
  // Plain HTTP on a remote host blocks `getUserMedia`, so we report it
  // honestly rather than surface a cryptic DOM exception.
  return window.isSecureContext === true;
}

function stopAllTracks(stream: MediaStream): void {
  try {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        // Ignore: stopping an already-stopped track is harmless.
      }
    });
  } catch {
    // Defensive: some embedded browsers throw on `.getTracks()`.
  }
}

function classifyDomError(error: unknown): CameraPermissionResult {
  if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return { kind: 'denied', reason: 'user-blocked' };
      case 'SecurityError':
        return { kind: 'denied', reason: 'security' };
      case 'NotFoundError':
      case 'OverconstrainedError':
      case 'DevicesNotFoundError':
        return { kind: 'unavailable', reason: 'no-camera' };
      case 'NotReadableError':
      case 'TrackStartError':
        return {
          kind: 'error',
          message: 'Your camera is busy in another app. Close it and try again.',
        };
      case 'AbortError':
        return { kind: 'error', message: 'Camera request was interrupted. Please try again.' };
      default:
        return { kind: 'error', message: error.message || 'Camera request failed.' };
    }
  }
  if (error instanceof Error) {
    return { kind: 'error', message: error.message };
  }
  return { kind: 'error', message: 'Camera request failed.' };
}

/**
 * Prompt the browser for camera permission for the Phase 12
 * onboarding tutorial, then stop the resulting stream immediately.
 *
 * Behavior:
 * - Resolves with a tagged result; never throws.
 * - Requests **video only** (no audio).
 * - Calls `track.stop()` on every track before resolving so no
 *   indicator stays lit and no frames are captured.
 *
 * Caller responsibility:
 * - Only invoke after a user-initiated CTA (Phase 12 must not auto-
 *   prompt on page load).
 * - Render permission-specific UI based on the returned `kind`.
 * - Do not store, render, or transmit anything from the camera.
 */
export async function requestCameraPermissionForOnboarding(): Promise<CameraPermissionResult> {
  if (!hasGetUserMedia()) {
    return { kind: 'unavailable', reason: 'unsupported-browser' };
  }
  if (!isSecureContext()) {
    return { kind: 'unavailable', reason: 'insecure-context' };
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
  } catch (error: unknown) {
    return classifyDomError(error);
  }

  // The only thing Phase 12 does with the stream is stop it.
  stopAllTracks(stream);
  return { kind: 'granted' };
}
