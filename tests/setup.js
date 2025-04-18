import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Increase timeout for all tests
jest.setTimeout(10000);

// Suppress console.error and console.warn in tests
console.error = jest.fn();
console.warn = jest.fn(); 