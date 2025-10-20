import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { cn } from '@/lib/utils';

const STATUS_VARIANTS = {
  ok: 'bg-success-100 text-success-700 ring-1 ring-inset ring-success-200',
  up: 'bg-success-100 text-success-700 ring-1 ring-inset ring-success-200',
  error: 'bg-danger-100 text-danger-700 ring-1 ring-inset ring-danger-200',
  down: 'bg-danger-100 text-danger-700 ring-1 ring-inset ring-danger-200',
  skipped: 'bg-muted text-muted-foreground ring-1 ring-inset ring-border/60',
  unknown: 'bg-secondary text-secondary-foreground ring-1 ring-inset ring-border/60',
};

const STATUS_LABELS = {
  ok: 'All Systems Operational',
  error: 'Attention Required',
  up: 'Up',
  down: 'Down',
  skipped: 'Skipped',
};

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
  const isMountedRef = useRef(false);

  const loadHealth = useCallback(async () => {
    if (isMountedRef.current) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await fetch('/api/health', {
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
    <div className="flex w-full justify-center px-6 py-10">
      <div className="flex w-full max-w-5xl flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <CardTitle>Platform Health</CardTitle>
                <CardDescription>
                  Live snapshot of service readiness, dependency checks, and integration status.
                </CardDescription>
              </div>
              <Button onClick={loadHealth} variant="outline" disabled={isLoading}>
                {isLoading ? 'Refreshing…' : 'Refresh status'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-body-sm text-danger-700">
                {error}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <span className="text-body-xs uppercase tracking-[0.2em] text-muted-foreground">Overall status</span>
                  <span
                    className={cn(
                      'inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-body-sm font-semibold shadow-soft transition-colors',
                      healthStatusClasses,
                    )}
                  >
                    {isLoading && !health ? 'Loading…' : healthStatusLabel}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-body-xs uppercase tracking-[0.2em] text-muted-foreground">Last checked</span>
                  <span className="text-body-sm text-foreground">{isLoading && !health ? 'Loading…' : formattedTimestamp}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-body-xs uppercase tracking-[0.2em] text-muted-foreground">Server uptime</span>
                  <span className="text-body-sm text-foreground">{formattedUptime}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-body-xs uppercase tracking-[0.2em] text-muted-foreground">API endpoint</span>
                  <span className="text-body-sm text-foreground">/api/health</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!error && health && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Dependency checks</CardTitle>
                <CardDescription>Detailed availability across required services.</CardDescription>
              </CardHeader>
              <CardContent>
                {checks.length === 0 ? (
                  <p className="text-body-sm text-muted-foreground">No health checks were reported.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {checks.map(([key, value]) => {
                      const statusLabel = resolveStatusLabel(value?.status);
                      const statusClasses = resolveStatusClasses(value?.status);

                      return (
                        <div key={key} className="rounded-2xl border border-border/60 bg-surface-base px-5 py-4 shadow-soft">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-body-sm font-semibold capitalize text-foreground">{key}</span>
                              {value?.bucket ? (
                                <span className="text-body-xs text-muted-foreground">Bucket: {value.bucket}</span>
                              ) : null}
                              {value?.message ? (
                                <span className="text-body-xs text-muted-foreground">{value.message}</span>
                              ) : null}
                            </div>
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-3 py-1 text-body-xs font-semibold',
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
              <Card>
                <CardHeader>
                  <CardTitle>CORS configuration</CardTitle>
                  <CardDescription>Active cross-origin rules applied to the API gateway.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-body-xs uppercase tracking-[0.2em] text-muted-foreground">Enabled</span>
                    <span className="text-body-sm text-foreground">{corsDetails.enabled ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-body-xs uppercase tracking-[0.2em] text-muted-foreground">Allow credentials</span>
                    <span className="text-body-sm text-foreground">{corsDetails.allowCredentials ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-body-xs uppercase tracking-[0.2em] text-muted-foreground">Allowed origins</span>
                    {corsDetails.allowedOrigins?.length ? (
                      <ul className="list-disc space-y-1 pl-5 text-body-sm text-foreground">
                        {corsDetails.allowedOrigins.map((origin) => (
                          <li key={origin}>{origin}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-body-sm text-muted-foreground">No origins configured.</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </>
        )}

        {error && !isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
              <CardDescription>
                The health API could not be reached. Confirm the server is running and try refreshing the status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadHealth} disabled={isLoading}>
                Retry now
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {health && !isHealthy ? (
          <Card className="border-warning-300 bg-warning-50">
            <CardHeader>
              <CardTitle className="text-warning-900">Degraded performance detected</CardTitle>
              <CardDescription className="text-warning-800">
                One or more dependencies are reporting an unhealthy state. Review the checks above for details.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

export default HealthPage;
