import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../../services/apiClient.js';

const roles = [
  { label: 'Student', value: 'student' },
  { label: 'Teacher', value: 'teacher' }
];

const SignupCard = styled(Card)(({ theme }) => ({
  maxWidth: 560,
  width: '100%',
  borderRadius: theme.spacing(3)
}));

const FormStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3)
}));

/**
 * Signup page enabling creation of new learner or teacher accounts.
 * @returns {JSX.Element} Signup view.
 */
function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError('');
      setSuccess('');
      await api.post('/auth/register', form);
      setSuccess('Check your email to verify your new account.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Stack spacing={4} alignItems="center">
      <Typography variant="h3" textAlign="center">
        Create your free account
      </Typography>
      <SignupCard>
        <CardContent>
          <FormStack component="form" onSubmit={handleSubmit}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Join the UDOY community
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Parents and guardians can sign up teachers or students in minutes.
              </Typography>
            </Box>
            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Full name" name="name" value={form.name} onChange={handleChange} fullWidth required />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} type="email" fullWidth required />
            <TextField
              label="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              fullWidth
              required
            />
            <TextField select label="Role" name="role" value={form.role} onChange={handleChange} fullWidth required>
              {roles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>
            <Button type="submit" variant="contained" size="large">
              Sign Up
            </Button>
          </FormStack>
        </CardContent>
      </SignupCard>
    </Stack>
  );
}

export default SignupPage;
