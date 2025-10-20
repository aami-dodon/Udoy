import { lazy } from 'react';

const HomePage = lazy(() => import('./features/home/HomePage.jsx'));
const HealthPage = lazy(() => import('./features/health/HealthPage.jsx'));

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
