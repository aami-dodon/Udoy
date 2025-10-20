import { lazy } from 'react';

const HomePage = lazy(() => import('./features/home/HomePage.jsx'));
const ThemePage = lazy(() => import('./features/theme/ThemePage.jsx'));
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
    path: '/theme',
    element: <ThemePage />,
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
