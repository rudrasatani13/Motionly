import { useEffect, type ReactNode, type RefObject } from 'react';
import { Camera } from 'lucide-react';

import type { CameraFacingMode } from '@/types/camera-setup';
import { Card, Icon, Text } from '@components/primitives';
import { cn } from '@utils/cn';

type CameraPreviewProps = {
  stream: MediaStream | null;
  facingMode: CameraFacingMode;
  videoRef: RefObject<HTMLVideoElement>;
  children?: ReactNode;
};

export function CameraPreview({
  stream,
  facingMode,
  videoRef,
  children,
}: CameraPreviewProps): JSX.Element {
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
    if (typeof playResult.catch === 'function') {
      playResult.catch(() => undefined);
    }

    return () => {
      if (video.srcObject === stream) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, [stream, videoRef]);

  if (stream === null) {
    return (
      <Card
        variant="outlined"
        padding="lg"
        className="flex aspect-[4/5] min-h-[360px] flex-col items-center justify-center gap-3 text-center"
      >
        <Icon icon={Camera} size="xl" tone="muted" />
        <Text variant="h3" as="p">
          Camera preview is off
        </Text>
        <Text tone="muted" className="max-w-sm">
          Tap Turn on camera when you are ready. Motionly will not request camera access on page
          load.
        </Text>
      </Card>
    );
  }

  return (
    <section
      aria-label="Live camera setup preview"
      className="overflow-hidden rounded-3xl border border-motionly-neutral-200 bg-motionly-neutral-950 shadow-sm dark:border-motionly-neutral-800"
    >
      <div className="relative aspect-[4/5] min-h-[360px] max-h-[72dvh] w-full overflow-hidden bg-motionly-neutral-950 sm:aspect-[4/3]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-hidden="true"
          className={cn('h-full w-full object-cover', facingMode === 'user' && 'scale-x-[-1]')}
        />
        {children}
      </div>
      <div className="border-t border-white/10 px-4 py-3">
        <Text variant="caption" tone="inherit" className="text-motionly-neutral-200">
          Live preview only. The front camera preview is mirrored so positioning feels natural.
        </Text>
      </div>
    </section>
  );
}
