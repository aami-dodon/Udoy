import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Textarea,
} from '@components/ui';
import { cn } from '@/lib/utils';
import { buildApiUrl } from '@/lib/api';
import { LucideIcon } from '../../../../shared/icons';

const HEALTH_ENDPOINT = buildApiUrl('/health');
const EMAIL_TEST_ENDPOINT = buildApiUrl('/email/test');

const DEFAULT_EMAIL_TEST_PAYLOAD = {
  to: 'test@example.com',
  type: 'verification',
  name: 'Udoy Tester',
  template: '',
  textTemplate: '',
  variables: {
    organization: 'Udoy',
  },
};

const STATUS_VARIANTS = {
  ok: 'bg-mint-sage/20 text-evergreen ring-1 ring-inset ring-mint-sage/40',
  up: 'bg-mint-sage/20 text-evergreen ring-1 ring-inset ring-mint-sage/40',
  error: 'bg-ecru/20 text-black-olive ring-1 ring-inset ring-ecru/40',
  down: 'bg-ecru/25 text-black-olive ring-1 ring-inset ring-ecru/40',
  skipped: 'bg-porcelain-tint text-neutral-600 ring-1 ring-inset ring-porcelain-shade',
  unknown: 'bg-porcelain text-neutral-600 ring-1 ring-inset ring-porcelain-shade',
};

const STATUS_LABELS = {
  ok: 'All Systems Operational',
  error: 'Attention Required',
  up: 'Up',
  down: 'Down',
  skipped: 'Skipped',
};

const OVERVIEW_HIGHLIGHTS = [
  {
    icon: 'Activity',
    label: 'Realtime uptime snapshots across every dependency.',
  },
  {
    icon: 'Inbox',
    label: 'One-click transactional email test to validate delivery.',
  },
  {
    icon: 'ShieldCheck',
    label: 'CORS, storage, and queue checks before launch windows.',
  },
];

function formatDuration(totalSeconds) {
  if (typeof totalSeconds !== 'number' || Number.isNaN(totalSeconds)) {
    return '—';
  }

  const seconds = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0 || remainingSeconds > 0) {
    parts.push(`${remainingSeconds}s`);
  }

  return parts.join(' ');
}

function formatTimestamp(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(date);
  } catch (error) {
    return date.toISOString();
  }
}

function resolveStatusClasses(status) {
  if (!status) return STATUS_VARIANTS.unknown;

  const normalized = status.toLowerCase();
  return STATUS_VARIANTS[normalized] || STATUS_VARIANTS.unknown;
}

function resolveStatusLabel(status) {
  if (!status) return 'Unknown';

  const normalized = status.toLowerCase();
  return STATUS_LABELS[normalized] || status;
}

function HealthPage() {
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailTestResult, setEmailTestResult] = useState(null);
  const [emailTestError, setEmailTestError] = useState(null);
  const [isEmailTestLoading, setIsEmailTestLoading] = useState(false);
  const [emailTestPayload, setEmailTestPayload] = useState(() => ({
    ...DEFAULT_EMAIL_TEST_PAYLOAD,
    variables: {
      ...DEFAULT_EMAIL_TEST_PAYLOAD.variables,
    },
  }));
  const isMountedRef = useRef(false);

  const handleEmailPayloadChange = useCallback((field, value) => {
    setEmailTestPayload((previous) => ({
      ...previous,
      [field]: value,
    }));
  }, []);

  const handleEmailPayloadVariableChange = useCallback((field, value) => {
    setEmailTestPayload((previous) => ({
      ...previous,
      variables: {
        ...(previous.variables || {}),
        [field]: value,
      },
    }));
  }, []);

  const loadHealth = useCallback(async () => {
    if (isMountedRef.current) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await fetch(HEALTH_ENDPOINT, {
        headers: {
          Accept: 'application/json',
        },
      });

      let payload = null;

      try {
        payload = await response.json();
      } catch (parseError) {
        throw new Error(`Unable to parse health response (status ${response.status})`);
      }

      if (isMountedRef.current) {
        setHealth(payload);
        setError(null);
      }
    } catch (requestError) {
      if (!isMountedRef.current) return;

      setError(requestError?.message || 'Failed to load health status.');
      setHealth(null);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const sendEmailTest = useCallback(async () => {
    if (isMountedRef.current) {
      setIsEmailTestLoading(true);
      setEmailTestError(null);
      setEmailTestResult(null);
    }

    try {
      const response = await fetch(EMAIL_TEST_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailTestPayload),
      });

      let payload = null;

      try {
        payload = await response.json();
      } catch (parseError) {
        throw new Error(`Unable to parse email test response (status ${response.status})`);
      }

      if (!response.ok) {
        const message =
          typeof payload?.message === 'string' && payload.message.trim().length > 0
            ? payload.message
            : `Email test failed with status ${response.status}`;

        throw new Error(message);
      }

      if (isMountedRef.current) {
        setEmailTestResult(payload);
        setEmailTestError(null);
      }
    } catch (requestError) {
      if (!isMountedRef.current) return;

      setEmailTestError(requestError?.message || 'Failed to send test email.');
      setEmailTestResult(null);
    } finally {
      if (isMountedRef.current) {
        setIsEmailTestLoading(false);
      }
    }
  }, [emailTestPayload]);

  useEffect(() => {
    isMountedRef.current = true;
    loadHealth();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadHealth]);

  const formattedTimestamp = useMemo(() => formatTimestamp(health?.timestamp), [health?.timestamp]);
  const formattedUptime = useMemo(() => formatDuration(health?.uptime), [health?.uptime]);
  const healthStatusLabel = useMemo(() => resolveStatusLabel(health?.status), [health?.status]);
  const healthStatusClasses = useMemo(() => resolveStatusClasses(health?.status), [health?.status]);
  const checks = useMemo(() => Object.entries(health?.checks || {}), [health?.checks]);
  const corsDetails = health?.cors || null;

  const isHealthy = health?.status?.toLowerCase() === 'ok';

  return (
    <main className="relative min-h-screen overflow-hidden bg-porcelain">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-28 h-[26rem] w-[26rem] rounded-full bg-spotlight-gradient opacity-80 blur-3xl" />
        <div className="absolute -bottom-32 right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-mint-sage/35 blur-3xl" />
      </div>
      <div className="container relative z-10 flex flex-col gap-16 py-16 md:py-24">
        <header className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] lg:items-end">
          <div className="space-y-6">
            <Badge variant="subtle" className="w-max">
              Operations
            </Badge>
            <h1 className="font-display text-4xl font-semibold text-black-olive md:text-5xl">
              Platform health dashboard
            </h1>
            <p className="body-large">
              Monitor uptime, dependencies, and transactional email delivery to keep Udoy reliable for every learner.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-neutral-600">
              {OVERVIEW_HIGHLIGHTS.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-gentle backdrop-blur"
                >
                  <LucideIcon name={item.icon} size="sm" className="text-evergreen" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-porcelain-shade bg-white/80 p-8 shadow-gentle backdrop-blur">
            <div className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">API endpoint</span>
                <span className="break-all text-sm text-neutral-600">{HEALTH_ENDPOINT}</span>
              </div>
              <Separator className="bg-porcelain-shade/80" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                    Last refreshed
                  </span>
                  <span className="text-sm text-neutral-600">
                    {isLoading && !health ? 'Loading…' : formattedTimestamp}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Server uptime</span>
                  <span className="text-sm text-neutral-600">{formattedUptime}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <Card className="transition-none hover:translate-y-0 hover:shadow-uplift">
          <CardHeader className="mb-8">
            <div className="flex flex-col gap-4 text-left sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <CardTitle>Live systems pulse</CardTitle>
                <CardDescription>
                  A quick snapshot of service readiness across the Udoy platform.
                </CardDescription>
              </div>
              <Button onClick={loadHealth} variant="outline" size="sm" disabled={isLoading}>
                {isLoading ? 'Refreshing…' : 'Refresh status'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-left">
            {error ? (
              <div className="rounded-2xl border border-ecru/60 bg-ecru/20 px-4 py-3 text-sm text-black-olive">
                {error}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                    Overall status
                  </span>
                  <span
                    className={cn(
                      'inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-gentle transition-colors',
                      healthStatusClasses,
                    )}
                  >
                    {isLoading && !health ? 'Loading…' : healthStatusLabel}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Last checked</span>
                  <span className="text-sm text-neutral-600">
                    {isLoading && !health ? 'Loading…' : formattedTimestamp}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Server uptime</span>
                  <span className="text-sm text-neutral-600">{formattedUptime}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">API endpoint</span>
                  <span className="break-all text-sm text-neutral-600">{HEALTH_ENDPOINT}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!error && health ? (
          <div className="grid gap-10 xl:grid-cols-[minmax(0,0.65fr)_minmax(0,1fr)]">
            <div className="space-y-10">
              <Card className="transition-none hover:translate-y-0 hover:shadow-uplift">
                <CardHeader>
                  <CardTitle>Dependency checks</CardTitle>
                  <CardDescription>Detailed availability across required services.</CardDescription>
                </CardHeader>
                <CardContent className="text-left">
                  {checks.length === 0 ? (
                    <p className="text-sm text-neutral-500">No health checks were reported.</p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {checks.map(([key, value]) => {
                        const statusLabel = resolveStatusLabel(value?.status);
                        const statusClasses = resolveStatusClasses(value?.status);

                        return (
                          <div key={key} className="rounded-2xl border border-porcelain-shade bg-white/80 p-5 shadow-gentle">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex flex-col gap-1 text-left">
                                <span className="text-sm font-semibold capitalize text-black-olive">{key}</span>
                                {value?.bucket ? (
                                  <span className="text-xs text-neutral-500">Bucket: {value.bucket}</span>
                                ) : null}
                                {value?.message ? (
                                  <span className="text-xs text-neutral-500">{value.message}</span>
                                ) : null}
                              </div>
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-gentle',
                                  statusClasses,
                                )}
                              >
                                {statusLabel}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {corsDetails ? (
                <Card className="transition-none hover:translate-y-0 hover:shadow-uplift">
                  <CardHeader>
                    <CardTitle>CORS configuration</CardTitle>
                    <CardDescription>Active cross-origin rules applied to the API gateway.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-left">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Enabled</span>
                      <span className="text-sm text-neutral-600">{corsDetails.enabled ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                        Allow credentials
                      </span>
                      <span className="text-sm text-neutral-600">{corsDetails.allowCredentials ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                        Allowed origins
                      </span>
                      {corsDetails.allowedOrigins?.length ? (
                        <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-600">
                          {corsDetails.allowedOrigins.map((origin) => (
                            <li key={origin}>{origin}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-neutral-500">No origins configured.</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <div className="space-y-10">
              <Card className="transition-none hover:translate-y-0 hover:shadow-uplift">
                <CardHeader>
                  <CardTitle>Transactional email test</CardTitle>
                  <CardDescription>
                    Trigger the /api/email/test endpoint to verify template rendering and delivery configuration.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-left">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Endpoint</span>
                    <span className="break-all text-sm text-neutral-600">{EMAIL_TEST_ENDPOINT}</span>
                  </div>
                  <Separator className="bg-porcelain-shade/80" />
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email-test-to">Recipient email</Label>
                        <Input
                          id="email-test-to"
                          type="email"
                          autoComplete="email"
                          value={emailTestPayload.to}
                          onChange={(event) => handleEmailPayloadChange('to', event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-test-name">Recipient name</Label>
                        <Input
                          id="email-test-name"
                          autoComplete="name"
                          value={emailTestPayload.name}
                          onChange={(event) => handleEmailPayloadChange('name', event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email-test-type">Template type</Label>
                        <Input
                          id="email-test-type"
                          autoComplete="off"
                          value={emailTestPayload.type}
                          onChange={(event) => handleEmailPayloadChange('type', event.target.value)}
                        />
                      </div>
                    </div>
                    {Object.entries(emailTestPayload.variables || {}).length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {Object.entries(emailTestPayload.variables || {}).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <Label htmlFor={`email-test-variable-${key}`}>Variable: {key}</Label>
                            <Input
                              id={`email-test-variable-${key}`}
                              autoComplete="off"
                              value={value ?? ''}
                              onChange={(event) =>
                                handleEmailPayloadVariableChange(key, event.target.value)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div className="space-y-2">
                      <Label htmlFor="email-test-template">HTML template</Label>
                      <Textarea
                        id="email-test-template"
                        value={emailTestPayload.template}
                        onChange={(event) => handleEmailPayloadChange('template', event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-test-text-template">Text template</Label>
                      <Textarea
                        id="email-test-text-template"
                        value={emailTestPayload.textTemplate}
                        onChange={(event) => handleEmailPayloadChange('textTemplate', event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button onClick={sendEmailTest} disabled={isEmailTestLoading}>
                      {isEmailTestLoading ? 'Sending…' : 'Send test email'}
                    </Button>
                    {emailTestError ? (
                      <div className="rounded-lg border border-ecru/60 bg-ecru/20 px-4 py-3 text-sm text-black-olive">
                        {emailTestError}
                      </div>
                    ) : null}
                    {emailTestResult ? (
                      <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Response</span>
                        <pre className="max-h-60 overflow-auto rounded-lg border border-porcelain-shade bg-porcelain-tint/70 px-4 py-3 text-left text-[13px] leading-relaxed text-neutral-700">
                          {JSON.stringify(emailTestResult, null, 2)}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}

        {error && !isLoading ? (
          <Card className="transition-none hover:translate-y-0 hover:shadow-uplift">
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
              <CardDescription>
                The health API could not be reached. Confirm the server is running and try refreshing the status.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-left">
              <Button onClick={loadHealth} disabled={isLoading}>
                Retry now
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {health && !isHealthy ? (
          <Card className="border-ecru/70 bg-ecru/20 transition-none hover:translate-y-0 hover:shadow-uplift">
            <CardHeader>
              <CardTitle className="text-black-olive">Degraded performance detected</CardTitle>
              <CardDescription>
                One or more dependencies are reporting an unhealthy state. Review the checks above for details.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </div>
    </main>
  );
}

export default HealthPage;
