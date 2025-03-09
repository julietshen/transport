// Global test setup
// This file runs before each test file

// Import Jest DOM extensions for React Testing Library
require('@testing-library/jest-dom');

// Suppress console output during tests
beforeAll(() => {
  // Store original console methods
  global.originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  // Only suppress in CI environment
  if (process.env.CI === 'true') {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
  }
});

// Restore console output after tests
afterAll(() => {
  // Only restore if we suppressed
  if (process.env.CI === 'true') {
    console.log = global.originalConsole.log;
    console.error = global.originalConsole.error;
    console.warn = global.originalConsole.warn;
    console.info = global.originalConsole.info;
  }
});

// Set default timeout for all tests
jest.setTimeout(30000);

// Mock global fetch if needed
global.fetch = jest.fn();

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock intersection observer for testing components with useInView or similar hooks
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
}); 