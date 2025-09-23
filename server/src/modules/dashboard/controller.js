import { getStudentDashboard, getTeacherDashboard, getAdminDashboard } from './service.js';

/**
 * Student dashboard endpoint.
 */
export async function studentDashboard(req, res, next) {
  try {
    const data = await getStudentDashboard(req.user.id);
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
}

/**
 * Teacher dashboard endpoint.
 */
export async function teacherDashboard(req, res, next) {
  try {
    const data = await getTeacherDashboard(req.user.id);
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
}

/**
 * Admin dashboard endpoint.
 */
export async function adminDashboard(req, res, next) {
  try {
    const data = await getAdminDashboard();
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
}
