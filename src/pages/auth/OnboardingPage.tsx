import { RoutePlaceholder } from '@components/routing/RoutePlaceholder';

export default function OnboardingPage(): JSX.Element {
  return (
    <RoutePlaceholder
      routeName="Onboarding"
      routePath="/onboarding"
      phaseNote="Onboarding route is wired. The real onboarding screens (goal, fitness level, limitations, camera tutorial) are implemented in Phases 11–12."
    />
  );
}
