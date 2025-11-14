// Jest setup file for test environment configuration
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set default timeout for tests
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output (optional)
global.console = {
  ...console,
  // Uncomment to suppress console logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn(), // Keep error logs visible
};
