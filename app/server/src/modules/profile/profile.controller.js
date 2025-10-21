import AppError from '../../utils/appError.js';
import logger from '../../utils/logger.js';
import { toUserProfile } from '../../services/userService.js';
import { getProfileWithUser, upsertProfile, toProfileResponse } from '../../services/profileService.js';

function buildResponsePayload(user) {
  const profile = user?.profile ? toProfileResponse(user.profile) : toProfileResponse();
  return {
    user: toUserProfile(user),
    profile,
  };
}

export async function getMyProfile(req, res, next) {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      throw AppError.unauthorized('Unauthorized', {
        code: 'PROFILE_AUTH_REQUIRED',
      });
    }

    const user = await getProfileWithUser(userId);
    if (!user) {
      throw AppError.notFound('User profile not found.', {
        code: 'PROFILE_NOT_FOUND',
      });
    }

    return res.json({
      status: 'success',
      data: buildResponsePayload(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      throw AppError.unauthorized('Unauthorized', {
        code: 'PROFILE_AUTH_REQUIRED',
      });
    }

    const actorRoles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    await upsertProfile(userId, req.body || {}, {
      actorId: userId,
      mode: 'self',
      actorRoles,
    });

    const user = await getProfileWithUser(userId);
    if (!user) {
      throw AppError.notFound('User profile not found.', {
        code: 'PROFILE_NOT_FOUND',
      });
    }

    logger.info('User profile updated', {
      userId,
      actorRoles,
    });

    return res.json({
      status: 'success',
      data: buildResponsePayload(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getProfileById(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await getProfileWithUser(userId);
    if (!user) {
      throw AppError.notFound('User profile not found.', {
        code: 'PROFILE_NOT_FOUND',
      });
    }

    return res.json({
      status: 'success',
      data: buildResponsePayload(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateProfileById(req, res, next) {
  try {
    const { userId } = req.params;
    const actorRoles = Array.isArray(req.user?.roles) ? req.user.roles : [];

    await upsertProfile(userId, req.body || {}, {
      actorId: req.user?.sub || null,
      mode: 'admin',
      actorRoles,
    });

    const user = await getProfileWithUser(userId);
    if (!user) {
      throw AppError.notFound('User profile not found.', {
        code: 'PROFILE_NOT_FOUND',
      });
    }

    logger.info('Administrative profile update applied', {
      targetUserId: userId,
      actorId: req.user?.sub || null,
    });

    return res.json({
      status: 'success',
      data: buildResponsePayload(user),
    });
  } catch (error) {
    return next(error);
  }
}

export default {
  getMyProfile,
  updateMyProfile,
  getProfileById,
  updateProfileById,
};
