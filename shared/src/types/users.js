/**
 * @typedef {Object} Role
 * @property {'student'|'teacher'|'admin'} name - Role identifier.
 * @property {string} description - Description of the role responsibilities.
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id - UUID identifier.
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {'student'|'teacher'|'admin'} role
 * @property {number} classLevel - Numeric class/grade (4-8 for students).
 * @property {string=} bio - Teacher biography field.
 * @property {string=} avatarUrl
 */

export const roles = ['student', 'teacher', 'admin'];

export const userClassLevels = [4, 5, 6, 7, 8];
