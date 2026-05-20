import { RefreshCw } from 'lucide-react';

import { Button, Icon } from '@components/primitives';

type DashboardRefreshControlProps = {
  isRefreshing: boolean;
  disabled?: boolean;
  onRefresh: () => void | Promise<void>;
};

export function DashboardRefreshControl({
  isRefreshing,
  disabled = false,
  onRefresh,
}: DashboardRefreshControlProps): JSX.Element {
  function handleRefresh(): void {
    try {
      void Promise.resolve(onRefresh()).catch(() => undefined);
    } catch {
      // Refresh failures stay local and silent; the next tap can retry.
    }
  }

  return (
    <Button
      variant="icon"
      size="md"
      aria-label={isRefreshing ? 'Refreshing dashboard data' : 'Refresh dashboard data'}
      disabled={disabled}
      loading={isRefreshing}
      onClick={handleRefresh}
    >
      <Icon icon={RefreshCw} size="md" />
    </Button>
  );
}
