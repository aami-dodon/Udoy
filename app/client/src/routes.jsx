import { lazy } from 'react';
import RequireAuth from './features/auth/components/RequireAuth.jsx';
import RequireRole from './features/auth/components/RequireRole.jsx';
import HomePage from './features/home/HomePage.jsx';

const HealthPage = lazy(() => import('./features/health/HealthPage.jsx'));
const LoginPage = lazy(() => import('./features/auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('./features/auth/ResetPasswordPage.jsx'));
const VerifyTokenPage = lazy(() => import('./features/auth/VerifyTokenPage.jsx'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage.jsx'));
const ProfilePage = lazy(() => import('./features/profile/ProfilePage.jsx'));
const AdminUsersPage = lazy(() => import('./features/admin/AdminUsersPage.jsx'));
const TopicListPage = lazy(() => import('./features/topics/TopicListPage.jsx'));
const TopicEditorPage = lazy(() => import('./features/topics/TopicEditorPage.jsx'));
const TopicDetailPage = lazy(() => import('./features/topics/TopicDetailPage.jsx'));
const ForbiddenPage = lazy(() => import('./features/errors/ForbiddenPage.jsx'));
const ServerErrorPage = lazy(() => import('./features/errors/ServerErrorPage.jsx'));
const GenericErrorPage = lazy(() => import('./features/errors/GenericErrorPage.jsx'));
const NotFoundPage = lazy(() => import('./features/errors/NotFoundPage.jsx'));

const routes = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/health',
    element: <HealthPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/verify-token',
    element: <VerifyTokenPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyTokenPage />,
  },
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <DashboardPage />
      </RequireAuth>
    ),
  },
  {
    path: '/profile',
    element: (
      <RequireAuth>
        <ProfilePage />
      </RequireAuth>
    ),
  },
  {
    path: '/topics',
    element: (
      <RequireRole roles={['creator', 'teacher', 'admin']}>
        <TopicListPage />
      </RequireRole>
    ),
  },
  {
    path: '/topics/new',
    element: (
      <RequireRole roles={['creator', 'admin']}>
        <TopicEditorPage />
      </RequireRole>
    ),
  },
  {
    path: '/topics/:id',
    element: (
      <RequireRole roles={['creator', 'teacher', 'admin']}>
        <TopicDetailPage />
      </RequireRole>
    ),
  },
  {
    path: '/topics/:id/edit',
    element: (
      <RequireRole roles={['creator', 'admin']}>
        <TopicEditorPage />
      </RequireRole>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <RequireRole roles='admin'>
        <AdminUsersPage />
      </RequireRole>
    ),
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    path: '/500',
    element: <ServerErrorPage />,
  },
  {
    path: '/error',
    element: <GenericErrorPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default routes;
