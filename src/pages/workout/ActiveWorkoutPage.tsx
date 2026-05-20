import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Lock, Square } from 'lucide-react';

import { findWorkoutDetailById } from '@/data/workout-library';
import { EmptyState, SkeletonLoader, useToast } from '@components/feedback';
import { PoseDebugPanel, PoseLandmarkOverlay, type PoseOverlayMode } from '@components/pose-debug';
import { Button, Card, Column, Icon, Row, Text } from '@components/primitives';
import { WorkoutNotFoundState } from '@components/workout-detail';
import { useNavigation } from '@hooks/useNavigation';
import { usePoseLandmarker } from '@hooks/usePoseLandmarker';
import type { CameraFacingMode, CameraSetupError, CameraStreamStatus } from '@/types/camera-setup';
import {
  isCameraStreamActive,
  requestCameraStreamForSetup,
  stopCameraStream,
} from '@platform/camera-stream';
import type { WorkoutActiveRouteParams } from '@router/routeTypes';

type StreamFailure = Exclude<
  Awaited<ReturnType<typeof requestCameraStreamForSetup>>,
  { kind: 'granted' }
>;

function errorFromResult(result: StreamFailure): CameraSetupError {
  return { kind: result.errorKind, message: result.message };
}

export default function ActiveWorkoutPage(): JSX.Element {
  const { id } = useParams<WorkoutActiveRouteParams>();
  const navigation = useNavigation();
  const toast = useToast();

  const workout = useMemo(() => (id === undefined ? undefined : findWorkoutDetailById(id)), [id]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(false);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [streamStatus, setStreamStatus] = useState<CameraStreamStatus>('idle');
  const [streamError, setStreamError] = useState<CameraSetupError | null>(null);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>('user');
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [overlayMode, setOverlayMode] = useState<PoseOverlayMode>('raw');

  const pose = usePoseLandmarker();
  const cameraActive = streamStatus === 'granted' && isCameraStreamActive(stream);
  const poseRunning = pose.status === 'running' || pose.status === 'no-pose';

  const releaseVideoAndStream = useCallback((): void => {
    const currentVideo = videoRef.current;
    if (currentVideo !== null) {
      try {
        currentVideo.pause();
      } catch {
        // Ignore: pausing a never-played video is harmless.
      }
      currentVideo.srcObject = null;
    }
    stopCameraStream(streamRef.current);
    streamRef.current = null;
  }, []);

  const stopEverything = useCallback((): void => {
    pose.stop();
    releaseVideoAndStream();
    if (mountedRef.current) {
      setStream(null);
      setStreamStatus('idle');
      setStreamError(null);
    }
  }, [pose, releaseVideoAndStream]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      pose.stop();
      releaseVideoAndStream();
    };
    // pose.stop is stable across renders; we only want this on mount/unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wire the stream into the <video> element when it arrives.
  useEffect(() => {
    const video = videoRef.current;
    if (video === null) {
      return undefined;
    }
    if (stream === null) {
      video.srcObject = null;
      return undefined;
    }
    video.srcObject = stream;
    const playResult = video.play();
    if (typeof playResult?.catch === 'function') {
      playResult.catch(() => undefined);
    }
    return () => {
      if (video.srcObject === stream) {
        try {
          video.pause();
        } catch {
          // Ignore
        }
        video.srcObject = null;
      }
    };
  }, [stream]);

  // If the OS or user revokes a track, tear everything down honestly.
  useEffect(() => {
    if (stream === null) {
      return undefined;
    }
    const handleEnded = (): void => {
      if (!mountedRef.current) {
        return;
      }
      pose.stop();
      releaseVideoAndStream();
      setStream(null);
      setStreamStatus('error');
      setStreamError({
        kind: 'unreadable',
        message: 'The camera stream stopped. Tap Start pose debug to try again.',
      });
    };
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.addEventListener('ended', handleEnded));
    return () => {
      tracks.forEach((track) => track.removeEventListener('ended', handleEnded));
    };
  }, [pose, releaseVideoAndStream, stream]);

  const handleStartPoseDebug = useCallback(async (): Promise<void> => {
    if (workout === undefined) {
      return;
    }
    setStreamStatus('requesting');
    setStreamError(null);

    const result = await requestCameraStreamForSetup('user');

    if (!mountedRef.current) {
      if (result.kind === 'granted') {
        stopCameraStream(result.stream);
      }
      return;
    }

    if (result.kind !== 'granted') {
      setStream(null);
      streamRef.current = null;
      setStreamStatus(result.kind === 'denied' ? 'denied' : result.kind);
      setStreamError(errorFromResult(result));
      return;
    }

    streamRef.current = result.stream;
    setStream(result.stream);
    setFacingMode(result.facingMode);
    setStreamStatus('granted');

    // Wait one tick so the <video> has time to take the new srcObject
    // before we hand it to MediaPipe.
    requestAnimationFrame(() => {
      if (!mountedRef.current) {
        return;
      }
      const video = videoRef.current;
      if (video === null) {
        return;
      }
      void pose.start(video, { variant: 'lite' });
    });
  }, [pose, workout]);

  const handleStopPoseDebug = useCallback((): void => {
    stopEverything();
  }, [stopEverything]);

  const handleBackToSetup = useCallback((): void => {
    stopEverything();
    if (workout !== undefined) {
      navigation.goToWorkoutSetup(workout.id);
      return;
    }
    navigation.goToWorkouts();
  }, [navigation, stopEverything, workout]);

  const handleBackToDetail = useCallback((): void => {
    stopEverything();
    if (workout !== undefined) {
      navigation.goToWorkoutDetail(workout.id);
      return;
    }
    navigation.goToWorkouts();
  }, [navigation, stopEverything, workout]);

  const handleLockedWorkout = useCallback((): void => {
    toast.show({
      tone: 'info',
      title: 'Pro workout locked',
      message:
        'Paid plans are implemented in a later phase. Opening the paywall placeholder for now.',
    });
    navigation.goToPaywall();
  }, [navigation, toast]);

  if (id === undefined || workout === undefined) {
    return <WorkoutNotFoundState onBackToLibrary={navigation.goToWorkouts} />;
  }

  if (workout.accessTier === 'pro') {
    return (
      <section className="mx-auto flex w-full flex-col px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
        <EmptyState
          headingAs="h1"
          title="This workout is locked"
          description="Active pose debug is only available for free workouts right now. Real subscription access arrives in a later phase."
          illustration={<Icon icon={Lock} size="xl" />}
          action={
            <Button variant="primary" onClick={handleLockedWorkout}>
              View Pro access
            </Button>
          }
          secondaryAction={
            <Button variant="ghost" onClick={navigation.goToWorkouts}>
              Back to Workout Library
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section
      aria-labelledby="active-workout-heading"
      className="mx-auto flex w-full flex-col gap-6 px-4 pb-8 pt-6 sm:px-6 sm:pt-8"
    >
      <Column gap="xs">
        <Text variant="caption" tone="muted">
          Active workout · Phase 18 pose debug
        </Text>
        <Text variant="h1" as="h1" id="active-workout-heading">
          {workout.name}
        </Text>
        <Text tone="muted">
          This screen runs real on-device MediaPipe Pose Landmarker inference and processes each
          frame through Phase 18 smoothing, confidence filtering, and torso-scale normalization.
          Phase 18 processes landmarks for stability before angle and rep logic. No reps, form
          scores, or coaching are generated yet — nothing on this page is fabricated.
        </Text>
      </Column>

      <section
        aria-label="Live camera preview"
        className="overflow-hidden rounded-3xl border border-motionly-neutral-200 bg-motionly-neutral-950 shadow-sm dark:border-motionly-neutral-800"
      >
        <div className="relative aspect-[4/5] min-h-[360px] max-h-[72dvh] w-full overflow-hidden bg-motionly-neutral-950 sm:aspect-[4/3]">
          {stream === null ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-motionly-neutral-100">
              <Icon icon={Camera} size="xl" />
              <Text variant="h3" as="p" tone="inherit">
                Camera preview is off
              </Text>
              <Text tone="inherit" className="max-w-sm text-motionly-neutral-300">
                Tap Start pose debug to request the camera and load the MediaPipe Pose Landmarker
                model. Motionly does not request camera access on page load.
              </Text>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                aria-hidden="true"
                className={
                  facingMode === 'user'
                    ? 'h-full w-full scale-x-[-1] object-cover'
                    : 'h-full w-full object-cover'
                }
              />
              {overlayEnabled ? (
                <PoseLandmarkOverlay
                  frame={pose.latestFrame}
                  processedFrame={pose.latestProcessedFrame}
                  mode={overlayMode}
                  mirror={facingMode === 'user'}
                />
              ) : null}
            </>
          )}
        </div>
        <div className="border-t border-white/10 px-4 py-3">
          <Text variant="caption" tone="inherit" className="text-motionly-neutral-200">
            Live preview only. Frames stay on this device — Motionly never uploads, records, or
            persists them.
          </Text>
        </div>
      </section>

      {streamStatus === 'requesting' ? (
        <Card variant="outlined" padding="lg" role="status" aria-live="polite">
          <Column gap="md">
            <SkeletonLoader shape="block" height="h-16" />
            <Text tone="muted">Waiting for the browser camera prompt…</Text>
          </Column>
        </Card>
      ) : null}

      {pose.status === 'loading-model' ? (
        <Card variant="outlined" padding="lg" role="status" aria-live="polite">
          <Column gap="sm">
            <Text variant="label">Loading MediaPipe Pose Landmarker…</Text>
            <Text tone="muted" variant="caption">
              The lite model is ~6 MB. First load needs a network connection; later loads are served
              from the offline cache.
            </Text>
          </Column>
        </Card>
      ) : null}

      {streamError !== null &&
      (streamStatus === 'denied' || streamStatus === 'unavailable' || streamStatus === 'error') ? (
        <Card variant="outlined" padding="lg" role="alert" aria-live="assertive">
          <Column gap="sm">
            <Text variant="label" tone="danger">
              Camera unavailable
            </Text>
            <Text variant="caption" tone="muted">
              {streamError.message}
            </Text>
            <Row gap="sm" wrap>
              <Button variant="primary" onClick={handleStartPoseDebug}>
                Try again
              </Button>
              <Button variant="ghost" onClick={handleBackToSetup}>
                Back to setup
              </Button>
            </Row>
          </Column>
        </Card>
      ) : null}

      <Row gap="sm" wrap>
        {!cameraActive ? (
          <Button
            variant="primary"
            leftIcon={<Icon icon={Camera} size="sm" />}
            onClick={handleStartPoseDebug}
            disabled={streamStatus === 'requesting' || pose.status === 'loading-model'}
            loading={streamStatus === 'requesting' || pose.status === 'loading-model'}
            loadingLabel="Starting pose debug…"
          >
            Start pose debug
          </Button>
        ) : (
          <Button
            variant="secondary"
            leftIcon={<Icon icon={Square} size="sm" />}
            onClick={handleStopPoseDebug}
          >
            Stop pose debug
          </Button>
        )}

        <Button
          variant="ghost"
          leftIcon={<Icon icon={ArrowLeft} size="sm" />}
          onClick={handleBackToSetup}
        >
          Back to setup
        </Button>
        <Button variant="ghost" onClick={handleBackToDetail}>
          Back to workout detail
        </Button>
      </Row>

      <PoseDebugPanel
        status={pose.status}
        stats={pose.stats}
        latestFrame={pose.latestFrame}
        latestProcessedFrame={pose.latestProcessedFrame}
        processingStats={pose.processingStats}
        visibilityReport={pose.visibilityReport}
        bodyVisibilityStatus={pose.bodyVisibilityStatus}
        processingConfig={pose.processingConfig}
        error={pose.error}
        modelVariant={pose.modelVariant}
        delegate={pose.delegate}
        overlayEnabled={overlayEnabled}
        overlayMode={overlayMode}
        onToggleOverlay={() => setOverlayEnabled((current) => !current)}
        onChangeOverlayMode={setOverlayMode}
      />

      <Text variant="caption" tone="muted">
        Phase 18 scope reminder: no rep counter, no form score, no calories, no workout timer, no
        completion summary, and no workout history are produced on this screen. Joint angles arrive
        in Phase 19; rep counting in Phase 20; form scoring and coaching in later phases
        {poseRunning ? '. Pose inference is currently active.' : '.'}
      </Text>
    </section>
  );
}
