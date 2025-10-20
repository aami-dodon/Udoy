import { useEffect, useRef, useState } from 'react';
import Icon from '../../../../shared/Icon';
import { colors, layout, motion, typography } from '../../../../shared/theme/tokens.mjs';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '@components/ui';

const ColorSwatch = ({ label, value }) => (
  <div className="flex flex-col gap-2">
    <div className="h-16 w-full rounded-lg border border-border shadow-soft" style={{ backgroundColor: value }} />
    <div className="text-body-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="font-mono text-body-xs text-foreground">{value.toUpperCase()}</div>
  </div>
);

const SpacingBar = ({ token, value }) => (
  <div className="flex items-center gap-4">
    <div className="w-16 shrink-0 text-body-sm font-medium text-foreground">{token}</div>
    <div className="flex w-full flex-col gap-1">
      <div
        className="h-2 rounded-full bg-primary/45"
        style={{ width: `min(100%, calc(${value} * 2))` }}
      />
      <span className="font-mono text-body-xs text-muted-foreground">{value}</span>
    </div>
  </div>
);

const IconTile = ({ iconName, label }) => (
  <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-soft">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-foreground">
      <Icon name={iconName} size="lg" decorative />
    </div>
    <span className="text-body-xs font-medium text-muted-foreground">{label}</span>
  </div>
);

const typographySamples = [
  { token: 'display-lg', className: 'text-display-lg', label: 'Display Large', sample: 'Learning that scales', display: true },
  { token: 'heading-xl', className: 'text-heading-xl', label: 'Heading XL', sample: 'Elevate every cohort', display: true },
  { token: 'heading-md', className: 'text-heading-md', label: 'Heading Medium', sample: 'Module overview', display: true },
  { token: 'heading-sm', className: 'text-heading-sm', label: 'Heading Small', sample: 'Section headline', display: true },
  { token: 'body-base', className: 'text-body-base', label: 'Body Base', sample: 'Inform students with thoughtful, legible copy throughout the LMS.' },
  { token: 'body-sm', className: 'text-body-sm', label: 'Body Small', sample: 'Secondary text keeps supporting details lightweight and scannable.' },
  { token: 'body-xs', className: 'text-body-xs', label: 'Body Extra Small', sample: 'Label & helper text', mono: true },
];

const iconGroups = [
  {
    label: 'Navigation',
    items: [
      { label: 'home', iconName: 'Home' },
      { label: 'user', iconName: 'User' },
      { label: 'users', iconName: 'Users' },
      { label: 'settings', iconName: 'Settings' },
      { label: 'bell', iconName: 'Bell' },
      { label: 'search', iconName: 'Search' },
      { label: 'menu', iconName: 'Menu' },
      { label: 'close', iconName: 'X' },
    ],
  },
  {
    label: 'Actions',
    items: [
      { label: 'plus', iconName: 'Plus' },
      { label: 'square-pen', iconName: 'SquarePen' },
      { label: 'trash', iconName: 'Trash2' },
      { label: 'arrow-right', iconName: 'ArrowRight' },
      { label: 'arrow-left', iconName: 'ArrowLeft' },
      { label: 'check', iconName: 'Check' },
      { label: 'alert-triangle', iconName: 'AlertTriangle' },
      { label: 'info', iconName: 'Info' },
      { label: 'more-horizontal', iconName: 'MoreHorizontal' },
    ],
  },
  {
    label: 'Learning',
    items: [
      { label: 'book-open', iconName: 'BookOpen' },
      { label: 'play', iconName: 'Play' },
      { label: 'file-text', iconName: 'FileText' },
      { label: 'messages-square', iconName: 'MessagesSquare' },
      { label: 'bar-chart-3', iconName: 'BarChart3' },
    ],
  },
  {
    label: 'Status',
    items: [
      { label: 'check-circle', iconName: 'CheckCircle' },
      { label: 'x-circle', iconName: 'XCircle' },
      { label: 'alert-circle', iconName: 'AlertCircle' },
      { label: 'clock-3', iconName: 'Clock3' },
      { label: 'refresh-cw', iconName: 'RefreshCw' },
    ],
  },
];

const ThemePage = () => {
  const [mode, setMode] = useState('light');
  const initialModeRef = useRef('light');

  useEffect(() => {
    const root = document.documentElement;
    const initialMode = root.classList.contains('dark') ? 'dark' : 'light';
    initialModeRef.current = initialMode;
    setMode(initialMode);

    return () => {
      root.classList.remove('dark');
      if (initialMode === 'dark') {
        root.classList.add('dark');
      }
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  const colorPalettes = [
    { name: 'Primary', swatches: Object.entries(colors.primary) },
    { name: 'Neutral', swatches: Object.entries(colors.neutral) },
    { name: 'Accent', swatches: Object.entries(colors.accent) },
  ];

  const statusPalettes = [
    { name: 'Info', swatches: Object.entries(colors.info) },
    { name: 'Success', swatches: Object.entries(colors.success) },
    { name: 'Warning', swatches: Object.entries(colors.warning) },
    { name: 'Danger', swatches: Object.entries(colors.danger) },
  ];

  const surfaceTokens = Object.entries(colors.surface);
  const spacingEntries = Object.entries(layout.spacing);
  const breakpointEntries = Object.entries(layout.breakpoints);
  const radiusEntries = Object.entries(layout.radius);
  const transitionEntries = Object.entries(motion.transition);

  return (
    <div className="page-container">
      <header className="flex flex-col gap-4">
        <span className="text-body-xs uppercase tracking-[0.4em] text-muted-foreground">Design system</span>
        <h1 className="font-display text-display-lg text-foreground">LMS Theme &amp; Tokens</h1>
        <p className="max-w-content-md text-body-lg text-muted-foreground">
          Centralized color, type, component, and layout primitives that power the Udoy learning experience. Use this page to
          validate tokens, interaction states, and ensure parity across light and dark modes.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={() => setMode((current) => (current === 'dark' ? 'light' : 'dark'))} variant="secondary">
            Toggle {mode === 'dark' ? 'light' : 'dark'} mode
          </Button>
          <span className="text-body-sm text-muted-foreground">Currently previewing {mode} mode</span>
        </div>
      </header>

      <section className="grid gap-10">
        <Card>
          <CardHeader className="stack-sm">
            <CardTitle>Brand color system</CardTitle>
            <CardDescription>
              Primary tokens champion the yellow LMS brand, neutrals provide structure, and accent red injects decisive emphasis.
              Semantic palettes cover common status messaging.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-10">
            <div className="grid gap-8 lg:grid-cols-3">
              {colorPalettes.map((group) => (
                <div key={group.name} className="flex flex-col gap-4">
                  <h3 className="text-heading-sm text-foreground">{group.name}</h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {group.swatches.map(([shade, hex]) => (
                      <ColorSwatch key={shade} label={shade} value={hex} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-8">
              <div className="flex flex-col gap-4">
                <h3 className="text-heading-sm text-foreground">Semantic palettes</h3>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {statusPalettes.map((group) => (
                    <div key={group.name} className="flex flex-col gap-4">
                      <h4 className="text-body-sm font-semibold text-foreground">{group.name}</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {group.swatches.map(([shade, hex]) => (
                          <ColorSwatch key={shade} label={shade} value={hex} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="text-heading-sm text-foreground">Surface hierarchy</h3>
                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {surfaceTokens.map(([name, value]) => (
                    <ColorSwatch key={name} label={name} value={value} />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="stack-sm">
            <CardTitle>Typography</CardTitle>
            <CardDescription>
              Display and heading styles use the Fraunces display family while body copy relies on DM Sans for clarity.
              Letter-spacing, line-height, and weights are centralized via tokens.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            <div className="grid gap-6">
              {typographySamples.map((sample) => (
                <div key={sample.token} className="flex flex-col gap-2 rounded-xl border border-border bg-card/80 p-5 shadow-soft">
                  <div className="text-body-xs font-semibold uppercase tracking-wide text-muted-foreground">{sample.label}</div>
                  <p className={cn(sample.display ? 'font-display' : sample.mono ? 'font-mono' : 'font-sans', sample.className)}>
                    {sample.sample}
                  </p>
                  <div className="flex flex-wrap gap-6 text-body-xs text-muted-foreground">
                    <span>Token: {sample.token}</span>
                    <span>
                      Size: {typography.scale[sample.token].size} · Line-height: {typography.scale[sample.token].lineHeight || 'auto'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-6 text-body-sm text-muted-foreground">
              <span>Sans stack: {typography.fonts.sans.join(', ')}</span>
              <span>Display stack: {typography.fonts.display.join(', ')}</span>
              <span>Mono stack: {typography.fonts.mono.join(', ')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="stack-sm">
            <CardTitle>UI components</CardTitle>
            <CardDescription>
              Core shadcn primitives are themed with the centralized tokens to keep parity across buttons, forms, overlays, and
              feedback messaging.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-10">
            <div className="grid gap-4">
              <h3 className="text-heading-sm text-foreground">Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="accent">Accent</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <h3 className="text-heading-sm text-foreground">Form controls</h3>
                <div className="grid gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="theme-email">Email</Label>
                    <Input id="theme-email" placeholder="name@academy.com" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="theme-message">Message</Label>
                    <Textarea id="theme-message" rows={4} placeholder="How can we help your cohort succeed?" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-heading-sm text-foreground">Cards</h3>
                <Card className="space-y-3 border-dashed border-border/60 bg-card">
                  <CardHeader className="px-6 py-5">
                    <CardTitle className="text-heading-md">Course progress</CardTitle>
                    <CardDescription>Track completion and engagement at a glance.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="flex items-center justify-between text-body-sm text-muted-foreground">
                      <span>Applied Product Strategy</span>
                      <span>78%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: '78%' }} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-3">
                <h3 className="text-heading-sm text-foreground">Overlays &amp; feedback</h3>
                <div className="grid gap-4">
                  <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-raised">
                    <div className="absolute inset-0 -z-10 bg-foreground/5" />
                    <h4 className="text-heading-sm text-foreground">Dialog preview</h4>
                    <p className="text-body-sm text-muted-foreground">
                      Dialogs rest on the card surface, inherit spacing tokens, and rely on the accent red for primary CTAs.
                    </p>
                    <div className="mt-4 flex justify-end gap-3">
                      <Button variant="ghost">Cancel</Button>
                      <Button>Confirm</Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 rounded-2xl border border-info-200 bg-info-50/80 p-5">
                    <div className="flex items-center gap-2 text-info-700">
                      <Info className="h-5 w-5" aria-hidden />
                      <span className="text-body-sm font-semibold">Tooltip preview</span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <Button size="sm" variant="secondary">
                        Hover
                      </Button>
                      <div className="rounded-md bg-foreground px-3 py-1 text-body-xs text-background shadow-soft">
                        Share focused helper text
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 rounded-2xl border border-danger-200 bg-danger-50/80 p-5">
                    <div className="flex items-center gap-2 text-danger-700">
                      <AlertCircle className="h-5 w-5" aria-hidden />
                      <span className="text-body-sm font-semibold">Alert</span>
                    </div>
                    <p className="text-body-sm text-muted-foreground">
                      Alerts use semantic palettes and keep copy concise to encourage rapid remediation.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-heading-sm text-foreground">Tabs &amp; toast</h3>
                <div className="grid gap-4">
                  <div className="inline-flex gap-2 rounded-full bg-secondary p-1">
                    <button className="rounded-full bg-primary px-4 py-2 text-body-sm font-semibold text-primary-foreground shadow-soft">
                      Overview
                    </button>
                    <button className="rounded-full px-4 py-2 text-body-sm text-muted-foreground hover:bg-secondary/80">
                      Modules
                    </button>
                    <button className="rounded-full px-4 py-2 text-body-sm text-muted-foreground hover:bg-secondary/80">
                      Learners
                    </button>
                  </div>
                  <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-raised">
                    <div className="flex items-center gap-3 text-success-600">
                      <CheckCircle className="h-5 w-5" aria-hidden />
                      <span className="text-body-sm font-semibold text-foreground">Toast notification</span>
                    </div>
                    <p className="text-body-sm text-muted-foreground">
                      Use to confirm important actions like publishing a cohort or scheduling a live session.
                    </p>
                    <div className="flex justify-end">
                      <Button size="sm" variant="link">
                        View cohort
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="stack-sm">
            <CardTitle>Interaction states</CardTitle>
            <CardDescription>
              Hover, focus, and disabled treatments remain consistent regardless of variant. Use these as references when designing
              custom flows.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-soft">
              <span className="text-body-xs font-semibold uppercase tracking-wide text-muted-foreground">Hover</span>
              <Button className="bg-primary/80 text-primary-foreground">Hover state</Button>
              <p className="text-body-xs text-muted-foreground">
                Subtle darkening communicates affordance without breaking contrast requirements.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-soft">
              <span className="text-body-xs font-semibold uppercase tracking-wide text-muted-foreground">Focus</span>
              <Button className="ring-2 ring-ring ring-offset-2 ring-offset-background">Focus ring</Button>
              <p className="text-body-xs text-muted-foreground">
                The focus halo uses the primary ring token ensuring accessibility for keyboard and assistive tech users.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-soft">
              <span className="text-body-xs font-semibold uppercase tracking-wide text-muted-foreground">Disabled</span>
              <Button disabled>Disabled button</Button>
              <p className="text-body-xs text-muted-foreground">
                Reduced opacity and pointer cancellation signal unavailable actions across all component variants.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="stack-sm">
            <CardTitle>Layout &amp; spacing tokens</CardTitle>
            <CardDescription>
              Container widths, spacing rhythm, and radius tokens drive consistency across dashboards, course modules, and content
              detail screens.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-10">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <h3 className="text-heading-sm text-foreground">Breakpoints</h3>
                <table className="w-full overflow-hidden rounded-xl border border-border text-left text-body-sm">
                  <thead className="bg-secondary text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 font-medium">Token</th>
                      <th className="px-4 py-2 font-medium">Min width</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakpointEntries.map(([name, size]) => (
                      <tr key={name} className="border-t border-border/60 text-foreground">
                        <td className="px-4 py-2 font-medium">{name}</td>
                        <td className="px-4 py-2 font-mono text-body-xs text-muted-foreground">{size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-heading-sm text-foreground">Container padding</h3>
                <div className="grid gap-3 rounded-xl border border-border bg-card p-4">
                  {Object.entries(layout.container.padding).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-body-sm">
                      <span className="font-medium text-foreground">{key}</span>
                      <span className="font-mono text-body-xs text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-3">
                <h3 className="text-heading-sm text-foreground">Spacing scale</h3>
                <div className="grid gap-3">
                  {spacingEntries.map(([token, value]) => (
                    <SpacingBar key={token} token={token} value={value} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-heading-sm text-foreground">Radii &amp; transitions</h3>
                <div className="grid gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="grid gap-2">
                    <span className="text-body-xs font-semibold uppercase tracking-wide text-muted-foreground">Border radius</span>
                    <div className="grid gap-2">
                      {radiusEntries.map(([name, value]) => (
                        <div key={name} className="flex items-center justify-between text-body-sm">
                          <span className="font-medium text-foreground">{name}</span>
                          <span className="font-mono text-body-xs text-muted-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <span className="text-body-xs font-semibold uppercase tracking-wide text-muted-foreground">Transition durations</span>
                    <div className="grid gap-2">
                      {transitionEntries.map(([name, value]) => (
                        <div key={name} className="flex items-center justify-between text-body-sm">
                          <span className="font-medium text-foreground">{name}</span>
                          <span className="font-mono text-body-xs text-muted-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="stack-sm">
            <CardTitle>Iconography</CardTitle>
            <CardDescription>
              Lucide icons provide consistent stroke weight and scale across navigation, actions, and feedback moments. All icons
              inherit the current text color so they adapt to light and dark backgrounds.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            {iconGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-4">
                <h3 className="text-heading-sm text-foreground">{group.label}</h3>
                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-8">
                  {group.items.map(({ label, iconName }) => (
                    <IconTile key={label} iconName={iconName} label={label} />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default ThemePage;
