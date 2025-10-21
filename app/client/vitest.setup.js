import '@testing-library/jest-dom/vitest';

// Provide a minimal clipboard implementation to satisfy UI utilities that copy values.
if (!navigator.clipboard) {
  Object.assign(navigator, {
    clipboard: {
      writeText: () => Promise.resolve(),
    },
  });
}
