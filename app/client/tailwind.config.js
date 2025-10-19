const sharedPreset = require('../shared/theme/tailwind.preset');

module.exports = {
  presets: [sharedPreset],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
};
