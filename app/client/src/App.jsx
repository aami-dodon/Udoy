import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from './routes.jsx';
function App() {
  const element = useRoutes(routes);
  return (
    <div className="app-shell">
      <div className="app-shell__content">
        <Suspense
          fallback={(
            <div className="flex w-full justify-center py-10 text-sm text-muted-foreground">
              Loading experience…
            </div>
          )}
        >
          {element}
        </Suspense>
      </div>
    </div>
  );
}

export default App;
