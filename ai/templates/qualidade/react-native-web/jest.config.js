// Modelo de jest.config.js para módulos React Native Web. Copie para <modulo>/jest.config.js.
// Devs: jest, jest-expo, @testing-library/react-native, @types/jest.
module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}', '!**/*.d.ts'],
  coverageReporters: ['lcov', 'text-summary'],
  coverageDirectory: 'coverage',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
