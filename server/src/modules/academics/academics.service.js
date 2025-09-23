import { prisma } from '../../config/database.js';

export const createTopic = (data) =>
  prisma.topic.create({ data, include: { chapters: true } });

export const listTopics = () =>
  prisma.topic.findMany({ include: { chapters: { include: { subjects: { include: { courses: true } } } } } });

export const createChapter = (data) =>
  prisma.chapter.create({ data, include: { subjects: true } });

export const createSubject = (data) =>
  prisma.subject.create({ data, include: { courses: true } });

export const createCourse = (data) =>
  prisma.course.create({ data, include: { modules: true } });

export const assignCourse = (courseId, studentId, assignedById) =>
  prisma.assignment.create({
    data: {
      courseId,
      studentId,
      assignedById,
    },
  });

export const enrollStudent = (courseId, studentId) =>
  prisma.enrollment.create({ data: { courseId, studentId, status: 'active' } });

export const listCourses = (filter = {}) =>
  prisma.course.findMany({
    where: filter,
    include: {
      subject: {
        include: {
          chapter: {
            include: {
              topic: true,
            },
          },
        },
      },
      modules: true,
    },
  });
