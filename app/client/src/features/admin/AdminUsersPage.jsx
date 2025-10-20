import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Separator,
} from '@components/ui';
import { cn } from '@/lib/utils';
import { LucideIcon } from '@icons';
import { useAuth } from '../auth/AuthProvider.jsx';
import adminApi from './api.js';

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'LOCKED', 'INVITED'];

function RoleSelector({ availableRoles, activeRoles, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {availableRoles.map((role) => {
        const isActive = activeRoles.includes(role.name);
        return (
          <Button
            key={role.name}
            type="button"
            size="sm"
            variant={isActive ? 'default' : 'outline'}
            className={cn('rounded-full px-4 text-xs', !isActive && 'text-muted-foreground')}
            onClick={() => onToggle(role.name, !isActive)}
          >
            {role.label}
          </Button>
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
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 bg-background px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">User management</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Provision roles, adjust account states, and monitor onboarding progress across all Udoy cohorts.
        </p>
      </header>
      {feedback ? (
        <p className="rounded-lg border border-secondary/40 bg-secondary/20 px-3 py-2 text-sm text-secondary-foreground">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}
      <section className="grid gap-6">
      {loading ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <LucideIcon name="Loader" className="animate-spin text-primary" /> Loading users…
            </CardTitle>
            <CardDescription>Fetching the latest account roster.</CardDescription>
          </CardHeader>
        </Card>
      ) : null}
      {!loading && users.length === 0 ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">No users yet</CardTitle>
            <CardDescription>Accounts created through onboarding will appear here automatically.</CardDescription>
          </CardHeader>
        </Card>
      ) : null}
      {users.map((user) => (
        <Card key={user.id} className="shadow-lg">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg text-foreground">{user.firstName || user.email}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.roles?.map((role) => (
                <Badge key={role} variant="secondary" className="text-xs uppercase tracking-wide">
                  {role}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Account status</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span>{user.status}</span>
                      <LucideIcon name="ChevronDown" className="h-4 w-4 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {STATUS_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onSelect={(event) => {
                          event.preventDefault();
                          handleStatusChange(user.id, option);
                        }}
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <Label>Email verified</Label>
                <Input value={user.isEmailVerified ? 'Yes' : 'Pending'} readOnly className="bg-muted text-muted-foreground" />
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
