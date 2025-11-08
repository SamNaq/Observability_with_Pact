module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/provider'],
  testMatch: ['**/*.test.ts'],
  collectCoverage: true,
  coverageReporters: ['json-summary', 'text'],
  coverageDirectory: '<rootDir>/coverage/provider',
  collectCoverageFrom: [
    'provider/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};



