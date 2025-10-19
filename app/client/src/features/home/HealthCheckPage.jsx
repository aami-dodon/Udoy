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

function HealthCheckPage() {
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

  const resetEmailFeedback = () => {
    setEmailStatus(EMAIL_STATUS.idle);
    setEmailError('');
    setEmailMessage('');
  };

  if (status === STATUS.loading || status === STATUS.idle) {
    return (
      <main className="page-shell page-shell--center">
        <section className="page-container flex-center">
          <div className="empty-state max-w-content-sm">
            <div className="spinner" aria-hidden="true" />
            <div className="stack-sm">
              <p className="text-heading-sm text-on-surface font-semibold">Checking service health…</p>
              <p className="text-body-sm text-subdued">Please wait while we ping the Udoy services.</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (status === STATUS.error) {
    return (
      <main className="page-shell page-shell--center">
        <section className="page-container flex-center">
          <div className="card card--brand stack-md max-w-content-sm text-balance">
            <h1 className="text-heading-lg text-on-surface font-semibold">Service unavailable</h1>
            <p className="text-body-sm text-subdued">{errorMessage}</p>
            <div className="alert alert--danger">
              <p className="text-body-sm">Review your environment configuration and try again.</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!healthData) {
    return (
      <main className="page-shell page-shell--center">
        <section className="page-container flex-center">
          <div className="empty-state max-w-content-sm">
            <div className="stack-sm">
              <p className="text-heading-sm text-on-surface font-semibold">No health data available.</p>
              <p className="text-body-sm text-subdued">Try refreshing this page to request a fresh status report.</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const checks = healthData?.checks ?? {};
  const corsInfo = healthData?.cors;
  const isHealthy = healthData?.status === 'ok';

  const handleEmailFieldChange = (event) => {
    const { name, value } = event.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
    if (emailStatus !== EMAIL_STATUS.idle) {
      resetEmailFeedback();
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
        error?.response?.data?.message || error?.message || 'Failed to send test email.';
      setEmailError(message);
    }
  };

  const statusBadgeClasses = {
    up: 'badge badge--success',
    down: 'badge badge--danger',
    skipped: 'badge badge--neutral',
  };

  return (
    <main className="page-shell">
      <section className="page-container stack-xl">
        <header className="card hero-gradient shadow-raised border border-neutral-800/60 stack-lg text-balance">
          <div className="stack-sm">
            <span className="badge badge--info w-fit">Udoy platform</span>
            <h1 className="text-display-lg text-on-surface font-semibold">
              {isHealthy ? 'All systems operational' : 'Degraded performance detected'}
            </h1>
            <p className="text-body-sm text-subdued">
              Last checked {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleString() : 'just now'}
            </p>
          </div>

          <div className="grid-fit-sm">
            <div className="card card--inset stack-sm">
              <span className="badge badge--neutral w-fit">Uptime</span>
              <p className="text-heading-lg text-on-surface font-semibold">{formatUptime(healthData?.uptime)}</p>
              <p className="text-body-xs text-subdued">Calculated since the most recent server start.</p>
            </div>

            <div className="card card--inset stack-sm">
              <span className="badge badge--neutral w-fit">CORS</span>
              <p className="text-body-base text-on-surface font-medium">
                {corsInfo?.enabled ? 'Enabled' : 'Disabled'}
              </p>
              {corsInfo?.allowedOrigins?.length ? (
                <p className="text-body-xs text-subdued">
                  Allowed origins: {corsInfo.allowedOrigins.join(', ')}
                </p>
              ) : (
                <p className="text-body-xs text-subdued">No origins configured</p>
              )}
            </div>
          </div>
        </header>

        <section className="card card--muted stack-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="card__title">Service checks</h2>
            <span className={isHealthy ? 'badge badge--success' : 'badge badge--warning'}>
              {isHealthy ? 'Stable' : 'Needs attention'}
            </span>
          </div>
          <ul className="stack-md">
            {Object.entries(checks).map(([name, detail]) => {
              const badgeClass = statusBadgeClasses[detail.status] || statusBadgeClasses.skipped;
              return (
                <li
                  key={name}
                  className="card card--inset grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="stack-sm">
                    <p className="text-heading-sm text-on-surface font-semibold capitalize">{name}</p>
                    {detail.message && <p className="text-body-sm text-subdued">{detail.message}</p>}
                    {detail.bucket && (
                      <p className="text-body-xs text-subdued">Bucket: {detail.bucket}</p>
                    )}
                  </div>
                  <span className={badgeClass}>{detail.status}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card card--muted stack-lg">
          <div className="card__header">
            <h2 className="card__title">Send a test email</h2>
            <p className="card__subtitle">
              Use your SMTP configuration to send either a verification or password reset email.
            </p>
          </div>

          <form className="stack-md" onSubmit={handleSendTestEmail}>
            <div className="form-grid">
              <label className="field" htmlFor="email-to">
                <span className="field__label">Recipient email</span>
                <input
                  id="email-to"
                  name="to"
                  type="email"
                  required
                  value={emailForm.to}
                  onChange={handleEmailFieldChange}
                  className="input"
                  placeholder="name@example.com"
                />
              </label>

              <label className="field" htmlFor="email-name">
                <span className="field__label">Recipient name (optional)</span>
                <input
                  id="email-name"
                  name="name"
                  type="text"
                  value={emailForm.name}
                  onChange={handleEmailFieldChange}
                  className="input"
                  placeholder="Udoy Tester"
                />
              </label>
            </div>

            <label className="field" htmlFor="email-type">
              <span className="field__label">Email type</span>
              <select
                id="email-type"
                name="type"
                value={emailForm.type}
                onChange={handleEmailFieldChange}
                className="select"
              >
                <option value="verification">Verification email</option>
                <option value="passwordReset">Password reset email</option>
              </select>
            </label>

            {emailStatus === EMAIL_STATUS.error && (
              <div className="alert alert--danger">
                <p className="text-body-sm text-on-surface">{emailError}</p>
              </div>
            )}

            {emailStatus === EMAIL_STATUS.success && (
              <div className="alert alert--success">
                <p className="text-body-sm text-on-surface">{emailMessage}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                className="btn btn--accent"
                disabled={emailStatus === EMAIL_STATUS.sending}
              >
                {emailStatus === EMAIL_STATUS.sending ? 'Sending…' : 'Send test email'}
              </button>
              {emailStatus === EMAIL_STATUS.sending && (
                <span className="text-body-sm text-subdued">Dispatching email…</span>
              )}
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}

export default HealthCheckPage;
