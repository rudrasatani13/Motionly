import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';

type SWStatus = 'unsupported' | 'registering' | 'ready' | 'update-available' | 'error';

let registered = false;

export function registerServiceWorker(): void {
  if (registered) return;
  registered = true;

  if (!('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) return;

  const wb = new Workbox('/sw.js');

  wb.addEventListener('waiting', () => {
    window.dispatchEvent(new CustomEvent<SWStatus>('motionly:sw', { detail: 'update-available' }));
  });

  wb.addEventListener('activated', (event) => {
    if (!event.isUpdate) {
      window.dispatchEvent(new CustomEvent<SWStatus>('motionly:sw', { detail: 'ready' }));
    }
  });

  wb.register().catch(() => {
    window.dispatchEvent(new CustomEvent<SWStatus>('motionly:sw', { detail: 'error' }));
  });
}

export function useServiceWorkerStatus(): SWStatus {
  const [status, setStatus] = useState<SWStatus>(() => {
    if (!('serviceWorker' in navigator)) return 'unsupported';
    if (!import.meta.env.PROD) return 'unsupported';
    return 'registering';
  });

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<SWStatus>).detail;
      setStatus(detail);
    };
    window.addEventListener('motionly:sw', handler);
    return () => window.removeEventListener('motionly:sw', handler);
  }, []);

  return status;
}
