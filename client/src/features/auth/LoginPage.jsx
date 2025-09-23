import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import api from '../../services/apiClient.js';
import { useAuth } from '../../context/AuthContext.jsx';

const AuthCard = styled(Card)(({ theme }) => ({
  maxWidth: 480,
  width: '100%',
  borderRadius: theme.spacing(3)
}));

const FormStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3)
}));

const CaptionLink = styled(Typography)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  marginLeft: theme.spacing(0.5),
  fontWeight: 600
}));

/**
 * Login form allowing users to authenticate with email and password.
 * @returns {JSX.Element} Login form view.
 */
function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError('');
      const { data } = await api.post('/auth/login', form);
      login(data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Stack alignItems="center" spacing={4}>
      <Typography variant="h3" textAlign="center">
        Welcome back!
      </Typography>
      <AuthCard>
        <CardContent>
          <FormStack component="form" onSubmit={handleSubmit}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Login to your account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Access your personalized learning dashboard.
              </Typography>
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required fullWidth />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" size="large">
              Log In
            </Button>
            <Typography variant="body2" textAlign="center">
              New here?
              <CaptionLink component={RouterLink} to="/signup" color="primary">
                Create an account
              </CaptionLink>
            </Typography>
          </FormStack>
        </CardContent>
      </AuthCard>
    </Stack>
  );
}

export default LoginPage;
