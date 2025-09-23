/**
 * @typedef {object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'student'|'teacher'|'admin'} role
 * @property {string=} grade
 * @property {string=} bio
 */

/**
 * @typedef {object} Course
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {string} teacherId
 */

/**
 * @typedef {object} Enrollment
 * @property {string} id
 * @property {string} courseId
 * @property {string} studentId
 * @property {Date} enrolledAt
 */

/**
 * @typedef {object} DashboardMetric
 * @property {string} label
 * @property {number|string} value
 * @property {string} description
 */

export const types = {};
