import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage.jsx';

describe('HomePage', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

  it('highlights the key community roles with their callouts', () => {
    renderPage();

    const expectedRoles = [
      'Students',
      'Creators',
      'Teachers',
      'Coaches',
      'Sponsors',
    ];

    expectedRoles.forEach((role) => {
      expect(screen.getByText(role)).toBeInTheDocument();
    });

    expect(
      screen.getByText('Every milestone is intended to unlock transparent rewards funded by the community.')
    ).toBeInTheDocument();
  });

  it('renders the FAQ accordion so visitors can explore common questions', () => {
    renderPage();

    expect(
      screen.getByRole('button', { name: 'How does Udoy ensure transparency for sponsors?' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Can I volunteer from outside India?' })).toBeInTheDocument();
  });
});
