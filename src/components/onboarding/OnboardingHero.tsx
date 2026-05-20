import exerciseHeroImage from '@assets/onboarding/exercise-hero.png';

export function OnboardingHero(): JSX.Element {
  return (
    <div
      className="mx-auto flex h-44 w-full max-w-sm items-center justify-center sm:h-52"
      aria-hidden="true"
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[2rem] bg-motionly-bg-light dark:bg-motionly-bg-light">
        <img
          src={exerciseHeroImage}
          alt=""
          className="h-full w-full object-contain object-center brightness-[1.035] contrast-[1.02]"
          style={{
            WebkitMaskImage:
              'radial-gradient(ellipse 78% 76% at 50% 50%, black 58%, rgba(0, 0, 0, 0.88) 72%, transparent 100%)',
            maskImage:
              'radial-gradient(ellipse 78% 76% at 50% 50%, black 58%, rgba(0, 0, 0, 0.88) 72%, transparent 100%)',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
