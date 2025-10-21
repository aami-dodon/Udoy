import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
} from '@components/ui';
import { LucideIcon } from '@icons';
import { useAuth } from '../auth/AuthProvider.jsx';
import profileApi from './api.js';

const profileSchema = z.object({
  avatarUrl: z
    .string()
    .trim()
    .url('Enter a valid URL starting with http or https.')
    .or(z.literal(''))
    .optional(),
  bio: z.string().trim().max(1200, 'Bio must be 1,200 characters or fewer.').optional(),
  location: z.string().trim().max(160, 'Location must be 160 characters or fewer.').optional(),
  timezone: z.string().trim().max(120, 'Timezone must be 120 characters or fewer.').optional(),
  className: z.string().trim().max(120, 'Class name must be 120 characters or fewer.').optional(),
  learningLanguages: z.string().optional(),
  learningTopics: z.string().optional(),
  learningPace: z.string().trim().max(120, 'Learning pace must be 120 characters or fewer.').optional(),
  linkedCoachId: z.string().trim().max(64, 'Coach ID must be 64 characters or fewer.').optional(),
  subjectExpertise: z.string().optional(),
  profession: z.string().trim().max(160, 'Profession must be 160 characters or fewer.').optional(),
  education: z.string().trim().max(160, 'Education summary must be 160 characters or fewer.').optional(),
  teacherSpecialties: z.string().optional(),
  coachingSchedule: z.string().trim().max(1000, 'Schedule must be 1,000 characters or fewer.').optional(),
  coachingStrengths: z.string().optional(),
  assignedStudents: z.string().optional(),
  organizationName: z.string().trim().max(200, 'Organization name must be 200 characters or fewer.').optional(),
  sector: z.string().trim().max(160, 'Sector must be 160 characters or fewer.').optional(),
  primaryContact: z.string().trim().max(200, 'Primary contact must be 200 characters or fewer.').optional(),
  pledgedCredits: z
    .string()
    .trim()
    .max(12, 'Pledged credits must be fewer than 12 digits.')
    .regex(/^\d*$/, 'Enter a whole number or leave blank.')
    .optional(),
  notificationEmail: z.boolean().default(true),
  notificationSms: z.boolean().default(false),
  notificationPush: z.boolean().default(true),
  notificationDigest: z.enum(['realtime', 'daily', 'weekly', 'monthly']),
  accessibilityHighContrast: z.boolean().default(false),
  accessibilityTextScale: z.enum(['normal', 'large', 'x-large']),
  accessibilityCaptions: z.boolean().default(true),
  accessibilityScreenReaderHints: z.boolean().default(false),
});

const digestOptions = [
  { value: 'realtime', label: 'Realtime alerts' },
  { value: 'daily', label: 'Daily digest' },
  { value: 'weekly', label: 'Weekly digest' },
  { value: 'monthly', label: 'Monthly digest' },
];

const textScaleOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Large' },
  { value: 'x-large', label: 'Extra large' },
];

const defaultFormValues = {
  avatarUrl: '',
  bio: '',
  location: '',
  timezone: '',
  className: '',
  learningLanguages: '',
  learningTopics: '',
  learningPace: '',
  linkedCoachId: '',
  subjectExpertise: '',
  profession: '',
  education: '',
  teacherSpecialties: '',
  coachingSchedule: '',
  coachingStrengths: '',
  assignedStudents: '',
  organizationName: '',
  sector: '',
  primaryContact: '',
  pledgedCredits: '',
  notificationEmail: true,
  notificationSms: false,
  notificationPush: true,
  notificationDigest: 'realtime',
  accessibilityHighContrast: false,
  accessibilityTextScale: 'normal',
  accessibilityCaptions: true,
  accessibilityScreenReaderHints: false,
};

function listToMultilineText(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return '';
  }
  return list.join('\n');
}

function textToList(value) {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function buildFormValuesFromProfile(profile) {
  if (!profile) {
    return { ...defaultFormValues };
  }

  return {
    avatarUrl: profile.avatarUrl || '',
    bio: profile.bio || '',
    location: profile.location || '',
    timezone: profile.timezone || '',
    className: profile.className || '',
    learningLanguages: listToMultilineText(profile.learningPreferences?.languages),
    learningTopics: listToMultilineText(profile.learningPreferences?.topics),
    learningPace: profile.learningPreferences?.pace || '',
    linkedCoachId: profile.linkedCoachId || '',
    subjectExpertise: listToMultilineText(profile.subjectExpertise),
    profession: profile.profession || '',
    education: profile.education || '',
    teacherSpecialties: listToMultilineText(profile.teacherSpecialties),
    coachingSchedule: profile.coachingSchedule || '',
    coachingStrengths: listToMultilineText(profile.coachingStrengths),
    assignedStudents: listToMultilineText(profile.assignedStudents),
    organizationName: profile.organizationName || '',
    sector: profile.sector || '',
    primaryContact: profile.primaryContact || '',
    pledgedCredits:
      typeof profile.pledgedCredits === 'number' && !Number.isNaN(profile.pledgedCredits)
        ? String(profile.pledgedCredits)
        : '',
    notificationEmail: Boolean(profile.notificationSettings?.email ?? true),
    notificationSms: Boolean(profile.notificationSettings?.sms ?? false),
    notificationPush: Boolean(profile.notificationSettings?.push ?? true),
    notificationDigest: profile.notificationSettings?.digest || 'realtime',
    accessibilityHighContrast: Boolean(profile.accessibilitySettings?.highContrast ?? false),
    accessibilityTextScale: profile.accessibilitySettings?.textScale || 'normal',
    accessibilityCaptions: Boolean(profile.accessibilitySettings?.captions ?? true),
    accessibilityScreenReaderHints: Boolean(profile.accessibilitySettings?.screenReaderHints ?? false),
  };
}

function buildPayload(values, roles) {
  const normalizedRoles = Array.isArray(roles) ? roles : [];
  const payload = {
    avatarUrl: values.avatarUrl,
    bio: values.bio,
    location: values.location,
    timezone: values.timezone,
    notificationSettings: {
      email: values.notificationEmail,
      sms: values.notificationSms,
      push: values.notificationPush,
      digest: values.notificationDigest,
    },
    accessibilitySettings: {
      highContrast: values.accessibilityHighContrast,
      textScale: values.accessibilityTextScale,
      captions: values.accessibilityCaptions,
      screenReaderHints: values.accessibilityScreenReaderHints,
    },
  };

  if (normalizedRoles.includes('student')) {
    payload.className = values.className;
    payload.learningPreferences = {
      languages: textToList(values.learningLanguages),
      topics: textToList(values.learningTopics),
      pace: values.learningPace,
    };
    payload.linkedCoachId = values.linkedCoachId;
  }

  if (normalizedRoles.includes('creator') || normalizedRoles.includes('teacher')) {
    payload.subjectExpertise = textToList(values.subjectExpertise);
    payload.profession = values.profession;
    payload.education = values.education;
  }

  if (normalizedRoles.includes('teacher')) {
    payload.teacherSpecialties = textToList(values.teacherSpecialties);
  }

  if (normalizedRoles.includes('coach')) {
    payload.coachingSchedule = values.coachingSchedule;
    payload.coachingStrengths = textToList(values.coachingStrengths);
    payload.assignedStudents = textToList(values.assignedStudents);
  }

  if (normalizedRoles.includes('sponsor')) {
    payload.organizationName = values.organizationName;
    payload.sector = values.sector;
    payload.primaryContact = values.primaryContact;
    payload.pledgedCredits = values.pledgedCredits ? Number(values.pledgedCredits) : null;
  }

  return payload;
}

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const roles = Array.isArray(user?.roles) ? user.roles : [];

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageTone, setServerMessageTone] = useState('neutral');
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultFormValues,
  });

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const timezoneOptions = useMemo(() => {
    if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
      try {
        return Intl.supportedValuesOf('timeZone');
      } catch (error) {
        return [];
      }
    }
    return [];
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError('');
      const data = await profileApi.fetchMyProfile();
      if (!isMounted.current) {
        return;
      }
      const formValues = buildFormValuesFromProfile(data?.profile);
      form.reset(formValues);
      setLastUpdatedAt(data?.profile?.updatedAt || null);
      if (data?.user) {
        updateUser(data.user);
      }
    } catch (error) {
      if (!isMounted.current) {
        return;
      }
      const message = error?.response?.data?.message || 'Unable to load your profile right now.';
      setLoadError(message);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [form, updateUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (values) => {
    try {
      setServerMessage('');
      setServerMessageTone('neutral');
      const payload = buildPayload(values, roles);
      const data = await profileApi.updateMyProfile(payload);
      const formValues = buildFormValuesFromProfile(data?.profile);
      form.reset(formValues);
      setLastUpdatedAt(data?.profile?.updatedAt || null);
      if (data?.user) {
        updateUser(data.user);
      }
      setServerMessage('Profile updated successfully.');
      setServerMessageTone('success');
    } catch (error) {
      const message = error?.response?.data?.message || 'We could not save your profile updates. Please try again.';
      setServerMessage(message);
      setServerMessageTone('error');
    }
  };

  const renderServerMessage = () => {
    if (!serverMessage) {
      return null;
    }

    const toneClasses = {
      success: 'border-primary/30 bg-primary/10 text-primary',
      error: 'border-destructive/40 bg-destructive/10 text-destructive',
      neutral: 'border-border bg-muted text-foreground',
    };

    return (
      <div className={`rounded-lg border px-4 py-3 text-sm ${toneClasses[serverMessageTone] || toneClasses.neutral}`}>
        {serverMessage}
      </div>
    );
  };

  const hasRole = (role) => roles.includes(role);
  const showStudentSection = hasRole('student');
  const showCreatorSection = hasRole('creator') || hasRole('teacher');
  const showTeacherSection = hasRole('teacher');
  const showCoachSection = hasRole('coach');
  const showSponsorSection = hasRole('sponsor');

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary">
            <LucideIcon name="IdCard" size="md" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em]">Profile Management</span>
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">Personalise your Udoy profile</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Update your bio, learning preferences, and notification settings. Changes apply immediately across Udoy services.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {roles.length > 0 ? (
            roles.map((role) => (
              <Badge key={role} variant="secondary" className="uppercase tracking-wide">
                {role}
              </Badge>
            ))
          ) : (
            <Badge variant="outline">No roles assigned</Badge>
          )}
        </div>
      </div>
      <Separator className="my-8" />

      {loadError ? (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <LucideIcon name="AlertTriangle" size="sm" /> Unable to load profile
            </CardTitle>
            <CardDescription className="text-destructive">{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={fetchProfile}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {renderServerMessage()}

      {isLoading ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Loading profile…</CardTitle>
            <CardDescription>We are syncing your preferences and latest activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ) : !loadError ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-6 space-y-10">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <LucideIcon name="UserCircle2" size="md" /> Profile basics
                </CardTitle>
                <CardDescription>Set your avatar, bio, and home context to tailor learning recommendations.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://cdn.udoy.dev/u/your-avatar.png" {...field} />
                      </FormControl>
                      <FormDescription>Provide a square image for best results.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Timezone</FormLabel>
                      <FormControl>
                        <Input
                          list="timezone-options"
                          placeholder="Asia/Kolkata"
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                      {timezoneOptions.length > 0 ? (
                        <datalist id="timezone-options">
                          {timezoneOptions.map((zone) => (
                            <option key={zone} value={zone} />
                          ))}
                        </datalist>
                      ) : null}
                      <FormDescription>We use this for due dates, schedules, and notifications.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Share your learning goals and interests." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              {lastUpdatedAt ? (
                <CardContent className="border-t border-border/60 bg-muted/50 text-xs text-muted-foreground">
                  Last updated {new Date(lastUpdatedAt).toLocaleString()}
                </CardContent>
              ) : null}
            </Card>

            {showStudentSection ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <LucideIcon name="GraduationCap" size="md" /> Student preferences
                  </CardTitle>
                  <CardDescription>Guide your coach and instructors with learning preferences and class details.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="className"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class or cohort</FormLabel>
                        <FormControl>
                          <Input placeholder="Grade 9 - Robotics" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="linkedCoachId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Linked coach ID</FormLabel>
                        <FormControl>
                          <Input placeholder="coach_abc123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="learningLanguages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred languages</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="Add one language per line" {...field} />
                        </FormControl>
                        <FormDescription>We use this to tailor course content and notifications.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="learningTopics"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Focus topics</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="Robotics\nSTEM labs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="learningPace"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Learning pace</FormLabel>
                        <FormControl>
                          <Input placeholder="Self-paced" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ) : null}

            {showCreatorSection ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <LucideIcon name="PenTool" size="md" /> Expertise & background
                  </CardTitle>
                  <CardDescription>Share your expertise so collaborators can discover you for reviews and co-creation.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="subjectExpertise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject expertise</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="STEM curriculum\nChild psychology" {...field} />
                        </FormControl>
                        <FormDescription>List one subject per line.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="teacherSpecialties"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher specialties</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="Accessibility reviews\nChild safety" {...field} disabled={!showTeacherSection} />
                        </FormControl>
                        <FormDescription>Visible for teacher roles. Leave blank if not applicable.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profession</FormLabel>
                        <FormControl>
                          <Input placeholder="Curriculum designer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education</FormLabel>
                        <FormControl>
                          <Input placeholder="M.Ed, Inclusive Education" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ) : null}

            {showCoachSection ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <LucideIcon name="Users" size="md" /> Coaching overview
                  </CardTitle>
                  <CardDescription>Capture your availability, strengths, and roster to streamline learner support.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="coachingSchedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coaching schedule</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="Weekdays 4-6 PM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="coachingStrengths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strengths</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="Confidence building\nSTEM tutoring" {...field} />
                        </FormControl>
                        <FormDescription>List one strength per line.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="assignedStudents"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Assigned students</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="student_abc123" {...field} />
                        </FormControl>
                        <FormDescription>Provide student IDs separated by new lines.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ) : null}

            {showSponsorSection ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <LucideIcon name="Building2" size="md" /> Sponsor details
                  </CardTitle>
                  <CardDescription>Keep organisation contacts and pledged credits current for compliance reporting.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organisation</FormLabel>
                        <FormControl>
                          <Input placeholder="Future Skills Foundation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sector</FormLabel>
                        <FormControl>
                          <Input placeholder="EdTech" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="primaryContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary contact</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@foundation.org" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pledgedCredits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pledged credits</FormLabel>
                        <FormControl>
                          <Input placeholder="250" inputMode="numeric" {...field} />
                        </FormControl>
                        <FormDescription>Enter a whole number or leave blank.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <LucideIcon name="BellRing" size="md" /> Notification preferences
                </CardTitle>
                <CardDescription>Decide how Udoy should reach you about assignments, coaching, and platform updates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="notificationEmail"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-lg border border-border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="text-sm">Email updates</FormLabel>
                        <FormDescription>Essential updates and summaries delivered to your inbox.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notificationSms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-lg border border-border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="text-sm">SMS nudges</FormLabel>
                        <FormDescription>Time-sensitive reminders for upcoming deadlines.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notificationPush"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-lg border border-border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="text-sm">In-app notifications</FormLabel>
                        <FormDescription>Realtime alerts inside Udoy on web and mobile.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notificationDigest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Digest cadence</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full md:w-72">
                            <SelectValue placeholder="Choose how often" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {digestOptions.map((option) => (
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <LucideIcon name="Accessibility" size="md" /> Accessibility controls
                </CardTitle>
                <CardDescription>Adjust the Udoy interface to suit your preferred reading experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="accessibilityHighContrast"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-lg border border-border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="text-sm">High contrast mode</FormLabel>
                        <FormDescription>Boost colour contrast for improved readability.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accessibilityCaptions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-lg border border-border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="text-sm">Captions and transcripts</FormLabel>
                        <FormDescription>Show captions by default for all media.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accessibilityScreenReaderHints"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-lg border border-border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="text-sm">Screen reader hints</FormLabel>
                        <FormDescription>Enable extra guidance for assistive technologies.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accessibilityTextScale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text size</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full md:w-60">
                            <SelectValue placeholder="Select text size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {textScaleOptions.map((option) => (
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
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Changes are saved securely with full audit trails for compliance.
              </p>
              <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving…' : 'Save profile'}
              </Button>
            </div>
          </form>
        </Form>
      ) : null}
    </div>
  );
}

export default ProfilePage;
