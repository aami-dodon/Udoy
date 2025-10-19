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
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-lg font-medium">Checking service health…</p>
      </main>
    );
  }

  if (status === STATUS.error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-rose-950 text-rose-100">
        <div className="space-y-2 text-center">
          <p className="text-xl font-semibold">Service unavailable</p>
          <p className="text-sm opacity-80">{errorMessage}</p>
        </div>
      </main>
    );
  }

  if (!healthData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-lg font-medium">No health data available.</p>
      </main>
    );
  }

  const checks = healthData?.checks ?? {};
  const corsInfo = healthData?.cors;

  const statusBadgeClasses = {
    up: 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200',
    down: 'border-rose-400/60 bg-rose-500/15 text-rose-200',
    skipped: 'border-slate-500/60 bg-slate-500/15 text-slate-200',
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <section className="w-full max-w-3xl space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl shadow-black/30">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Udoy API health</p>
          <h1 className="text-3xl font-semibold">
            {healthData?.status === 'ok' ? 'All systems operational' : 'Degraded performance detected'}
          </h1>
          <p className="text-sm text-slate-400">
            Last checked {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleString() : 'just now'}
          </p>
        </header>

        <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-6 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Uptime</p>
            <p className="mt-1 text-xl font-semibold">{formatUptime(healthData?.uptime)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">CORS</p>
            <p className="mt-1 text-sm">
              {corsInfo?.enabled ? 'Enabled' : 'Disabled'}
              {corsInfo?.allowedOrigins?.length ? (
                <span className="block text-xs text-slate-400">
                  Allowed origins: {corsInfo.allowedOrigins.join(', ')}
                </span>
              ) : (
                <span className="block text-xs text-slate-400">No origins configured</span>
              )}
            </p>
          </div>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-slate-200">Service checks</h2>
          <ul className="mt-4 space-y-3">
            {Object.entries(checks).map(([name, detail]) => {
              const badgeClass = statusBadgeClasses[detail.status] || statusBadgeClasses.skipped;
              return (
                <li key={name} className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-medium capitalize">{name}</p>
                    {detail.message && <p className="text-sm text-slate-400">{detail.message}</p>}
                    {detail.bucket && (
                      <p className="text-xs text-slate-500">Bucket: {detail.bucket}</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-sm font-medium ${badgeClass}`}>
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
