let loadPromise: Promise<any> | null = null;

export async function loadGoogle() {
  // כבר טעון?
  if ((window as any)?.google?.maps?.places) return (window as any).google;
  if (loadPromise) return loadPromise;

  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error('GOOGLE_API_KEY_MISSING');

  // אם סקריפט כבר בעמוד — רק לחכות שיסתיים
  const existing =
    document.querySelector('script[data-google-maps-loader="1"]') ||
    document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');

  if (existing) {
    loadPromise = new Promise((resolve) => {
      const tick = () =>
        (window as any)?.google?.maps?.places
          ? resolve((window as any).google)
          : setTimeout(tick, 50);
      tick();
    });
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    (window as any).__gmaps_cb__ = () => resolve((window as any).google);
    const s = document.createElement('script');
    s.async = true; s.defer = true;
    s.onerror = () => reject(new Error('GOOGLE_SDK_LOAD_FAILED'));
    s.setAttribute('data-google-maps-loader', '1');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&language=he&callback=__gmaps_cb__`;
    document.head.appendChild(s);
  });

  return loadPromise;
}