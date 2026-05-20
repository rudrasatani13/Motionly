import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';

import { findWorkoutDetailById } from '@/data/workout-library';
import type {
  CameraFacingMode,
  CameraSetupError,
  CameraSetupReadinessStatus,
  CameraStreamStatus,
} from '@/types/camera-setup';
import {
  CameraPermissionState,
  CameraPreview,
  CameraSetupActions,
  CameraSetupChecklist,
  CameraSetupErrorState,
  CameraSetupHeader,
  LightingStatusCard,
  PlacementInstructionsPanel,
  SilhouetteGuideOverlay,
} from '@components/camera-setup';
import { EmptyState, SkeletonLoader, useToast } from '@components/feedback';
import { Button, Card, Column, Icon, Text } from '@components/primitives';
import { WorkoutNotFoundState } from '@components/workout-detail';
import { useCameraLightingCheck } from '@hooks/useCameraLightingCheck';
import { useNavigation } from '@hooks/useNavigation';
import {
  isCameraStreamActive,
  requestCameraStreamForSetup,
  stopCameraStream,
} from '@platform/camera-stream';
import {
  cancelSetupInstructionSpeech,
  isSetupSpeechSupported,
  speakSetupInstruction,
} from '@platform/speech';
import type { WorkoutSetupRouteParams } from '@router/routeTypes';

const SETUP_INSTRUCTION_TEXT =
  'Step back until your full body is visible. Place your phone at hip height facing you.';

type CameraStreamRequestResult = Awaited<ReturnType<typeof requestCameraStreamForSetup>>;
type CameraStreamFailureResult = Exclude<CameraStreamRequestResult, { kind: 'granted' }>;

function readinessStatus(
  cameraActive: boolean,
  lightingOkay: boolean,
  userConfirmedAlignment: boolean,
): CameraSetupReadinessStatus {
  if (!cameraActive) {
    return 'camera_needed';
  }
  if (!lightingOkay) {
    return 'lighting_needs_attention';
  }
  if (!userConfirmedAlignment) {
    return 'needs_user_confirmation';
  }
  return 'ready';
}

function errorFromResult(result: CameraStreamFailureResult): CameraSetupError {
  return { kind: result.errorKind, message: result.message };
}

export default function CameraSetupPage(): JSX.Element {
  const { id } = useParams<WorkoutSetupRouteParams>();
  const navigation = useNavigation();
  const toast = useToast();

  const workout = useMemo(() => (id === undefined ? undefined : findWorkoutDetailById(id)), [id]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(false);

  const [facingMode, setFacingMode] = useState<CameraFacingMode>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [streamStatus, setStreamStatus] = useState<CameraStreamStatus>('idle');
  const [streamError, setStreamError] = useState<CameraSetupError | null>(null);
  const [lightingManuallyAccepted, setLightingManuallyAccepted] = useState(false);
  const [userConfirmedAlignment, setUserConfirmedAlignment] = useState(false);

  const cameraActive = streamStatus === 'granted' && isCameraStreamActive(stream);
  const lighting = useCameraLightingCheck(videoRef, cameraActive);
  const lightingOkay = lighting.status === 'good' || lightingManuallyAccepted;
  const readyStatus = readinessStatus(cameraActive, lightingOkay, userConfirmedAlignment);
  const guideReady = cameraActive && lightingOkay && userConfirmedAlignment;
  const speechSupported = isSetupSpeechSupported();

  const releaseVideoAndStream = useCallback((): void => {
    const currentVideo = videoRef.current;
    if (currentVideo !== null) {
      currentVideo.pause();
      currentVideo.srcObject = null;
    }

    stopCameraStream(streamRef.current);
    streamRef.current = null;
  }, []);

  const clearAndStopStream = useCallback((): void => {
    releaseVideoAndStream();
    setStream(null);
  }, [releaseVideoAndStream]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      releaseVideoAndStream();
      cancelSetupInstructionSpeech();
    };
  }, [releaseVideoAndStream]);

  useEffect(() => {
    if (stream === null) {
      return undefined;
    }

    const handleEnded = (): void => {
      if (!mountedRef.current) {
        return;
      }
      clearAndStopStream();
      setStreamStatus('error');
      setStreamError({
        kind: 'unreadable',
        message: 'The camera stream stopped. Turn the camera on again to continue setup.',
      });
      setLightingManuallyAccepted(false);
      setUserConfirmedAlignment(false);
    };

    const tracks = stream.getTracks();
    tracks.forEach((track) => track.addEventListener('ended', handleEnded));

    return () => {
      tracks.forEach((track) => track.removeEventListener('ended', handleEnded));
    };
  }, [clearAndStopStream, stream]);

  const handleTurnOnCamera = useCallback(async (): Promise<void> => {
    clearAndStopStream();
    setStreamStatus('requesting');
    setStreamError(null);
    setLightingManuallyAccepted(false);
    setUserConfirmedAlignment(false);

    const result = await requestCameraStreamForSetup('user');

    if (!mountedRef.current) {
      if (result.kind === 'granted') {
        stopCameraStream(result.stream);
      }
      return;
    }

    if (result.kind === 'granted') {
      streamRef.current = result.stream;
      setStream(result.stream);
      setFacingMode(result.facingMode);
      setStreamStatus('granted');
      return;
    }

    setStream(null);
    streamRef.current = null;
    setStreamStatus(result.kind === 'denied' ? 'denied' : result.kind);
    setStreamError(errorFromResult(result));
  }, [clearAndStopStream]);

  const handleBackToDetails = useCallback((): void => {
    cancelSetupInstructionSpeech();
    clearAndStopStream();
    if (workout !== undefined) {
      navigation.goToWorkoutDetail(workout.id);
      return;
    }
    navigation.goToWorkouts();
  }, [clearAndStopStream, navigation, workout]);

  const handleContinue = useCallback((): void => {
    if (workout === undefined || readyStatus !== 'ready') {
      return;
    }
    cancelSetupInstructionSpeech();
    clearAndStopStream();
    navigation.goToWorkoutActive(workout.id);
  }, [clearAndStopStream, navigation, readyStatus, workout]);

  const handleSkipSetup = useCallback((): void => {
    if (workout === undefined) {
      return;
    }
    cancelSetupInstructionSpeech();
    clearAndStopStream();
    toast.show({
      tone: 'info',
      title: 'Continuing without setup check',
      message: 'Later pose detection may ask you to adjust your position.',
    });
    navigation.goToWorkoutActive(workout.id);
  }, [clearAndStopStream, navigation, toast, workout]);

  const handleOpenPermissionsHelp = useCallback((): void => {
    cancelSetupInstructionSpeech();
    clearAndStopStream();
    navigation.goToPermissions();
  }, [clearAndStopStream, navigation]);

  const handleLockedWorkout = useCallback((): void => {
    toast.show({
      tone: 'info',
      title: 'Pro workout locked',
      message:
        'Paid plans are implemented in a later phase. Opening the paywall placeholder for now.',
    });
    navigation.goToPaywall();
  }, [navigation, toast]);

  const handlePlayVoiceInstruction = useCallback((): void => {
    const result = speakSetupInstruction(SETUP_INSTRUCTION_TEXT);
    if (result.kind === 'unsupported') {
      toast.show({ tone: 'info', message: 'Voice instruction unavailable on this browser.' });
      return;
    }
    if (result.kind === 'error') {
      toast.show({ tone: 'warning', message: result.message });
    }
  }, [toast]);

  if (id === undefined || workout === undefined) {
    return <WorkoutNotFoundState onBackToLibrary={navigation.goToWorkouts} />;
  }

  if (workout.accessTier === 'pro') {
    return (
      <section className="mx-auto flex w-full flex-col px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
        <EmptyState
          headingAs="h1"
          title="This workout is locked"
          description="Camera setup is only available for free workouts right now. Real subscription access arrives in a later phase."
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
      aria-labelledby="camera-setup-heading"
      className="mx-auto flex w-full flex-col gap-6 px-4 pb-8 pt-6 sm:px-6 sm:pt-8"
    >
      <CameraSetupHeader workoutName={workout.name} streamStatus={streamStatus} />

      <CameraPreview stream={stream} facingMode={facingMode} videoRef={videoRef}>
        <SilhouetteGuideOverlay ready={guideReady} />
      </CameraPreview>

      {streamStatus === 'requesting' ? (
        <Card variant="outlined" padding="lg" role="status" aria-live="polite">
          <Column gap="md">
            <SkeletonLoader shape="block" height="h-16" />
            <Text tone="muted">Waiting for the browser camera prompt...</Text>
          </Column>
        </Card>
      ) : null}

      {streamStatus === 'idle' ? (
        <CameraPermissionState status={streamStatus} onTurnOnCamera={handleTurnOnCamera} />
      ) : null}

      {streamError !== null &&
      (streamStatus === 'denied' || streamStatus === 'unavailable' || streamStatus === 'error') ? (
        <CameraSetupErrorState
          error={streamError}
          onRetry={handleTurnOnCamera}
          onBackToDetails={handleBackToDetails}
          onOpenPermissions={handleOpenPermissionsHelp}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <LightingStatusCard
          status={lighting.status}
          averageBrightness={lighting.averageBrightness}
          errorMessage={lighting.errorMessage}
          manuallyAccepted={lightingManuallyAccepted}
          canManuallyAccept={
            cameraActive &&
            (lighting.status === 'too_dark' ||
              lighting.status === 'too_bright' ||
              lighting.status === 'error')
          }
          onManualAccept={() => setLightingManuallyAccepted(true)}
        />

        <PlacementInstructionsPanel
          speechSupported={speechSupported}
          onPlayVoiceInstruction={handlePlayVoiceInstruction}
        />
      </div>

      <CameraSetupChecklist
        cameraActive={cameraActive}
        lightingStatus={lighting.status}
        lightingAccepted={lightingOkay}
        userConfirmedAlignment={userConfirmedAlignment}
      />

      <CameraSetupActions
        cameraActive={cameraActive}
        readinessStatus={readyStatus}
        userConfirmedAlignment={userConfirmedAlignment}
        onToggleAlignment={() => setUserConfirmedAlignment((current) => !current)}
        onContinue={handleContinue}
        onBackToDetails={handleBackToDetails}
        onSkipSetup={handleSkipSetup}
      />
    </section>
  );
}
