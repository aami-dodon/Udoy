import { prisma } from '../../config/database.js';

/**
 * Fetch public courses from Prisma.
 * @returns {Promise<import('../../../../shared/types/index.js').Course[]>}
 */
export async function listCourses() {
  return prisma.course.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      teacherId: true
    }
  });
}

/**
 * Get course detail by ID.
 * @param {string} id Course identifier.
 * @returns {Promise<import('../../../../shared/types/index.js').Course | null>}
 */
export async function getCourseById(id) {
  return prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      teacherId: true
    }
  });
}

/**
 * Enroll a student into a course.
 * @param {{courseId: string, studentId: string}} payload Enrollment payload.
 * @returns {Promise<import('../../../../shared/types/index.js').Enrollment>}
 */
export async function enrollStudent(payload) {
  return prisma.enrollment.create({
    data: {
      courseId: payload.courseId,
      studentId: payload.studentId
    },
    select: {
      id: true,
      courseId: true,
      studentId: true,
      enrolledAt: true
    }
  });
}
