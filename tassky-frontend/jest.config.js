/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest'],
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  testMatch: [
    '**/__test__/**/*.test.{js,jsx,ts,tsx}',
    '**/*.test.{js,jsx,ts,tsx}',
  ],
  roots: ['<rootDir>/src', '<rootDir>/__test__'],
};

module.exports = config;
