import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from './routes.jsx';

function App() {
  const element = useRoutes(routes);

  return (
    <div className="min-h-screen bg-porcelain text-black-olive">
      <Suspense
        fallback={(
          <div className="flex min-h-screen items-center justify-center bg-porcelain text-sm text-neutral-600">
            Preparing Udoy experience…
          </div>
        )}
      >
        {element}
      </Suspense>
    </div>
  );
}

export default App;
