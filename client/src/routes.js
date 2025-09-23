import LandingPage from './features/landing/LandingPage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import SignupPage from './features/auth/SignupPage.jsx';
import StudentDashboard from './features/dashboard/StudentDashboard.jsx';
import TeacherDashboard from './features/dashboard/TeacherDashboard.jsx';
import AdminDashboard from './features/dashboard/AdminDashboard.jsx';
import CourseCatalog from './features/courses/CourseCatalog.jsx';
import CourseDetail from './features/courses/CourseDetail.jsx';

const routes = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/dashboard/student', element: <StudentDashboard /> },
  { path: '/dashboard/teacher', element: <TeacherDashboard /> },
  { path: '/dashboard/admin', element: <AdminDashboard /> },
  { path: '/courses', element: <CourseCatalog /> },
  { path: '/courses/:id', element: <CourseDetail /> }
];

export default routes;
