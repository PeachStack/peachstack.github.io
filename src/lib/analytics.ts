declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Initialises Google Analytics 4 when VITE_GA_MEASUREMENT_ID is set.
 * Set the env var in .env (e.g. VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX) and
 * redeploy. Omit the variable (or leave it blank) to disable tracking entirely.
 */
export function initGA(): void {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
  if (!measurementId) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { anonymize_ip: true });
}
