import { ThemeProvider, CssBaseline } from '@mui/material';
import { useRoutes } from 'react-router-dom';
import routes from './routes.js';
import theme from './theme/index.js';
import MainLayout from './layouts/MainLayout.jsx';

/**
 * Application entry component wrapping routes in a shared layout.
 * @returns {JSX.Element} The rendered application shell.
 */
function App() {
  const element = useRoutes(routes);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainLayout>{element}</MainLayout>
    </ThemeProvider>
  );
}

export default App;
