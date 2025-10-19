import { useRoutes } from 'react-router-dom';
import routes from './routes.jsx';
import { appRootClassName } from './shared/theme/layout.js';

function App() {
  const element = useRoutes(routes);
  return <div className={appRootClassName}>{element}</div>;
}

export default App;
