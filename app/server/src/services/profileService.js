import { AuditEventType } from '@prisma/client';
import prisma from '../utils/prismaClient.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';
import { logAuditEvent } from './auditService.js';

const GENERAL_FIELDS = new Set(['avatarUrl', 'bio', 'location', 'timezone', 'notificationSettings', 'accessibilitySettings']);

const ROLE_FIELD_MAP = {
  student: ['className', 'learningPreferences', 'linkedCoachId'],
  creator: ['subjectExpertise', 'profession', 'education'],
  teacher: ['subjectExpertise', 'teacherSpecialties'],
  coach: ['coachingSchedule', 'coachingStrengths', 'assignedStudents'],
  sponsor: ['organizationName', 'sector', 'primaryContact', 'pledgedCredits'],
};

const NOTIFICATION_DIGEST_VALUES = ['realtime', 'daily', 'weekly', 'monthly'];
const TEXT_SCALE_VALUES = ['normal', 'large', 'x-large'];

const DEFAULT_NOTIFICATION_SETTINGS = {
  email: true,
  sms: false,
  push: true,
  digest: 'realtime',
};

const DEFAULT_ACCESSIBILITY_SETTINGS = {
  highContrast: false,
  textScale: 'normal',
  captions: true,
  screenReaderHints: false,
};

function sanitizeString(value, { maxLength = 512 } = {}) {
  if (value === null) {
    return null;
  }

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxLength);
}

function sanitizeArray(value, { maxItems = 20, itemMaxLength = 160 } = {}) {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueItems = Array.from(
    new Set(
      value
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean)
        .map((item) => item.slice(0, itemMaxLength))
    )
  );

  return uniqueItems.slice(0, maxItems);
}

function sanitizeNotificationSettings(settings) {
  const source = settings && typeof settings === 'object' ? settings : {};
  const digest = typeof source.digest === 'string' ? source.digest.trim().toLowerCase() : '';

  return {
    email: Boolean(source.email ?? DEFAULT_NOTIFICATION_SETTINGS.email),
    sms: Boolean(source.sms ?? DEFAULT_NOTIFICATION_SETTINGS.sms),
    push: Boolean(source.push ?? DEFAULT_NOTIFICATION_SETTINGS.push),
    digest: NOTIFICATION_DIGEST_VALUES.includes(digest) ? digest : DEFAULT_NOTIFICATION_SETTINGS.digest,
  };
}

function sanitizeAccessibilitySettings(settings) {
  const source = settings && typeof settings === 'object' ? settings : {};
  const scale = typeof source.textScale === 'string' ? source.textScale.trim().toLowerCase() : '';

  return {
    highContrast: Boolean(source.highContrast ?? DEFAULT_ACCESSIBILITY_SETTINGS.highContrast),
    textScale: TEXT_SCALE_VALUES.includes(scale) ? scale : DEFAULT_ACCESSIBILITY_SETTINGS.textScale,
    captions: Boolean(source.captions ?? DEFAULT_ACCESSIBILITY_SETTINGS.captions),
    screenReaderHints: Boolean(source.screenReaderHints ?? DEFAULT_ACCESSIBILITY_SETTINGS.screenReaderHints),
  };
}

function validateTimezone(value) {
  if (!value) {
    return null;
  }

  try {
    Intl.DateTimeFormat('en-US', { timeZone: value });
    return value;
  } catch (error) {
    logger.warn('Invalid timezone provided for profile update', { value });
    throw AppError.badRequest('Invalid timezone specified.', {
      code: 'PROFILE_INVALID_TIMEZONE',
    });
  }
}

function parseLearningPreferences(preferences) {
  if (!preferences || typeof preferences !== 'object') {
    return {};
  }

  const languages = sanitizeArray(preferences.languages, { maxItems: 10 });
  const topics = sanitizeArray(preferences.topics, { maxItems: 20, itemMaxLength: 200 });
  const pace = sanitizeString(preferences.pace, { maxLength: 120 });

  return {
    learningLanguages: languages,
    learningTopics: topics,
    learningPace: pace,
  };
}

function determineAllowedFields({ mode = 'self', actorRoles = [] } = {}) {
  if (mode === 'admin') {
    return new Set([
      ...GENERAL_FIELDS,
      'className',
      'learningPreferences',
      'linkedCoachId',
      'subjectExpertise',
      'profession',
      'education',
      'teacherSpecialties',
      'coachingSchedule',
      'coachingStrengths',
      'assignedStudents',
      'organizationName',
      'sector',
      'primaryContact',
      'pledgedCredits',
    ]);
  }

  const allowed = new Set(GENERAL_FIELDS);
  for (const role of actorRoles || []) {
    const normalized = typeof role === 'string' ? role.trim().toLowerCase() : '';
    if (!normalized || !ROLE_FIELD_MAP[normalized]) {
      continue; // eslint-disable-line no-continue
    }

    for (const field of ROLE_FIELD_MAP[normalized]) {
      allowed.add(field);
    }
  }
  return allowed;
}

function normalizeProfileInput(payload = {}, { mode = 'self', actorRoles = [] } = {}) {
  if (!payload || typeof payload !== 'object') {
    throw AppError.badRequest('Invalid profile payload provided.', {
      code: 'PROFILE_PAYLOAD_INVALID',
    });
  }

  const allowedFields = determineAllowedFields({ mode, actorRoles });
  const updates = {};

  if (allowedFields.has('avatarUrl') && 'avatarUrl' in payload) {
    const url = sanitizeString(payload.avatarUrl, { maxLength: 2048 });
    if (url && !/^https?:\/\//i.test(url)) {
      throw AppError.badRequest('Avatar URL must be an absolute HTTP(S) URL.', {
        code: 'PROFILE_INVALID_AVATAR_URL',
      });
    }
    updates.avatarUrl = url;
  }

  if (allowedFields.has('bio') && 'bio' in payload) {
    updates.bio = sanitizeString(payload.bio, { maxLength: 1200 });
  }

  if (allowedFields.has('location') && 'location' in payload) {
    updates.location = sanitizeString(payload.location, { maxLength: 160 });
  }

  if (allowedFields.has('timezone') && 'timezone' in payload) {
    const timezone = sanitizeString(payload.timezone, { maxLength: 120 });
    updates.timezone = timezone ? validateTimezone(timezone) : null;
  }

  if (allowedFields.has('notificationSettings') && 'notificationSettings' in payload) {
    updates.notificationSettings = sanitizeNotificationSettings(payload.notificationSettings);
  }

  if (allowedFields.has('accessibilitySettings') && 'accessibilitySettings' in payload) {
    updates.accessibilitySettings = sanitizeAccessibilitySettings(payload.accessibilitySettings);
  }

  if (allowedFields.has('className') && 'className' in payload) {
    updates.className = sanitizeString(payload.className, { maxLength: 120 });
  }

  if (allowedFields.has('learningPreferences') && 'learningPreferences' in payload) {
    Object.assign(updates, parseLearningPreferences(payload.learningPreferences));
  }

  if (allowedFields.has('learningPreferences') && 'learningLanguages' in payload) {
    updates.learningLanguages = sanitizeArray(payload.learningLanguages, { maxItems: 10 });
  }

  if (allowedFields.has('learningPreferences') && 'learningTopics' in payload) {
    updates.learningTopics = sanitizeArray(payload.learningTopics, { maxItems: 20, itemMaxLength: 200 });
  }

  if (allowedFields.has('learningPreferences') && 'learningPace' in payload) {
    updates.learningPace = sanitizeString(payload.learningPace, { maxLength: 120 });
  }

  if (allowedFields.has('linkedCoachId') && 'linkedCoachId' in payload) {
    updates.linkedCoachId = sanitizeString(payload.linkedCoachId, { maxLength: 64 });
  }

  if (allowedFields.has('subjectExpertise') && 'subjectExpertise' in payload) {
    updates.subjectExpertise = sanitizeArray(payload.subjectExpertise, { maxItems: 25, itemMaxLength: 120 });
  }

  if (allowedFields.has('profession') && 'profession' in payload) {
    updates.profession = sanitizeString(payload.profession, { maxLength: 160 });
  }

  if (allowedFields.has('education') && 'education' in payload) {
    updates.education = sanitizeString(payload.education, { maxLength: 160 });
  }

  if (allowedFields.has('teacherSpecialties') && 'teacherSpecialties' in payload) {
    updates.teacherSpecialties = sanitizeArray(payload.teacherSpecialties, { maxItems: 25, itemMaxLength: 120 });
  }

  if (allowedFields.has('coachingSchedule') && 'coachingSchedule' in payload) {
    updates.coachingSchedule = sanitizeString(payload.coachingSchedule, { maxLength: 1000 });
  }

  if (allowedFields.has('coachingStrengths') && 'coachingStrengths' in payload) {
    updates.coachingStrengths = sanitizeArray(payload.coachingStrengths, { maxItems: 20, itemMaxLength: 120 });
  }

  if (allowedFields.has('assignedStudents') && 'assignedStudents' in payload) {
    updates.assignedStudents = sanitizeArray(payload.assignedStudents, { maxItems: 200, itemMaxLength: 120 });
  }

  if (allowedFields.has('organizationName') && 'organizationName' in payload) {
    updates.organizationName = sanitizeString(payload.organizationName, { maxLength: 200 });
  }

  if (allowedFields.has('sector') && 'sector' in payload) {
    updates.sector = sanitizeString(payload.sector, { maxLength: 160 });
  }

  if (allowedFields.has('primaryContact') && 'primaryContact' in payload) {
    updates.primaryContact = sanitizeString(payload.primaryContact, { maxLength: 200 });
  }

  if (allowedFields.has('pledgedCredits') && 'pledgedCredits' in payload) {
    const numeric = Number(payload.pledgedCredits);
    if (Number.isNaN(numeric)) {
      updates.pledgedCredits = null;
    } else if (numeric < 0) {
      throw AppError.badRequest('Pledged credits must be zero or a positive number.', {
        code: 'PROFILE_INVALID_PLEDGED_CREDITS',
      });
    } else {
      updates.pledgedCredits = Math.round(numeric);
    }
  }

  return updates;
}

export function toProfileResponse(profileRecord = null) {
  const profile = profileRecord || {};

  return {
    avatarUrl: profile.avatarUrl || '',
    bio: profile.bio || '',
    location: profile.location || '',
    timezone: profile.timezone || '',
    className: profile.className || '',
    learningPreferences: {
      languages: Array.isArray(profile.learningLanguages) ? profile.learningLanguages : [],
      topics: Array.isArray(profile.learningTopics) ? profile.learningTopics : [],
      pace: profile.learningPace || '',
    },
    linkedCoachId: profile.linkedCoachId || '',
    subjectExpertise: Array.isArray(profile.subjectExpertise) ? profile.subjectExpertise : [],
    profession: profile.profession || '',
    education: profile.education || '',
    teacherSpecialties: Array.isArray(profile.teacherSpecialties) ? profile.teacherSpecialties : [],
    coachingSchedule: profile.coachingSchedule || '',
    coachingStrengths: Array.isArray(profile.coachingStrengths) ? profile.coachingStrengths : [],
    assignedStudents: Array.isArray(profile.assignedStudents) ? profile.assignedStudents : [],
    organizationName: profile.organizationName || '',
    sector: profile.sector || '',
    primaryContact: profile.primaryContact || '',
    pledgedCredits: typeof profile.pledgedCredits === 'number' ? profile.pledgedCredits : null,
    notificationSettings: sanitizeNotificationSettings(profile.notificationSettings),
    accessibilitySettings: sanitizeAccessibilitySettings(profile.accessibilitySettings),
    createdAt: profile.createdAt || null,
    updatedAt: profile.updatedAt || null,
  };
}

export async function getProfileWithUser(userId) {
  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      roles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
      guardianLinks: true,
    },
  });
}

export async function upsertProfile(userId, payload, { actorId = null, mode = 'self', actorRoles = [] } = {}) {
  if (!userId) {
    throw AppError.badRequest('User ID is required to update profile information.', {
      code: 'PROFILE_USER_ID_REQUIRED',
    });
  }

  const updates = normalizeProfileInput(payload, { mode, actorRoles });

  if (Object.keys(updates).length === 0) {
    throw AppError.badRequest('No profile fields provided for update.', {
      code: 'PROFILE_UPDATE_EMPTY',
    });
  }

  const profile = await prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...updates,
    },
    update: updates,
  });

  await logAuditEvent({
    actorId,
    eventType: AuditEventType.USER_PROFILE_UPDATED,
    resource: 'user-profile',
    resourceId: userId,
    metadata: {
      mode,
      updates,
    },
  });

  return profile;
}

export default {
  getProfileWithUser,
  upsertProfile,
  toProfileResponse,
};
