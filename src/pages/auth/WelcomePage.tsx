import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button, Column, Icon, Row, Text } from '@components/primitives';
import { useNavigation } from '@hooks/useNavigation';
import { ROUTE_PATHS } from '@router/routePaths';

export default function WelcomePage(): JSX.Element {
  const { goToOnboarding } = useNavigation();

  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] flex-1 flex-col px-3 py-6 sm:px-6 sm:py-10">
      <Column gap="xl" className="flex-1">
        <Text as="p" variant="label" tone="primary" className="font-semibold">
          Motionly
        </Text>

        <Column gap="lg" className="flex-1 justify-center">
          <Column gap="md">
            <Text as="h1" variant="h1" className="max-w-sm">
              Move Better.
            </Text>
            <Text tone="muted" className="max-w-lg">
              Motionly is a privacy-first movement coach for home workouts. This onboarding starts
              with your goals and fitness level so future camera-based coaching can stay focused,
              calm, and useful.
            </Text>
          </Column>

          <Row
            align="start"
            gap="sm"
            className="rounded-2xl border border-motionly-neutral-200 bg-motionly-neutral-50 p-4 dark:border-motionly-neutral-800 dark:bg-motionly-neutral-900"
          >
            <Icon icon={ShieldCheck} tone="accent" className="mt-0.5 shrink-0" />
            <Column gap="xs">
              <Text variant="label">Privacy-first by design.</Text>
              <Text variant="caption" tone="muted">
                Motionly&apos;s product direction is on-device form guidance: video stays on your
                device, and coaching is built around one cue at a time.
              </Text>
            </Column>
          </Row>
        </Column>

        <Column gap="md" className="pb-3">
          <Button
            fullWidth
            size="lg"
            rightIcon={<Icon icon={ArrowRight} />}
            onClick={goToOnboarding}
          >
            Get Started
          </Button>
          <Text variant="caption" tone="muted" className="text-center">
            Already have an account?{' '}
            <Link
              to={ROUTE_PATHS.login}
              className="font-medium text-motionly-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-motionly-primary focus-visible:ring-offset-2 focus-visible:ring-offset-motionly-bg-light dark:focus-visible:ring-offset-motionly-bg-dark"
            >
              Sign in
            </Link>
          </Text>
        </Column>
      </Column>
    </div>
  );
}
