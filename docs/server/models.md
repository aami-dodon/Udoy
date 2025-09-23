# Server Models

## Relational (PostgreSQL via Prisma)
- **User**: Stores core identity, role, and profile metadata.
- **TeacherProfile**: Teacher-specific extensions (bio, expertise).
- **StudentProfile**: Student grade and guardian contact.
- **Topic → Chapter → Subject → Course**: Academic hierarchy with class level bounds and ownership info.
- **CourseModule**: Sequenced learning units inside courses.
- **Enrollment**: Student registration and status tracking.
- **Assignment**: Mapping of teacher/admin assigned courses to students.
- **SystemSetting**: Key/value configuration entries maintained by admins.

## Document (MongoDB via Mongoose)
- **ProgressSnapshot**: Per student/course completion metadata, quiz scores, and timestamps.
- **AuditLog**: Immutable record of sensitive admin changes.
