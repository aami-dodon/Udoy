import { getHighlights } from './service.js';

/**
 * Landing highlights endpoint.
 */
export async function listHighlights(req, res, next) {
  try {
    const highlights = await getHighlights();
    return res.json({ highlights });
  } catch (error) {
    return next(error);
  }
}
