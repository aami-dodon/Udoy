import { useRoutes } from 'react-router-dom';
import routes from './routes.jsx';
function App() {
  const element = useRoutes(routes);
  return <div className="app-shell">{element}</div>;
}

export default App;
