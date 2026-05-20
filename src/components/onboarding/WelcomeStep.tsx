import { Column, Heading, Text } from '@components/primitives';

import { OnboardingHero } from './OnboardingHero';

type WelcomeStepProps = {
  headingId: string;
};

export function WelcomeStep({ headingId }: WelcomeStepProps): JSX.Element {
  return (
    <Column gap="lg" className="flex-1 justify-start pt-3 sm:justify-center sm:pt-0">
      <OnboardingHero />
      <Column gap="md" className="text-center">
        <Heading id={headingId} level={1}>
          Your AI fitness coach lives in your camera.
        </Heading>
        <Text tone="muted" className="mx-auto max-w-md">
          Motionly is designed to watch your form on your device and give you one cue at a time.
          Video never leaves your phone.
        </Text>
      </Column>
    </Column>
  );
}
