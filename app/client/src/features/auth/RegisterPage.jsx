import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card.jsx';
import { Input } from '@components/ui/input.jsx';
import { Label } from '@components/ui/label.jsx';
import { Select } from '@components/ui/select.jsx';
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

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'creator', label: 'Creator' },
  { value: 'validator', label: 'Validator/Reviewer' },
  { value: 'coach-guardian', label: 'Coach / Guardian' },
  { value: 'sponsor-partner', label: 'Sponsor / Partner' },
];

const COUNTRY_PHONE_RULES = {
  '+91': {
    label: 'India (+91)',
    pattern: /^[6-9]\d{9}$/,
    example: '9876543210',
  },
  '+1': {
    label: 'United States (+1)',
    pattern: /^[2-9]\d{9}$/,
    example: '4155550123',
  },
  '+44': {
    label: 'United Kingdom (+44)',
    pattern: /^7\d{9}$/,
    example: '7123456789',
  },
  '+61': {
    label: 'Australia (+61)',
    pattern: /^4\d{8}$/,
    example: '412345678',
  },
};

const DEFAULT_COUNTRY_CODE = '+91';
const MINIMUM_GUARDIAN_AGE = 16;

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
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
    role: ROLE_OPTIONS[0].value,
    countryCode: DEFAULT_COUNTRY_CODE,
    phoneNumber: '',
    guardianEmail: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const age = useMemo(() => calculateAge(formState.dateOfBirth), [formState.dateOfBirth]);
  const requiresGuardian =
    formState.role === 'student' && typeof age === 'number' && age < MINIMUM_GUARDIAN_AGE;
  const selectedCountry = COUNTRY_PHONE_RULES[formState.countryCode] || COUNTRY_PHONE_RULES[DEFAULT_COUNTRY_CODE];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const firstName = formState.firstName.trim();
    const lastName = formState.lastName.trim();
    const email = formState.email.trim();
    const guardianEmail = formState.guardianEmail.trim();
    const phoneDigits = formState.phoneNumber.replace(/\D/g, '');

    if (!firstName) {
      setError('First name is required.');
      return;
    }

    if (!lastName) {
      setError('Last name is required.');
      return;
    }

    if (!email || !isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!formState.password) {
      setError('Password is required.');
      return;
    }

    if (!formState.dateOfBirth) {
      setError('Date of birth is required.');
      return;
    }

    if (!formState.role) {
      setError('Select a role to continue.');
      return;
    }

    if (!selectedCountry) {
      setError('Select a valid country code.');
      return;
    }

    if (requiresGuardian) {
      if (!guardianEmail || !isValidEmail(guardianEmail)) {
        setError('A valid guardian email is required for students under 16.');
        return;
      }
    }

    if (formState.phoneNumber) {
      if (!selectedCountry.pattern.test(phoneDigits)) {
        setError(`Enter a valid phone number for ${selectedCountry.label}.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      await auth.register({
        firstName,
        lastName,
        email,
        password: formState.password,
        dateOfBirth: formState.dateOfBirth,
        role: formState.role,
        countryCode: formState.countryCode,
        phoneNumber: formState.phoneNumber ? `${formState.countryCode}${phoneDigits}` : undefined,
        guardianEmail: requiresGuardian ? guardianEmail : undefined,
      });
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
              <Input
                id="firstName"
                name="firstName"
                placeholder="Anita"
                required
                value={formState.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Sharma"
                required
                value={formState.lastName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select id="role" name="role" required value={formState.role} onChange={handleChange}>
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
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
                required
                value={formState.dateOfBirth}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="countryCode">Country code</Label>
              <Select id="countryCode" name="countryCode" required value={formState.countryCode} onChange={handleChange}>
                {Object.entries(COUNTRY_PHONE_RULES).map(([code, details]) => (
                  <option key={code} value={code}>
                    {details.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder={selectedCountry?.example ? `Optional · e.g. ${selectedCountry.example}` : 'Optional'}
                value={formState.phoneNumber}
                onChange={handleChange}
              />
            </div>
            {requiresGuardian ? (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="guardianEmail">Guardian email</Label>
                  <span className="text-xs font-medium text-rose-600">Required for students under 16</span>
                </div>
                <Input
                  id="guardianEmail"
                  name="guardianEmail"
                  type="email"
                  required={requiresGuardian}
                  placeholder="guardian@example.com"
                  value={formState.guardianEmail}
                  onChange={handleChange}
                />
              </div>
            ) : null}
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
          {requiresGuardian ? (
            <p className="text-xs text-neutral-500">
              As a student under 16, your guardian will receive an approval request. Access unlocks after they confirm.
            </p>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}
