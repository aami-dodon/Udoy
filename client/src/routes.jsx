import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './common/ProtectedRoute.jsx';
import HelloPage from './features/hello/pages/HelloPage.jsx';
import LoginPage from './features/auth/pages/LoginPage.jsx';
import SignupPage from './features/auth/pages/SignupPage.jsx';
import DashboardPage from './features/dashboard/pages/DashboardPage.jsx';
import { ROLES } from '@shared/constants/index.js';

const allowedRoles = Object.values(ROLES);

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HelloPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route
      path="/dashboard"
      element={<ProtectedRoute roles={allowedRoles} element={<DashboardPage />} />}
    />
  </Routes>
);

export default AppRoutes;
