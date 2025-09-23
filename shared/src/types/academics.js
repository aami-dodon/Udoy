/**
 * @typedef {Object} Topic
 * @property {string} id
 * @property {string} title
 * @property {string} description
 */

/**
 * @typedef {Object} Chapter
 * @property {string} id
 * @property {string} title
 * @property {string} topicId
 */

/**
 * @typedef {Object} Subject
 * @property {string} id
 * @property {string} title
 * @property {string} chapterId
 */

/**
 * @typedef {Object} Course
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {number} classLevel
 * @property {string} subjectId
 * @property {string} createdBy - Teacher ID.
 */

/**
 * @typedef {Object} CourseAssignment
 * @property {string} courseId
 * @property {string} studentId
 * @property {string} assignedBy - Teacher or admin ID.
 */

export const academicHierarchy = ['Topic', 'Chapter', 'Subject', 'Course'];
