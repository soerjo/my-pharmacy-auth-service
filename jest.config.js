module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: 'src/.*\\.spec.ts$',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^(\\.\\.?/.*)\\.js$': '$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/test-setup.ts'],
  testTimeout: 30000,
  passWithNoTests: true,
};
