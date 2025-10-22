import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';

describe('App routing', () => {
  it('renders the home page hero when visiting the root path', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole('heading', {
        name: /Udoy is being built as the launchpad for children ready to rise above circumstance\./i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Join as a sponsor/i })).toBeInTheDocument();
  });

  it('falls back to the not found page for unknown routes', async () => {
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole('heading', {
        name: /We can’t seem to find that page\./i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to home/i })).toBeInTheDocument();
  });
});
