import { validationResult } from 'express-validator';
import {
  createTopic,
  createChapter,
  createSubject,
  createCourse,
  listTopics,
  listCourses,
  assignCourse,
  enrollStudent,
} from './academics.service.js';

export const listTopicsHandler = async (req, res, next) => {
  try {
    const topics = await listTopics();
    return res.json({ data: topics });
  } catch (error) {
    return next(error);
  }
};

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

export const createTopicHandler = async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const topic = await createTopic({ ...req.body, createdById: req.user.id });
    return res.status(201).json(topic);
  } catch (error) {
    return next(error);
  }
};

export const createChapterHandler = async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const chapter = await createChapter(req.body);
    return res.status(201).json(chapter);
  } catch (error) {
    return next(error);
  }
};

export const createSubjectHandler = async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const subject = await createSubject(req.body);
    return res.status(201).json(subject);
  } catch (error) {
    return next(error);
  }
};

export const createCourseHandler = async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const course = await createCourse({ ...req.body, createdById: req.user.id });
    return res.status(201).json(course);
  } catch (error) {
    return next(error);
  }
};

export const listCoursesHandler = async (req, res, next) => {
  try {
    const courses = await listCourses();
    return res.json({ data: courses });
  } catch (error) {
    return next(error);
  }
};

export const assignCourseHandler = async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const assignment = await assignCourse(req.body.courseId, req.body.studentId, req.user.id);
    return res.status(201).json(assignment);
  } catch (error) {
    return next(error);
  }
};

export const enrollStudentHandler = async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const enrollment = await enrollStudent(req.body.courseId, req.user.id);
    return res.status(201).json(enrollment);
  } catch (error) {
    return next(error);
  }
};
