import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from './routes.js';

function App() {
  const element = useRoutes(routes);

  return (
    <div className="app-shell">
      <Suspense fallback={<div className="app-shell__loading">Loading...</div>}>
        <div className="app-shell__content">{element}</div>
      </Suspense>
    </div>
  );
}

export default App;
