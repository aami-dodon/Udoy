import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card.jsx';
import { Input } from '@components/ui/input.jsx';
import { Label } from '@components/ui/label.jsx';
import { useAuth } from './AuthProvider.jsx';

function calculateAge(isoDate) {
  if (!isoDate) return null;
  const birth = new Date(isoDate);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export default function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    phoneNumber: '',
    guardianEmail: '',
    guardianName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const age = useMemo(() => calculateAge(formState.dateOfBirth), [formState.dateOfBirth]);
  const isMinor = typeof age === 'number' && age < 18;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await auth.register(formState);
      setSuccess('Registration successful! Please verify your email before signing in.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (submitError) {
      const message = submitError?.response?.data?.message || 'We were unable to create your account.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-porcelain">
      <Card className="w-full max-w-2xl border-none bg-white shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-evergreen">Join Udoy</CardTitle>
          <CardDescription className="text-sm text-neutral-600">
            Create an account to start learning, mentoring, or managing cohorts. Guardians can register on behalf of students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" placeholder="Anita" value={formState.firstName} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" placeholder="Sharma" value={formState.lastName} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={formState.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Choose a strong password"
                value={formState.password}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formState.dateOfBirth}
                onChange={handleChange}
              />
              {typeof age === 'number' ? (
                <p className="text-xs text-neutral-500">You are {age} years old.</p>
              ) : (
                <p className="text-xs text-neutral-500">Providing your birth date enables guardian-specific flows.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="Optional"
                value={formState.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="guardianEmail">Guardian or coach email</Label>
                {isMinor ? (
                  <span className="text-xs font-medium text-rose-600">Required for minors</span>
                ) : (
                  <span className="text-xs text-neutral-500">Optional, if someone will support this account</span>
                )}
              </div>
              <Input
                id="guardianEmail"
                name="guardianEmail"
                type="email"
                required={isMinor}
                placeholder="guardian@example.com"
                value={formState.guardianEmail}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="guardianName">Guardian or coach name</Label>
              <Input
                id="guardianName"
                name="guardianName"
                placeholder="Name of guardian or coach"
                value={formState.guardianName}
                onChange={handleChange}
              />
            </div>
            {error ? (
              <div className="md:col-span-2">
                <p className="rounded-lg bg-rose-100/80 px-3 py-2 text-sm text-rose-700">{error}</p>
              </div>
            ) : null}
            {success ? (
              <div className="md:col-span-2">
                <p className="rounded-lg bg-mint-sage/20 px-3 py-2 text-sm text-evergreen">{success}</p>
              </div>
            ) : null}
            <div className="md:col-span-2">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Creating your account…' : 'Create account'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-sm text-neutral-700">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-evergreen hover:underline">
              Sign in
            </Link>
            .
          </p>
          {isMinor ? (
            <p className="text-xs text-neutral-500">
              As a minor, your guardian will receive an approval request. Access will unlock once they confirm.
            </p>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}
