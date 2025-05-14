// jest.config.js - Updated to use babel-jest for tests only
/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    // Updated paths for your specific project structure with src directory
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    // Use babel-jest for test transformations only
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest'],
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  testMatch: [
    '**/__test__/**/*.test.{js,jsx,ts,tsx}',
    '**/?(*.)+(spec|test).{js,jsx,ts,tsx}',
  ],
  roots: ['<rootDir>/src', '<rootDir>/__test__'],
};

module.exports = config;
