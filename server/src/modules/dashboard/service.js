import { prisma } from '../../config/database.js';
import ProgressModel from '../shared/progressModel.js';

/**
 * Student dashboard metrics aggregated from progress collection.
 * @param {string} studentId Student identifier.
 */
export async function getStudentDashboard(studentId) {
  const progress = await ProgressModel.find({ studentId }).lean();
  return {
    enrollments: await prisma.enrollment.count({ where: { studentId } }),
    completedLessons: progress.reduce((total, item) => total + (item.completedLessons || 0), 0)
  };
}

/**
 * Teacher analytics summarizing enrollments per course.
 * @param {string} teacherId Teacher identifier.
 */
export async function getTeacherDashboard(teacherId) {
  const courses = await prisma.course.findMany({
    where: { teacherId },
    include: { _count: { select: { enrollments: true } } }
  });
  return courses.map((course) => ({
    courseId: course.id,
    title: course.title,
    enrollments: course._count.enrollments
  }));
}

/**
 * Admin metrics summarizing platform activity.
 */
export async function getAdminDashboard() {
  const [users, courses, enrollments] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count()
  ]);
  return {
    users,
    courses,
    enrollments
  };
}
