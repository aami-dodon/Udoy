import { validationResult } from 'express-validator';
import { listCourses, getCourseById, enrollStudent } from './service.js';

/**
 * Return course catalog.
 */
export async function getCourses(req, res, next) {
  try {
    const courses = await listCourses();
    return res.json({ courses });
  } catch (error) {
    return next(error);
  }
}

/**
 * Return course detail view.
 */
export async function getCourse(req, res, next) {
  try {
    const course = await getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    return res.json({ course });
  } catch (error) {
    return next(error);
  }
}

/**
 * Enroll the authenticated student into a course.
 */
export async function postEnrollment(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const enrollment = await enrollStudent({
      courseId: req.params.id,
      studentId: req.user.id
    });
    return res.status(201).json({ enrollment });
  } catch (error) {
    return next(error);
  }
}
