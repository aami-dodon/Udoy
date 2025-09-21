import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HelloPage from './features/hello/pages/HelloPage.jsx';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HelloPage />} />
  </Routes>
);

export default AppRoutes;
