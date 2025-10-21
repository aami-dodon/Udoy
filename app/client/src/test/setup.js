import '@testing-library/jest-dom/vitest';

// Provide a basic matchMedia mock for components that rely on it.
if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
    media: '',
  });
}
