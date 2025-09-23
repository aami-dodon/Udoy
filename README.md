# UDOY
A lightweight, community-driven learning app built for kids and young learners. 

# 📌 Key Features by User Role

## 👨‍🎓 Students
- Sign up, verify email, log in (JWT auth).  
- Manage profile (name, email, password, grade, interests, profile picture).  
- Browse available courses.  
- Enroll in courses.  
- Watch video lessons (streamed from MinIO).  
- Track learning progress (resume, completion %, progress bar).  
- Take quizzes within lessons/courses.  
- Receive certificates after course completion.  
- View dashboard with enrolled courses and progress.  

## 👩‍🏫 Teachers
- Sign up, verify email, log in (JWT auth).  
- Manage profile (name, email, password, bio, expertise, profile picture).  
- Create and manage courses (title, description, category).  
- Add lessons with video content (upload via MinIO).  
- Add and manage quizzes.  
- Monitor student enrollment in their courses.  
- Track student performance (progress + quiz results).  
- Issue certificates (auto-generated PDFs).  
- View analytics dashboard (course enrollments, completion rates, quiz stats).  

## 🛡️ Admins
- Manage all users (view, edit, deactivate, delete).  
- Assign or change user roles (student, teacher, admin).  
- View audit logs of sensitive actions (account changes, deletions).  
- Moderate student and teacher profiles.  
- Manage course content (approve, deactivate, delete if needed).  
- Access global platform analytics (active users, enrollments, course stats).  
- Export reports (CSV/Excel).  
- Configure platform-wide settings (CORS origins, rate limits, etc.).  

---

# 📌 Tech Stack

## 🌐 Frontend
- **React (Vite)** → modern, fast dev/build tool.  
- **Material UI (MUI)** → standard UI component library.  
- **React Router DOM** → route management.  
- **Axios / Fetch API** → API calls.  
- **React Context / Hooks** → state management (lightweight, no Redux overhead).  
- **React Testing Library + Jest** → unit/integration testing.  

## ⚙️ Backend
- **Node.js + Express** → web framework.  
- **Prisma** → ORM for PostgreSQL.  
- **Mongoose** → ODM for MongoDB.  
- **MinIO SDK** → S3-compatible object storage client.  
- **Winston + Morgan** → logging (structured JSON + HTTP logs).  
- **Swagger (swagger-jsdoc + swagger-ui-express)** → API documentation.  
- **Jest + Supertest** → backend testing.  

## 🔐 Security
- **bcrypt** → password hashing.  
- **jsonwebtoken (JWT)** → authentication tokens.  
- **express-rate-limit** → rate limiting for sensitive endpoints.  
- **helmet** → secure HTTP headers.  
- **cors** → Cross-Origin Resource Sharing (support multiple origins).  
- **express-validator** → input validation and sanitization.  
- **RBAC middleware** → role-based access control.  
- **Presigned URLs** → secure uploads/downloads for MinIO.  

## 🗄️ Databases
- **PostgreSQL (with Prisma)** → relational data (users, courses, enrollments, quizzes, certificates).  
- **MongoDB (with Mongoose)** → flexible data (progress tracking, logs, quiz attempts, events).  

## 📦 Storage
- **MinIO (S3-compatible)** → for videos, profile pictures, certificates.  
- **Presigned URLs** → secure client uploads/downloads.  
- **Optional Worker Queue (BullMQ/Redis)** → for async tasks like image compression, certificate generation.  

## 🐳 Infrastructure
- **Docker** → containerization for client + server.  
- **docker-compose** → orchestrate multi-container setup.  
- **dotenv** → environment variable management (`.env`, `.env.example`).  