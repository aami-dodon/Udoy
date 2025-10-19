import HomePage from './features/home/HomePage.jsx';
import ThemeShowcasePage from './features/theme/ThemeShowcasePage.jsx';

const routes = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/theme',
    element: <ThemeShowcasePage />,
  },
];

export default routes;
