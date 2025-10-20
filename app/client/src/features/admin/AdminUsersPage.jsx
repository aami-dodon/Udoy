import { useCallback, useEffect, useState } from 'react';
import { Button } from '@components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card.jsx';
import { Badge } from '@components/ui/badge.jsx';
import { Input } from '@components/ui/input.jsx';
import { Label } from '@components/ui/label.jsx';
import { Separator } from '@components/ui/separator.jsx';
import { LucideIcon } from '../../../../shared/icons';
import { useAuth } from '../auth/AuthProvider.jsx';
import adminApi from './api.js';

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'LOCKED', 'INVITED'];

function RoleSelector({ availableRoles, activeRoles, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {availableRoles.map((role) => {
        const isActive = activeRoles.includes(role.name);
        return (
          <button
            key={role.name}
            type="button"
            onClick={() => onToggle(role.name, !isActive)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              isActive
                ? 'border-evergreen bg-evergreen text-white'
                : 'border-porcelain-shade bg-porcelain-tint text-neutral-700 hover:border-evergreen hover:text-evergreen'
            }`}
          >
            {role.label}
          </button>
        );
      })}
    </div>
  );
}

export default function AdminUsersPage() {
  const auth = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data }, rolesResponse] = await Promise.all([adminApi.fetchUsers(), adminApi.fetchRoleCatalog()]);
      setUsers(data?.items || []);
      setRoles(rolesResponse?.roles || []);
    } catch (fetchError) {
      const message = fetchError?.response?.data?.message || 'Unable to load users right now.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (userId, status) => {
    try {
      setFeedback('Updating status…');
      const response = await adminApi.updateUser(userId, { status });
      updateUserState(response.user);
      setFeedback('Status updated successfully.');
    } catch (updateError) {
      const message = updateError?.response?.data?.message || 'Unable to update user status.';
      setFeedback(message);
    }
  };

  const handleRoleToggle = async (userId, roleName, enable) => {
    const targetUser = users.find((entry) => entry.id === userId);
    if (!targetUser) return;

    const nextRoles = enable
      ? Array.from(new Set([...(targetUser.roles || []), roleName]))
      : (targetUser.roles || []).filter((role) => role !== roleName);

    try {
      setFeedback('Saving role changes…');
      const response = await adminApi.setUserRoles(userId, nextRoles);
      updateUserState(response.user);
      setFeedback('Roles updated successfully.');
    } catch (updateError) {
      const message = updateError?.response?.data?.message || 'Unable to update roles for this user.';
      setFeedback(message);
    }
  };

  const updateUserState = (user) => {
    setUsers((prev) => prev.map((item) => (item.id === user.id ? user : item)));
    if (auth.user?.id === user.id) {
      auth.updateUser(user);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 bg-porcelain px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-evergreen">User management</h1>
        <p className="max-w-2xl text-sm text-neutral-600">
          Provision roles, adjust account states, and monitor onboarding progress across all Udoy cohorts.
        </p>
      </header>
      {feedback ? (
        <p className="rounded-lg bg-mint-sage/20 px-3 py-2 text-sm text-evergreen">{feedback}</p>
      ) : null}
      {error ? <p className="rounded-lg bg-rose-100/80 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      <section className="grid gap-6">
        {loading ? (
          <Card className="border-none bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-evergreen">
                <LucideIcon name="Loader" className="animate-spin" /> Loading users…
              </CardTitle>
              <CardDescription>Fetching the latest account roster.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
        {!loading && users.length === 0 ? (
          <Card className="border-none bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-evergreen">No users yet</CardTitle>
              <CardDescription>Accounts created through onboarding will appear here automatically.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
        {users.map((user) => (
          <Card key={user.id} className="border-none bg-white shadow-lg">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg text-evergreen">{user.firstName || user.email}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.roles?.map((role) => (
                  <Badge key={role} variant="accent" className="text-xs uppercase tracking-wide text-evergreen">
                    {role}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`status-${user.id}`}>Account status</Label>
                  <select
                    id={`status-${user.id}`}
                    className="w-full rounded-md border border-porcelain-shade bg-white px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-evergreen"
                    value={user.status}
                    onChange={(event) => handleStatusChange(user.id, event.target.value)}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Email verified</Label>
                  <Input value={user.isEmailVerified ? 'Yes' : 'Pending'} readOnly className="bg-porcelain-tint text-neutral-700" />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Assigned roles</Label>
                <RoleSelector
                  availableRoles={roles}
                  activeRoles={user.roles || []}
                  onToggle={(roleName, enable) => handleRoleToggle(user.id, roleName, enable)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
