import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { differenceInYears, format, isAfter, subYears } from 'date-fns';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { cn } from '@/lib/utils';
import {
  Button,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  PhoneInput,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui';
import { CalendarIcon } from 'lucide-react';
import { useAuth } from './AuthProvider.jsx';
import { SupportContactMessage } from './components/SupportContactMessage.jsx';

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'creator', label: 'Creator' },
  { value: 'validator', label: 'Validator' },
  { value: 'coach', label: 'Coach' },
  { value: 'guardian', label: 'Guardian' },
];

const MINIMUM_GUARDIAN_AGE = 16;
const EARLIEST_BIRTHDATE = subYears(new Date(), 80);

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required.'),
    lastName: z.string().trim().min(1, 'Last name is required.'),
    email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    dateOfBirth: z.coerce.date({
      required_error: 'Date of birth is required.',
      invalid_type_error: 'Enter a valid date.',
    }),
    role: z.enum(ROLE_OPTIONS.map((role) => role.value)),
    phoneNumber: z.string().optional(),
    guardianEmail: z.string().trim().email('Enter a valid guardian email.').optional(),
  })
  .superRefine((data, ctx) => {
    if (isAfter(data.dateOfBirth, new Date())) {
      ctx.addIssue({ path: ['dateOfBirth'], code: z.ZodIssueCode.custom, message: 'Date of birth cannot be in the future.' });
    }

    const age = differenceInYears(new Date(), data.dateOfBirth);
    if (data.role === 'student' && age < MINIMUM_GUARDIAN_AGE) {
      if (!data.guardianEmail) {
        ctx.addIssue({
          path: ['guardianEmail'],
          code: z.ZodIssueCode.custom,
          message: 'Guardian email is required for students under 16.',
        });
      }
    }

    if (data.phoneNumber && !isValidPhoneNumber(data.phoneNumber)) {
      ctx.addIssue({
        path: ['phoneNumber'],
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid phone number.',
      });
    }
  });

export default function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [serverFeedback, setServerFeedback] = useState(null);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      dateOfBirth: undefined,
      role: ROLE_OPTIONS[0].value,
      phoneNumber: '',
      guardianEmail: '',
    },
  });

  const dateOfBirth = form.watch('dateOfBirth');
  const role = form.watch('role');

  const age = useMemo(() => {
    if (!dateOfBirth) return null;
    try {
      return differenceInYears(new Date(), dateOfBirth);
    } catch (error) {
      return null;
    }
  }, [dateOfBirth]);

  const requiresGuardian = role === 'student' && typeof age === 'number' && age < MINIMUM_GUARDIAN_AGE;
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const onSubmit = async (values) => {
    setServerFeedback(null);

    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      password: values.password,
      dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd'),
      role: values.role,
      phoneNumber: values.phoneNumber ? values.phoneNumber.trim() : undefined,
      guardianEmail: requiresGuardian && values.guardianEmail ? values.guardianEmail.trim() : undefined,
    };

    try {
      await auth.register(payload);
      setServerFeedback({ type: 'success', message: 'Registration successful! Please verify your email before signing in.' });
      setTimeout(() => navigate('/login'), 1600);
    } catch (error) {
      const message = error?.response?.data?.message || 'We were unable to create your account.';
      setServerFeedback({ type: 'error', message });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Join Udoy
          </div>
          <div className="space-y-4">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Create an account tailored to your learning role
            </h1>
            <p className="max-w-xl text-base text-muted-foreground">
              Whether you are exploring courses, coaching a cohort, or validating content, Udoy adapts to your needs with guided onboarding.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <li className="rounded-xl border border-border bg-card/80 p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Student-ready pathways</p>
              <p className="text-sm text-muted-foreground">Personalised milestones and guardian oversight keep progress transparent.</p>
            </li>
            <li className="rounded-xl border border-border bg-card/80 p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Creator workflows</p>
              <p className="text-sm text-muted-foreground">Upload curricula, request validators, and publish with quality assurance.</p>
            </li>
          </ul>
        </div>
        <Card className="w-full max-w-2xl justify-self-center">
          <CardHeader>
            <CardTitle className="text-2xl">Let’s get you started</CardTitle>
            <CardDescription>Complete the details below to activate your Udoy profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="Anita" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Sharma" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ROLE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" placeholder="Choose a strong password" {...field} />
                      </FormControl>
                      <FormDescription>Minimum 8 characters.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of birth</FormLabel>
                      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-between text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                              type="button"
                            >
                              <span>{field.value ? format(field.value, 'PPP') : 'Select date'}</span>
                              <CalendarIcon className="h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(selectedDate) => {
                              field.onChange(selectedDate);
                              if (selectedDate) {
                                setIsDatePickerOpen(false);
                              }
                            }}
                            captionLayout="dropdown"
                            fromYear={EARLIEST_BIRTHDATE.getFullYear()}
                            toYear={new Date().getFullYear()}
                            toDate={new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>This helps us personalise age-appropriate pathways.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number</FormLabel>
                      <FormControl>
                        <PhoneInput placeholder="Optional" value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription>We’ll use this for guardian updates and urgent alerts.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {requiresGuardian ? (
                  <FormField
                    key="guardianEmail"
                    control={form.control}
                    name="guardianEmail"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Guardian email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="guardian@example.com" {...field} />
                        </FormControl>
                        <FormDescription>We’ll request approval from this contact before activating access.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
                {serverFeedback ? (
                  <div className="md:col-span-2">
                    <div
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm',
                        serverFeedback.type === 'success'
                          ? 'border-secondary/40 bg-secondary/20 text-secondary-foreground'
                          : 'border-destructive/40 bg-destructive/10 text-destructive'
                      )}
                    >
                      {serverFeedback.message}
                    </div>
                  </div>
                ) : null}
                <div className="md:col-span-2">
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Creating your account…' : 'Create account'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4 text-sm text-muted-foreground">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
              .
            </p>
            {requiresGuardian ? (
              <p className="text-xs text-muted-foreground">
                As a student under 16, your guardian will receive an approval request. Access unlocks once they confirm.
              </p>
            ) : null}
            <SupportContactMessage />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
