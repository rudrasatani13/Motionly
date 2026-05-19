import { RoutePlaceholder } from '@components/routing/RoutePlaceholder';

export default function PaywallPage(): JSX.Element {
  return (
    <RoutePlaceholder
      routeName="Paywall"
      routePath="/paywall"
      phaseNote="Paywall route is wired. Real subscription pricing, Stripe / Razorpay flows, and free-tier limits arrive in Phases 36–38."
    />
  );
}
