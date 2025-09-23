import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { vi } from 'vitest';
import theme from '../../theme/index.js';
import LandingPage from './LandingPage.jsx';

vi.mock('../../services/apiClient.js', () => ({
  __esModule: true,
  default: {
    get: vi.fn(async () => ({ data: { highlights: [] } }))
  }
}));

describe('LandingPage', () => {
  it('renders hero heading', () => {
    render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LandingPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Empower young learners/i)).toBeInTheDocument();
  });
});
