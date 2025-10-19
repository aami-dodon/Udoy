import LandingPage from './features/landing/LandingPage.jsx';
import HealthCheckPage from './features/home/HealthCheckPage.jsx';
import ThemeShowcasePage from './features/theme/ThemeShowcasePage.jsx';
import ForbiddenPage from './features/errors/ForbiddenPage.jsx';
import NotFoundPage from './features/errors/NotFoundPage.jsx';
import ServerErrorPage from './features/errors/ServerErrorPage.jsx';
import GenericErrorPage from './features/errors/GenericErrorPage.jsx';

const routes = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/health',
    element: <HealthCheckPage />,
  },
  {
    path: '/theme',
    element: <ThemeShowcasePage />,
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
