import { cn } from '@utils/cn';

type SilhouetteGuideOverlayProps = {
  ready: boolean;
};

export function SilhouetteGuideOverlay({ ready }: SilhouetteGuideOverlayProps): JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
      <div
        className={cn(
          'relative flex h-full max-h-[92%] w-full max-w-[72%] items-center justify-center rounded-[2rem] border-2 border-dashed transition-colors duration-200',
          ready
            ? 'border-motionly-accent text-motionly-accent shadow-[0_0_40px_rgba(22,163,74,0.18)]'
            : 'border-white/80 text-white/90 shadow-[0_0_28px_rgba(15,23,42,0.25)] dark:border-motionly-neutral-100/80',
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 180 360"
          className="h-[82%] w-[82%]"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="7"
        >
          <circle cx="90" cy="48" r="28" />
          <path d="M90 86c-34 0-58 30-58 78v52c0 22 12 36 30 40l-18 70" />
          <path d="M90 86c34 0 58 30 58 78v52c0 22-12 36-30 40l18 70" />
          <path d="M58 152c-28 18-40 48-40 88" />
          <path d="M122 152c28 18 40 48 40 88" />
          <path d="M72 254l-20 82" />
          <path d="M108 254l20 82" />
        </svg>

        <div className="absolute inset-x-3 bottom-3 rounded-full bg-motionly-neutral-950/70 px-3 py-2 text-center text-caption font-medium text-white backdrop-blur">
          Fit your full body inside the guide
        </div>
      </div>
    </div>
  );
}
