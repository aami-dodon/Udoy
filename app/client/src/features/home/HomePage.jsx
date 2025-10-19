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

  useEffect(() => {
    const controller = new AbortController();

    async function fetchHealth() {
      setStatus(STATUS.loading);
      try {
        const baseUrl = import.meta.env.VITE_API_URL || '/api';
        const url = `${baseUrl.replace(/\/$/, '')}/health`;
        await axios.get(url, { signal: controller.signal });
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-emerald-950 text-emerald-50">
      <p className="text-4xl font-bold tracking-wide">OK</p>
    </main>
  );
}

export default HomePage;
