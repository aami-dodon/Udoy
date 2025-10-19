const sharedPreset = require('../shared/theme/tailwind.preset');

module.exports = {
  // Consume the shared theme so the brand palette, typography, spacing, and
  // form styles stay consistent with the rest of the platform.
  presets: [sharedPreset],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
};
