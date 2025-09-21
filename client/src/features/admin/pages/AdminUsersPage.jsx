import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Container, Paper, Stack, Typography } from '@mui/material';

import AdminUserTable from '../components/AdminUserTable.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import { deleteAdminUser, fetchAdminUsers, updateAdminUser } from '../services/adminService.js';

const AdminUsersPage = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await fetchAdminUsers(token);
      setUsers(result);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleUpdateUser = async (id, payload) => {
    if (!token) {
      throw new Error('Not authenticated');
    }
    try {
      const updated = await updateAdminUser(token, id, payload);
      setUsers((prev) => prev.map((user) => (user.id === updated.id ? updated : user)));
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to update user');
      throw err;
    }
  };

  const handleDeleteUser = async (id) => {
    if (!token) {
      throw new Error('Not authenticated');
    }
    try {
      const deleted = await deleteAdminUser(token, id);
      setUsers((prev) => prev.map((user) => (user.id === deleted.id ? deleted : user)));
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      throw err;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1">
              Manage Users
            </Typography>
            <Button variant="outlined" onClick={loadUsers} disabled={loading}>
              Refresh
            </Button>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
          <AdminUserTable
            users={users}
            loading={loading}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        </Stack>
      </Paper>
    </Container>
  );
};

export default AdminUsersPage;
