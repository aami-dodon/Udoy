import { useEffect, useState } from 'react';
import axios from 'axios';

const STATUS = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  error: 'error',
};

function HomePage() {
  const [status, setStatus] = useState(STATUS.idle);
  const [errorMessage, setErrorMessage] = useState('');
  const [healthData, setHealthData] = useState(null);

  const formatUptime = (seconds) => {
    if (typeof seconds !== 'number' || Number.isNaN(seconds)) {
      return 'Unknown';
    }

    const totalSeconds = Math.floor(seconds);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    const segments = [];
    if (days) segments.push(`${days}d`);
    if (hours || days) segments.push(`${hours}h`);
    if (minutes || hours || days) segments.push(`${minutes}m`);
    segments.push(`${remainingSeconds}s`);

    return segments.join(' ');
  };

  useEffect(() => {
    const controller = new AbortController();

    async function fetchHealth() {
      setStatus(STATUS.loading);
      try {
        const baseUrl = import.meta.env.VITE_API_URL || '/api';
        const url = `${baseUrl.replace(/\/$/, '')}/health`;
        const { data } = await axios.get(url, { signal: controller.signal });
        setHealthData(data);
        setStatus(STATUS.success);
      } catch (error) {
        if (!controller.signal.aborted) {
          setStatus(STATUS.error);
          setErrorMessage(error?.message ?? 'Unable to reach the server');
        }
      }
    }

    fetchHealth();

    return () => controller.abort();
  }, []);

  if (status === STATUS.loading || status === STATUS.idle) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-950 text-clay-100">
        <p className="text-body-lg font-medium">Checking service health…</p>
      </main>
    );
  }

  if (status === STATUS.error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-danger-950 text-danger-100">
        <div className="space-y-2 text-center">
          <p className="text-heading-md font-semibold">Service unavailable</p>
          <p className="text-body-sm text-danger-200/80">{errorMessage}</p>
        </div>
      </main>
    );
  }

  if (!healthData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-950 text-clay-100">
        <p className="text-body-lg font-medium">No health data available.</p>
      </main>
    );
  }

  const checks = healthData?.checks ?? {};
  const corsInfo = healthData?.cors;

  const statusBadgeClasses = {
    up: 'border-success-400/60 bg-success-500/15 text-success-100',
    down: 'border-danger-400/60 bg-danger-500/15 text-danger-100',
    skipped: 'border-clay-500/60 bg-clay-500/15 text-clay-100',
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-950 p-6 text-clay-100">
      <section className="w-full max-w-content-readable space-y-18 rounded-3xl border border-brand-800 bg-brand-900/70 p-10 shadow-elevated">
        <header className="space-y-3">
          <p className="text-eyebrow uppercase text-accent-300">Udoy API health</p>
          <h1 className="text-display-lg font-semibold text-clay-50">
            {healthData?.status === 'ok' ? 'All systems operational' : 'Degraded performance detected'}
          </h1>
          <p className="text-body-sm text-clay-200">
            Last checked {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleString() : 'just now'}
          </p>
        </header>

        <div className="grid gap-6 rounded-2xl border border-brand-800 bg-brand-950/60 p-8 sm:grid-cols-2">
          <div>
            <p className="text-eyebrow uppercase text-clay-300">Uptime</p>
            <p className="mt-2 text-heading-lg font-semibold text-clay-50">{formatUptime(healthData?.uptime)}</p>
          </div>
          <div>
            <p className="text-eyebrow uppercase text-clay-300">CORS</p>
            <p className="mt-2 text-body-sm">
              {corsInfo?.enabled ? 'Enabled' : 'Disabled'}
              {corsInfo?.allowedOrigins?.length ? (
                <span className="block text-body-sm text-clay-300">
                  Allowed origins: {corsInfo.allowedOrigins.join(', ')}
                </span>
              ) : (
                <span className="block text-body-sm text-clay-300">No origins configured</span>
              )}
            </p>
          </div>
        </div>

        <section>
          <h2 className="text-heading-md font-semibold text-clay-50">Service checks</h2>
          <ul className="mt-6 space-y-4">
            {Object.entries(checks).map(([name, detail]) => {
              const badgeClass = statusBadgeClasses[detail.status] || statusBadgeClasses.skipped;
              return (
                <li
                  key={name}
                  className="flex flex-col gap-3 rounded-2xl border border-brand-800/60 bg-brand-950/50 p-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-heading-sm font-medium capitalize text-clay-50">{name}</p>
                    {detail.message && <p className="text-body-sm text-clay-300">{detail.message}</p>}
                    {detail.bucket && (
                      <p className="text-body-sm text-clay-400">Bucket: {detail.bucket}</p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-body-sm font-semibold ${badgeClass}`}
                  >
                    {detail.status}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </section>
    </main>
  );
}

export default HomePage;
