import { Capacitor } from '@capacitor/core';
export const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
if (apiBase && !apiBase.startsWith('https://') && !apiBase.startsWith('http://10.0.2.2') && !apiBase.startsWith('http://localhost') && !apiBase.startsWith('http://192.168.')) throw new Error('Use an HTTPS API base URL for production.');
if (Capacitor.isNativePlatform()) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const absolute = new URL(url, window.location.origin);
    if (absolute.origin === window.location.origin && absolute.pathname.startsWith('/api/')) {
      if (!apiBase) return Promise.reject(new Error('Backend not configured. Set VITE_API_BASE_URL and rebuild.'));
      const target = apiBase + absolute.pathname + absolute.search;
      return originalFetch(input instanceof Request ? new Request(target, input) : target, init);
    }
    return originalFetch(input, init);
  };
  document.documentElement.classList.add('native-pilgrim');
}
