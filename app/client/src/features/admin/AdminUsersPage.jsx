import { useCallback, useEffect, useMemo, useState } from 'react';
import PostLoginLayout from '@/features/layouts/PostLoginLayout.jsx';
import DataTable from '@components/data-table.jsx';
import { useAuth } from '../auth/AuthProvider.jsx';
import usePostLoginNavigation from '../navigation/usePostLoginNavigation.jsx';
import adminApi from './api.js';
import { createUserColumns } from './components/user-columns.jsx';

export default function AdminUsersPage() {
  const auth = useAuth();
  const { navItems } = usePostLoginNavigation(auth.user);
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

  const updateUserState = useCallback(
    (user) => {
      setUsers((prev) => prev.map((item) => (item.id === user.id ? user : item)));
      if (auth.user?.id === user.id) {
        auth.updateUser(user);
      }
    },
    [auth]
  );

  const handleStatusChange = useCallback(
    async (userId, status, { confirmed = true } = {}) => {
      if (!confirmed) {
        return;
      }
      try {
        setFeedback('Updating status…');
        const response = await adminApi.updateUser(userId, { status });
        updateUserState(response.user);
        setFeedback('Status updated successfully.');
      } catch (updateError) {
        const message = updateError?.response?.data?.message || 'Unable to update user status.';
        setFeedback(message);
      }
    },
    [updateUserState]
  );

  const handleRoleToggle = useCallback(
    async (userId, roleName, enable, { confirmed = true } = {}) => {
      if (!confirmed) {
        return;
      }
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
    },
    [updateUserState, users]
  );

  const columns = useMemo(
    () => createUserColumns({ availableRoles: roles, onStatusChange: handleStatusChange, onRoleToggle: handleRoleToggle }),
    [roles, handleRoleToggle, handleStatusChange]
  );

  const hasUsers = users.length > 0;
  const showEmptyState = !loading && !hasUsers;
  const tableData = showEmptyState ? [] : users;
  const emptyMessage = showEmptyState
    ? 'Accounts created through onboarding will appear here automatically.'
    : 'No results found.';
  const showLoaderRow = loading && !hasUsers;
  const showToolbarLoader = loading && hasUsers;
  const toolbarFeedback = showToolbarLoader ? 'Refreshing roster…' : '';

  return (
    <PostLoginLayout user={auth.user} navItems={navItems} onSignOut={auth.logout}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">User management</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Provision roles, adjust account states, and monitor onboarding progress across all Udoy cohorts.
        </p>
      </header>
      {toolbarFeedback ? <p className="text-sm text-muted-foreground">{toolbarFeedback}</p> : null}
      {feedback ? (
        <p className="rounded-lg border border-secondary/40 bg-secondary/20 px-3 py-2 text-sm text-secondary-foreground">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}
      <section className="grid gap-6">
        <DataTable
          columns={columns}
          data={tableData}
          loading={showLoaderRow}
          emptyMessage={emptyMessage}
          loadingMessage="Loading users..."
        />
      </section>
      </div>
    </PostLoginLayout>
  );
}
