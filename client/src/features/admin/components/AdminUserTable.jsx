import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

import { ROLES } from '@shared/constants/index.js';

const AdminUserTable = ({ users, loading, onUpdateUser, onDeleteUser }) => {
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', role: ROLES.STUDENT, isActive: true, isVerified: false });
  const roleOptions = useMemo(() => Object.values(ROLES), []);
  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const openEditDialog = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified
    });
    setDialogError('');
  };

  const closeDialog = () => {
    setEditingUser(null);
    setForm({ name: '', role: ROLES.STUDENT, isActive: true, isVerified: false });
    setSaving(false);
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (event) => {
    const { name, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!editingUser) {
      return;
    }
    setSaving(true);
    try {
      await onUpdateUser(editingUser.id, form);
      closeDialog();
    } catch (error) {
      console.error(error);
      setDialogError(error.message || 'Failed to update user');
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    setDeletingId(user.id);
    try {
      await onDeleteUser(user.id);
    } finally {
      setDeletingId('');
    }
  };

  return (
    <Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Verified</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.deletedAt ? 'Deleted' : user.isActive ? 'Active' : 'Inactive'}</TableCell>
              <TableCell>{user.isVerified ? 'Yes' : 'No'}</TableCell>
              <TableCell>{new Date(user.updatedAt || user.createdAt).toLocaleString()}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => openEditDialog(user)}
                    disabled={!!user.deletedAt}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    color="error"
                    disabled={deletingId === user.id || !!user.deletedAt || user.role === ROLES.ADMIN}
                    onClick={() => handleDelete(user)}
                  >
                    {deletingId === user.id ? 'Deleting…' : user.deletedAt ? 'Deleted' : 'Delete'}
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {!loading && users.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography variant="body2" color="text.secondary">
                  No users found.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={Boolean(editingUser)} onClose={closeDialog} fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editingUser && (
            <Stack spacing={2} component="form" id="admin-edit-user-form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              {dialogError && <Typography color="error">{dialogError}</Typography>}
              <TextField
                label="Name"
                name="name"
                value={form.name}
                onChange={handleFieldChange}
                fullWidth
                required
              />
              <Select label="Role" name="role" value={form.role} onChange={handleFieldChange} fullWidth>
                {roleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
              <FormControlLabel
                control={<Switch checked={form.isActive} name="isActive" onChange={handleToggle} />}
                label="Active"
              />
              <FormControlLabel
                control={<Switch checked={form.isVerified} name="isVerified" onChange={handleToggle} />}
                label="Verified"
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button type="submit" form="admin-edit-user-form" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserTable;
