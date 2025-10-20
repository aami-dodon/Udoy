import { useState } from 'react';
import { Button } from '@components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card.jsx';
import { Badge } from '@components/ui/badge.jsx';
import { Separator } from '@components/ui/separator.jsx';
import { LucideIcon } from '../../../../shared/icons';
import { useAuth } from '../auth/AuthProvider.jsx';

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-neutral-600">{label}</span>
      <span className="text-sm text-neutral-800">{value || '—'}</span>
    </div>
  );
}

export default function DashboardPage() {
  const auth = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const { user, session } = auth;

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await auth.refreshSession();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 bg-porcelain px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-evergreen">Welcome, {user?.firstName || user?.email}</h1>
        <p className="max-w-2xl text-sm text-neutral-600">
          This is your unified Udoy workspace. Monitor account health, explore available capabilities, and manage sessions.
        </p>
      </header>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-none bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-evergreen">
              <LucideIcon name="UserCircle" className="text-evergreen" /> Account overview
            </CardTitle>
            <CardDescription>Your core profile information and RBAC footprint.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="First name" value={user?.firstName} />
            <InfoRow label="Last name" value={user?.lastName} />
            <InfoRow label="Phone" value={user?.phoneNumber} />
            <InfoRow label="Status" value={user?.status} />
            <InfoRow label="Email verified" value={user?.isEmailVerified ? 'Yes' : 'Pending'} />
            <InfoRow label="Guardian consent" value={user?.guardianConsent ? 'Approved' : 'Pending'} />
            <Separator />
            <div className="space-y-2">
              <span className="text-sm font-medium text-neutral-600">Roles</span>
              <div className="flex flex-wrap gap-2">
                {(user?.roles || []).length > 0 ? (
                  user.roles.map((role) => (
                    <Badge key={role} variant="accent" className="text-xs uppercase tracking-wide text-evergreen">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-neutral-500">No roles assigned yet.</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium text-neutral-600">Capabilities</span>
              <div className="grid gap-2 md:grid-cols-2">
                {(user?.permissions || []).map((permission) => (
                  <div key={`${permission.resource}:${permission.action}`} className="rounded-lg bg-porcelain-tint px-3 py-2 text-xs text-neutral-600">
                    <p className="font-semibold text-neutral-700">{permission.name}</p>
                    <p>
                      {permission.resource} · {permission.action}
                    </p>
                  </div>
                ))}
                {(user?.permissions || []).length === 0 ? (
                  <p className="text-sm text-neutral-500">Permissions will appear here once roles are assigned.</p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-evergreen">
              <LucideIcon name="ShieldCheck" className="text-evergreen" /> Session security
            </CardTitle>
            <CardDescription>Manage active session tokens and refresh credentials when needed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Session ID" value={session?.id || 'Not available'} />
            <InfoRow label="Expires" value={session?.expiresAt ? new Date(session.expiresAt).toLocaleString() : 'Rotates on demand'} />
            <InfoRow label="Roles in session" value={Array.isArray(session?.roles) ? session.roles.join(', ') : '—'} />
            <Button onClick={handleRefresh} disabled={refreshing} className="w-full">
              {refreshing ? 'Refreshing session…' : 'Refresh session tokens'}
            </Button>
            <Button onClick={auth.logout} variant="ghost" className="w-full text-rose-600 hover:bg-rose-100/60">
              Sign out
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
