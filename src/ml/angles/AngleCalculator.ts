/**
 * Phase 19 — Vector-based joint angle math.
 *
 * Pure TypeScript helpers for computing 2D and 3D vector angles between
 * three points (point → vertex → point). These functions are the
 * lowest layer of the Phase 19 angle stack and are deliberately
 * decoupled from MediaPipe landmark shapes — they work on any
 * `AnglePoint2D` / `AnglePoint3D` regardless of which space the caller
 * is in (raw image space, smoothed image space, torso-normalized,
 * world-space).
 *
 * Important rules this file enforces:
 *
 * - **Never throw on bad input.** Non-finite values, zero-length
 *   vectors, and missing points return a tagged failure result instead
 *   of `NaN` / `Infinity`.
 * - **Never invent a value.** A failed calculation returns
 *   `valueDegrees: null` with an `AngleAvailabilityStatus` reason. The
 *   caller decides how to surface the unavailable angle.
 * - **No dependencies.** Plain math only — no `lodash`, no `gl-matrix`,
 *   no external geometry libraries.
 * - **No state.** Every helper is a pure function.
 */

import type { AngleAvailabilityStatus, AnglePoint2D, AnglePoint3D } from '@/types/angles';

/** Convert radians to degrees. Inputs that are non-finite return `0`. */
export function degreesFromRadians(radians: number): number {
  if (!Number.isFinite(radians)) {
    return 0;
  }
  return (radians * 180) / Math.PI;
}

/** Clamp a number into `[min, max]`. Non-finite inputs return `min`. */
export function safeClamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

/** 2D dot product. Non-finite components return `NaN`-safe `0`. */
export function dot2D(ax: number, ay: number, bx: number, by: number): number {
  const result = ax * bx + ay * by;
  return Number.isFinite(result) ? result : 0;
}

/** 3D dot product. Non-finite components return `NaN`-safe `0`. */
export function dot3D(
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
): number {
  const result = ax * bx + ay * by + az * bz;
  return Number.isFinite(result) ? result : 0;
}

/** 2D vector length. Non-finite components return `0`. */
export function vectorLength2D(x: number, y: number): number {
  const squared = x * x + y * y;
  if (!Number.isFinite(squared) || squared < 0) {
    return 0;
  }
  return Math.sqrt(squared);
}

/** 3D vector length. Non-finite components return `0`. */
export function vectorLength3D(x: number, y: number, z: number): number {
  const squared = x * x + y * y + z * z;
  if (!Number.isFinite(squared) || squared < 0) {
    return 0;
  }
  return Math.sqrt(squared);
}

function isFinitePoint2D(point: AnglePoint2D | undefined): point is AnglePoint2D {
  return point !== undefined && Number.isFinite(point.x) && Number.isFinite(point.y);
}

function isFinitePoint3D(point: AnglePoint3D | undefined): point is AnglePoint3D {
  return (
    point !== undefined &&
    Number.isFinite(point.x) &&
    Number.isFinite(point.y) &&
    Number.isFinite(point.z)
  );
}

/**
 * Result envelope for the low-level angle helpers — keeps NaN / null
 * propagation explicit and forces the caller to handle failures.
 */
export type AngleMathResult = {
  /** Angle in degrees `[0, 180]` when `status === 'available'`. */
  valueDegrees: number | null;
  status: AngleAvailabilityStatus;
};

const ZERO_LENGTH_EPSILON = 1e-9;

/**
 * Compute the unsigned 2D vector angle at `vertex` formed by the
 * vectors `vertex → pointA` and `vertex → pointC`. Returns degrees in
 * `[0, 180]` on success.
 *
 * Uses the dot-product formula
 *   `cos(theta) = (a · c) / (|a| * |c|)`
 * and clamps the cosine into `[-1, 1]` so floating-point drift never
 * pushes `Math.acos` into `NaN`.
 *
 * Returns a tagged failure result when:
 * - any of the three points are missing or non-finite
 *   (`key-landmarks-missing`),
 * - either vector has effectively zero length
 *   (`numeric-instability`).
 */
export function calculateAngle(
  pointA: AnglePoint2D | undefined,
  vertex: AnglePoint2D | undefined,
  pointC: AnglePoint2D | undefined,
): AngleMathResult {
  if (!isFinitePoint2D(pointA) || !isFinitePoint2D(vertex) || !isFinitePoint2D(pointC)) {
    return { valueDegrees: null, status: 'key-landmarks-missing' };
  }

  const ax = pointA.x - vertex.x;
  const ay = pointA.y - vertex.y;
  const cx = pointC.x - vertex.x;
  const cy = pointC.y - vertex.y;

  const lenA = vectorLength2D(ax, ay);
  const lenC = vectorLength2D(cx, cy);

  if (lenA < ZERO_LENGTH_EPSILON || lenC < ZERO_LENGTH_EPSILON) {
    return { valueDegrees: null, status: 'numeric-instability' };
  }

  const cosine = safeClamp(dot2D(ax, ay, cx, cy) / (lenA * lenC), -1, 1);
  const radians = Math.acos(cosine);
  if (!Number.isFinite(radians)) {
    return { valueDegrees: null, status: 'numeric-instability' };
  }
  return { valueDegrees: degreesFromRadians(radians), status: 'available' };
}

/**
 * Compute the unsigned 3D vector angle at `vertex` formed by the
 * vectors `vertex → pointA` and `vertex → pointC`. Returns degrees in
 * `[0, 180]` on success.
 *
 * Same safety contract as `calculateAngle`: clamped cosine, NaN-safe
 * length / dot, and tagged failure results instead of `NaN`.
 */
export function calculateAngle3D(
  pointA: AnglePoint3D | undefined,
  vertex: AnglePoint3D | undefined,
  pointC: AnglePoint3D | undefined,
): AngleMathResult {
  if (!isFinitePoint3D(pointA) || !isFinitePoint3D(vertex) || !isFinitePoint3D(pointC)) {
    return { valueDegrees: null, status: 'key-landmarks-missing' };
  }

  const ax = pointA.x - vertex.x;
  const ay = pointA.y - vertex.y;
  const az = pointA.z - vertex.z;
  const cx = pointC.x - vertex.x;
  const cy = pointC.y - vertex.y;
  const cz = pointC.z - vertex.z;

  const lenA = vectorLength3D(ax, ay, az);
  const lenC = vectorLength3D(cx, cy, cz);

  if (lenA < ZERO_LENGTH_EPSILON || lenC < ZERO_LENGTH_EPSILON) {
    return { valueDegrees: null, status: 'numeric-instability' };
  }

  const cosine = safeClamp(dot3D(ax, ay, az, cx, cy, cz) / (lenA * lenC), -1, 1);
  const radians = Math.acos(cosine);
  if (!Number.isFinite(radians)) {
    return { valueDegrees: null, status: 'numeric-instability' };
  }
  return { valueDegrees: degreesFromRadians(radians), status: 'available' };
}

/**
 * Compute the unsigned angle in degrees `[0, 180]` between a 2D vector
 * and screen-vertical (the `+y` axis in image space). Used for the
 * trunk angle: `0°` means the vector lies on the vertical axis, i.e.
 * upright relative to the camera frame.
 */
export function angleFromVertical2D(vectorX: number, vectorY: number): AngleMathResult {
  if (!Number.isFinite(vectorX) || !Number.isFinite(vectorY)) {
    return { valueDegrees: null, status: 'key-landmarks-missing' };
  }
  const len = vectorLength2D(vectorX, vectorY);
  if (len < ZERO_LENGTH_EPSILON) {
    return { valueDegrees: null, status: 'numeric-instability' };
  }
  const cosine = safeClamp(vectorY / len, -1, 1);
  const radians = Math.acos(cosine);
  if (!Number.isFinite(radians)) {
    return { valueDegrees: null, status: 'numeric-instability' };
  }
  return { valueDegrees: degreesFromRadians(radians), status: 'available' };
}
