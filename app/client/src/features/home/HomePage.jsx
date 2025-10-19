import { useEffect, useState } from 'react';
import axios from 'axios';

const STATUS = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  error: 'error',
};

const EMAIL_STATUS = {
  idle: 'idle',
  sending: 'sending',
  success: 'success',
  error: 'error',
};

function HomePage() {
  const [status, setStatus] = useState(STATUS.idle);
  const [errorMessage, setErrorMessage] = useState('');
  const [healthData, setHealthData] = useState(null);
  const [emailForm, setEmailForm] = useState({
    to: '',
    type: 'verification',
    name: '',
  });
  const [emailStatus, setEmailStatus] = useState(EMAIL_STATUS.idle);
  const [emailError, setEmailError] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const buildApiUrl = (path) => {
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    const normalizedBase = baseUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  };

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
        const url = buildApiUrl('/health');
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

  const handleEmailFieldChange = (event) => {
    const { name, value } = event.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
    if (emailStatus !== EMAIL_STATUS.idle) {
      setEmailStatus(EMAIL_STATUS.idle);
      setEmailError('');
      setEmailMessage('');
    }
  };

  const handleSendTestEmail = async (event) => {
    event.preventDefault();
    if (!emailForm.to) {
      setEmailStatus(EMAIL_STATUS.error);
      setEmailError('Please enter a recipient email address.');
      return;
    }

    setEmailStatus(EMAIL_STATUS.sending);
    setEmailError('');
    setEmailMessage('');

    try {
      const url = buildApiUrl('/email/test');
      const payload = {
        to: emailForm.to,
        type: emailForm.type,
        name: emailForm.name || undefined,
      };

      const { data } = await axios.post(url, payload);
      setEmailStatus(EMAIL_STATUS.success);
      setEmailMessage(data?.message || 'Test email sent successfully.');
    } catch (error) {
      setEmailStatus(EMAIL_STATUS.error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to send test email.';
      setEmailError(message);
    }
  };

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

        <section className="rounded-2xl border border-brand-800/60 bg-brand-950/50 p-6">
          <h2 className="text-heading-md font-semibold text-clay-50">Send a test email</h2>
          <p className="mt-2 text-body-sm text-clay-300">
            Use your SMTP configuration to send either a verification or password reset email.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSendTestEmail}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-body-sm font-medium text-clay-200" htmlFor="email-to">
                Recipient email
                <input
                  id="email-to"
                  name="to"
                  type="email"
                  required
                  value={emailForm.to}
                  onChange={handleEmailFieldChange}
                  className="w-full rounded-xl border border-brand-700/60 bg-brand-900/80 px-4 py-3 text-body-sm text-clay-100 placeholder:text-clay-500 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                  placeholder="name@example.com"
                />
              </label>

              <label className="space-y-2 text-body-sm font-medium text-clay-200" htmlFor="email-name">
                Recipient name (optional)
                <input
                  id="email-name"
                  name="name"
                  type="text"
                  value={emailForm.name}
                  onChange={handleEmailFieldChange}
                  className="w-full rounded-xl border border-brand-700/60 bg-brand-900/80 px-4 py-3 text-body-sm text-clay-100 placeholder:text-clay-500 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                  placeholder="Udoy Tester"
                />
              </label>
            </div>

            <label className="block space-y-2 text-body-sm font-medium text-clay-200" htmlFor="email-type">
              Email type
              <select
                id="email-type"
                name="type"
                value={emailForm.type}
                onChange={handleEmailFieldChange}
                className="w-full rounded-xl border border-brand-700/60 bg-brand-900/80 px-4 py-3 text-body-sm text-clay-100 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
              >
                <option value="verification">Verification email</option>
                <option value="passwordReset">Password reset email</option>
              </select>
            </label>

            {emailStatus === EMAIL_STATUS.error && (
              <p className="rounded-xl border border-danger-500/60 bg-danger-500/10 px-4 py-3 text-body-sm text-danger-100">
                {emailError}
              </p>
            )}

            {emailStatus === EMAIL_STATUS.success && (
              <p className="rounded-xl border border-success-500/60 bg-success-500/10 px-4 py-3 text-body-sm text-success-100">
                {emailMessage}
              </p>
            )}

            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-accent-500 px-5 py-3 text-body-sm font-semibold text-brand-950 transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={emailStatus === EMAIL_STATUS.sending}
              >
                {emailStatus === EMAIL_STATUS.sending ? 'Sending…' : 'Send test email'}
              </button>
              {emailStatus === EMAIL_STATUS.sending && (
                <span className="text-body-sm text-clay-300">Dispatching email…</span>
              )}
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}

export default HomePage;
