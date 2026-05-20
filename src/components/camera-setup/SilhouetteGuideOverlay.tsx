import { cn } from '@utils/cn';

type SilhouetteGuideOverlayProps = {
  ready: boolean;
};

export function SilhouetteGuideOverlay({ ready }: SilhouetteGuideOverlayProps): JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
      <div
        className={cn(
          'relative flex h-full max-h-[92%] w-full max-w-[72%] items-center justify-center rounded-[2rem] transition-colors duration-200',
          ready
            ? 'ring-2 ring-motionly-accent shadow-[0_0_40px_rgba(22,163,74,0.28)]'
            : 'shadow-[0_0_28px_rgba(15,23,42,0.25)]',
        )}
        aria-hidden="true"
      >
        <img
          src="/full_body_camera.png"
          alt=""
          className={cn(
            'h-[88%] w-[88%] object-contain opacity-55 brightness-0 invert drop-shadow-[0_2px_2px_rgba(0,0,0,0.55)]',
            ready &&
              'opacity-75 brightness-100 invert-0 sepia saturate-[4] hue-rotate-[70deg] drop-shadow-[0_0_10px_rgba(22,163,74,0.65)]',
          )}
          draggable={false}
        />

        <div className="absolute inset-x-3 bottom-3 rounded-full bg-motionly-neutral-950/70 px-3 py-2 text-center text-caption font-medium text-white backdrop-blur">
          Fit your full body inside the guide
        </div>
      </div>
    </div>
  );
}
