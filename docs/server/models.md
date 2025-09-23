# Data Models

## PostgreSQL (Prisma)
- **User**: core identity with role, name, email, password hash, optional profile fields.
- **Course**: learning pathway referencing a teacher and containing metadata.
- **Enrollment**: join table linking students to courses with timestamp.

## MongoDB (Mongoose)
- **Progress**: tracks `studentId`, `courseId`, and `completedLessons` counts for dashboards.
