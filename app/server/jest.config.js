export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/index.js'],
  coverageDirectory: 'coverage',
  testMatch: ['**/__tests__/**/*.test.js'],
};
