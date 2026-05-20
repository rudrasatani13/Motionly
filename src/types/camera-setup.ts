/**
 * Phase 16 — Camera setup domain types.
 *
 * These types describe only the honest setup signals available before
 * MediaPipe lands: camera stream status, local lighting analysis, and
 * explicit user confirmation. They intentionally do not include pose,
 * landmark, skeleton, confidence, rep, score, or form-feedback fields.
 */

/** Which camera direction the setup flow requests. Phase 16 uses `user`. */
export type CameraFacingMode = 'user' | 'environment';

/** Browser stream lifecycle state for the live setup preview. */
export type CameraStreamStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'error';

/** Local brightness analysis status from the current camera frame. */
export type LightingStatus = 'unknown' | 'checking' | 'too_dark' | 'too_bright' | 'good' | 'error';

/** UI-friendly camera setup failure categories. */
export type CameraSetupErrorKind =
  | 'unsupported-browser'
  | 'insecure-context'
  | 'no-camera'
  | 'permission-denied'
  | 'camera-busy'
  | 'unreadable'
  | 'request-failed';

/** Honest readiness gate used by Phase 16 before handing off to active workout. */
export type CameraSetupReadinessStatus =
  | 'not_ready'
  | 'camera_needed'
  | 'lighting_needs_attention'
  | 'needs_user_confirmation'
  | 'ready';

export type CameraSetupError = {
  kind: CameraSetupErrorKind;
  message: string;
};

/** Typed result returned by the live setup stream adapter. */
export type CameraStreamResult =
  | {
      kind: 'granted';
      stream: MediaStream;
      facingMode: CameraFacingMode;
    }
  | {
      kind: 'denied';
      errorKind: 'permission-denied';
      message: string;
    }
  | {
      kind: 'unavailable';
      errorKind: 'unsupported-browser' | 'insecure-context' | 'no-camera';
      message: string;
    }
  | {
      kind: 'error';
      errorKind: 'camera-busy' | 'unreadable' | 'request-failed';
      message: string;
    };

/** Page-local state shape for Phase 16 setup orchestration. */
export type CameraSetupState = {
  streamStatus: CameraStreamStatus;
  facingMode: CameraFacingMode;
  stream: MediaStream | null;
  streamError: CameraSetupError | null;
  lightingStatus: LightingStatus;
  lightingAverageBrightness: number | null;
  lightingErrorMessage: string | null;
  lightingManuallyAccepted: boolean;
  userConfirmedAlignment: boolean;
  readinessStatus: CameraSetupReadinessStatus;
};
