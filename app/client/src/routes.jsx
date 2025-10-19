import HomePage from './features/home/HomePage.jsx';
import ForbiddenPage from './features/errors/ForbiddenPage.jsx';
import NotFoundPage from './features/errors/NotFoundPage.jsx';
import ServerErrorPage from './features/errors/ServerErrorPage.jsx';
import GenericErrorPage from './features/errors/GenericErrorPage.jsx';

const routes = [
  {
    path: '/',
    element: <HomePage />,
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
