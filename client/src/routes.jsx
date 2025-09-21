import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './common/ProtectedRoute.jsx';
import HelloPage from './features/hello/pages/HelloPage.jsx';
import LoginPage from './features/auth/pages/LoginPage.jsx';
import SignupPage from './features/auth/pages/SignupPage.jsx';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage.jsx';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage.jsx';
import DashboardPage from './features/dashboard/pages/DashboardPage.jsx';
import ProfilePage from './features/profile/pages/ProfilePage.jsx';
import AdminUsersPage from './features/admin/pages/AdminUsersPage.jsx';
import { ROLES } from '@shared/constants/index.js';

const allowedRoles = Object.values(ROLES);

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HelloPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/verify-email" element={<VerifyEmailPage />} />
    <Route
      path="/dashboard"
      element={<ProtectedRoute roles={allowedRoles} element={<DashboardPage />} />}
    />
    <Route
      path="/profile"
      element={<ProtectedRoute roles={allowedRoles} element={<ProfilePage />} />}
    />
    <Route
      path="/admin/users"
      element={<ProtectedRoute roles={[ROLES.ADMIN]} element={<AdminUsersPage />} />}
    />
  </Routes>
);

export default AppRoutes;
