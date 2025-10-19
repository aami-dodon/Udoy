import { useRoutes } from 'react-router-dom';
import routes from './routes.jsx';
function App() {
  const element = useRoutes(routes);
  return (
    <div className="app-shell">
      <div className="app-shell__content">{element}</div>
    </div>
  );
}

export default App;
