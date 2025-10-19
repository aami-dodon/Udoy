import env from '../config/env.js';
import logger from '../utils/logger.js';
import {
  JwtError,
  verifyAccessToken,
  verifyRefreshToken,
} from '../utils/jwt.js';

function extractBearerToken(headerValue) {
  if (!headerValue || typeof headerValue !== 'string') {
    return null;
  }

  const [scheme, token] = headerValue.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token.trim();
}

function getCookie(req, name) {
  if (!name) {
    return null;
  }

  const { cookies = {}, signedCookies = {} } = req;
  return cookies[name] || signedCookies[name] || null;
}

function authenticate(req, res, next) {
  const { jwt: jwtConfig = {} } = env;
  const accessCookie = jwtConfig.access?.cookieName;
  const refreshCookie = jwtConfig.refresh?.cookieName;

  const bearerToken = extractBearerToken(req.headers.authorization);
  const cookieAccessToken = getCookie(req, accessCookie);
  const accessToken = bearerToken || cookieAccessToken;

  if (accessToken) {
    try {
      const payload = verifyAccessToken(accessToken);
      req.user = payload;
      req.auth = {
        ...(req.auth || {}),
        tokenType: 'access',
        accessToken,
      };
      return next();
    } catch (error) {
      if (error instanceof JwtError) {
        logger.debug('Access token validation failed, attempting refresh token', {
          code: error.code,
        });
      } else {
        logger.warn('Unexpected error during access token validation', {
          error: error.message,
        });
      }
    }
  }

  const refreshHeader = req.headers['x-refresh-token'];
  const cookieRefreshToken = getCookie(req, refreshCookie);
  const refreshToken = typeof refreshHeader === 'string' && refreshHeader.length
    ? refreshHeader
    : cookieRefreshToken;

  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      req.user = payload;
      req.auth = {
        ...(req.auth || {}),
        tokenType: 'refresh',
        refreshToken,
      };
      return next();
    } catch (error) {
      if (error instanceof JwtError) {
        logger.warn('Refresh token validation failed', { code: error.code });
      } else {
        logger.error('Unexpected error during refresh token validation', {
          error: error.message,
        });
      }
    }
  }

  return res.status(401).json({ status: 'error', message: 'Unauthorized' });
}

export default authenticate;
