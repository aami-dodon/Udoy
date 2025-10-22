import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@components/ui';
import { LucideIcon } from '@icons';
import PostLoginLayout from '@/features/layouts/PostLoginLayout.jsx';
import usePostLoginNavigation from '../navigation/usePostLoginNavigation.jsx';
import { useAuth } from '../auth/AuthProvider.jsx';

const ROLE_DEFINITIONS = {
  student: {
    title: 'Learning milestones',
    icon: 'GraduationCap',
    description:
      'Keep an eye on your personalised paths, celebrate badges you unlock, and preview the next set of challenges.',
    highlights: [
      'Review upcoming practice sets curated for your current level.',
      'Share wins with your coach to unlock fresh mentorship check-ins.',
      'Update your aspirations so we can tailor new cohorts around you.',
    ],
    actions: [
      { label: 'Browse learning library', to: '/topics' },
      { label: 'Update profile goals', to: '/profile' },
    ],
  },
  creator: {
    title: 'Creator studio',
    icon: 'PenTool',
    description: 'Craft new learning experiences, refine drafts with teachers, and track feedback in one place.',
    highlights: [
      'Draft new topics using the guided templates and shared resources.',
      'Collaborate with teachers for pedagogy reviews before launch.',
      'Publish once content is approved to reach the next learner cohort.',
    ],
    actions: [
      { label: 'Start a new topic', to: '/topics/new' },
      { label: 'Review submissions', to: '/topics' },
    ],
  },
  teacher: {
    title: 'Quality review lane',
    icon: 'CheckCircle',
    description: 'Audit lesson flow, suggest improvements, and ensure every module reflects Udoy’s quality bar.',
    highlights: [
      'See modules awaiting instructional review and provide clarity.',
      'Log structured feedback so creators can iterate rapidly.',
      'Track which cohorts are ready to implement your refinements.',
    ],
    actions: [
      { label: 'View review queue', to: '/topics' },
      { label: 'Share pedagogy notes', to: '/topics' },
    ],
  },
  coach: {
    title: 'Mentor desk',
    icon: 'Compass',
    description: 'Plan upcoming check-ins, celebrate learner wins, and surface blockers that need attention.',
    highlights: [
      'Prepare for upcoming sessions with student goal snapshots.',
      'Log milestone celebrations to trigger community shout-outs.',
      'Escalate support requests directly to the Udoy coordination team.',
    ],
    actions: [
      { label: 'Review assigned learners', to: '/dashboard' },
      { label: 'Share feedback with Udoy', to: '/profile' },
    ],
  },
  sponsor: {
    title: 'Impact investments',
    icon: 'Coins',
    description: 'Track contributions, follow learner progress, and explore upcoming opportunities to fund.',
    highlights: [
      'Monitor the cohorts your contributions currently empower.',
      'Unlock new sponsorship pledges as learners hit key badges.',
      'Download quarterly transparency reports for your records.',
    ],
    actions: [
      { label: 'View progress reports', to: '/dashboard' },
      { label: 'Talk to Udoy partnerships', to: '/profile' },
    ],
  },
  admin: {
    title: 'Operational command',
    icon: 'ShieldCheck',
    description: 'Oversee user management, verify permissions, and ensure policies keep the community safe.',
    highlights: [
      'Audit new registrations and assign roles or cohorts.',
      'Review permission footprints for compliance and governance.',
      'Monitor platform health metrics and scheduled maintenance.',
    ],
    actions: [
      { label: 'Manage users', to: '/admin/users' },
      { label: 'Inspect permissions', to: '/dashboard' },
    ],
  },
};

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value || '—'}</span>
    </div>
  );
}

function RoleOverview({ roleKey, definition }) {
  return (
    <Card className="border border-border/70 bg-card/70 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LucideIcon name={definition.icon} size="sm" />
          </span>
          <div>
            <CardTitle className="text-lg text-foreground">{definition.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground capitalize">{roleKey}</CardDescription>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{definition.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3 text-sm text-muted-foreground">
          {definition.highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-3">
              <LucideIcon name="Sparkles" size="sm" className="mt-1 text-primary" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          {definition.actions.map((action) => (
            <Button
              key={action.label}
              variant="secondary"
              size="sm"
              asChild
              className="bg-primary/10 text-primary hover:bg-primary/20"
            >
              <Link to={action.to}>{action.label}</Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const auth = useAuth();
  const { user, session } = auth;
  const [refreshing, setRefreshing] = useState(false);
  const { navItems: navigationItems, userRoles } = usePostLoginNavigation(user);

  const roleDefinitions = useMemo(() => {
    if (userRoles.length === 0) {
      return [];
    }

    return userRoles
      .map((role) => ({ key: role, definition: ROLE_DEFINITIONS[role] }))
      .filter((entry) => Boolean(entry.definition));
  }, [userRoles]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await auth.refreshSession();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <PostLoginLayout user={user} navItems={navigationItems} onSignOut={auth.logout}>
      <div className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        <div className="space-y-6">
          <Card className="border border-border/60 bg-gradient-to-r from-card to-muted/70">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <Badge variant="accent" className="uppercase tracking-[0.3em]">
                    Unified dashboard
                  </Badge>
                  <CardTitle className="text-2xl text-foreground">
                    Welcome back{user?.firstName ? `, ${user.firstName}` : ''}.
                  </CardTitle>
                  <CardDescription className="max-w-2xl text-sm text-muted-foreground">
                    Your Udoy workspace brings together learning, mentoring, and community stewardship. Explore the panels below
                    based on your current responsibilities.
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active roles</span>
                  <div className="flex flex-wrap justify-end gap-2">
                    {(userRoles.length ? userRoles : ['guest']).map((role) => (
                      <Badge key={role} variant="outline" className="border-primary/40 text-primary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {roleDefinitions.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {roleDefinitions.map((role) => (
                <RoleOverview key={role.key} roleKey={role.key} definition={role.definition} />
              ))}
            </div>
          ) : (
            <Card className="border border-dashed border-border/70 bg-card/60">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">We are setting up your workspace</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Once roles are assigned to your account, tailored dashboards will appear here. In the meantime, keep your
                  profile up to date and explore the shared learning library.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button size="sm" asChild>
                  <Link to="/profile">Update profile</Link>
                </Button>
                <Button size="sm" variant="secondary" asChild>
                  <Link to="/topics">Browse learning library</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="border border-border/70 bg-card/70">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <LucideIcon name="BellRing" size="sm" />
                </span>
                <div>
                  <CardTitle className="text-lg text-foreground">Platform updates</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Stay in sync with upcoming releases and coordination moments.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-lg border border-border/60 bg-background/60 p-4">
                <p className="font-semibold text-foreground">Role-aware navigation</p>
                <p>We are gradually rolling out deep links tailored to each role. Expect more shortcuts soon.</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/60 p-4">
                <p className="font-semibold text-foreground">Transparent progress</p>
                <p>Impact dashboards will soon let sponsors and coaches celebrate learner momentum together.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border border-border/70 bg-card/70 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2 text-lg text-foreground">
                <LucideIcon name="UserCircle" className="text-primary" /> Account overview
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                Your core profile information and RBAC footprint.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Email" value={user?.email} />
              <InfoRow label="First name" value={user?.firstName} />
              <InfoRow label="Last name" value={user?.lastName} />
              <InfoRow label="Phone" value={user?.phoneNumber} />
              <InfoRow label="Status" value={user?.status} />
              <InfoRow label="Email verified" value={user?.isEmailVerified ? 'Yes' : 'Pending'} />
              <InfoRow label="Coach consent" value={user?.guardianConsent ? 'Approved' : 'Pending'} />
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Roles</span>
                <div className="flex flex-wrap gap-2">
                  {(user?.roles || []).length > 0 ? (
                    user.roles.map((role) => (
                      <Badge key={role} variant="secondary" className="uppercase tracking-wide">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No roles assigned yet.</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Capabilities</span>
                <div className="grid gap-2 md:grid-cols-2">
                  {(user?.permissions || []).map((permission) => (
                    <div
                      key={`${permission.resource}:${permission.action}`}
                      className="rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted-foreground"
                    >
                      <p className="font-semibold text-foreground">{permission.name}</p>
                      <p>
                        {permission.resource} · {permission.action}
                      </p>
                    </div>
                  ))}
                  {(user?.permissions || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Permissions will appear here once roles are assigned.</p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-card/70 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2 text-lg text-foreground">
                <LucideIcon name="ShieldCheck" className="text-primary" /> Session security
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                Manage active session tokens and refresh credentials when needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Session ID" value={session?.id || 'Not available'} />
              <InfoRow
                label="Expires"
                value={session?.expiresAt ? new Date(session.expiresAt).toLocaleString() : 'Rotates on demand'}
              />
              <InfoRow
                label="Roles in session"
                value={Array.isArray(session?.roles) ? session.roles.join(', ') : '—'}
              />
              <Button onClick={handleRefresh} disabled={refreshing} className="w-full">
                {refreshing ? 'Refreshing session…' : 'Refresh session tokens'}
              </Button>
              <Button onClick={auth.logout} variant="destructive" className="w-full">
                Sign out
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-card/60">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Need a hand?</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Reach out to the Udoy coordination desk for onboarding, support, or feedback loops.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <LucideIcon name="LifeBuoy" className="text-primary" size="sm" />
                <div>
                  <p className="font-semibold text-foreground">Support desk</p>
                  <a href="mailto:support@udoy.in" className="text-primary hover:underline">
                    support@udoy.in
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <LucideIcon name="MessageSquare" className="text-primary" size="sm" />
                <div>
                  <p className="font-semibold text-foreground">Community channel</p>
                  <p>Join the upcoming mentor circles to exchange insights with peers.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PostLoginLayout>
  );
}
