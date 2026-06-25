import { expect, afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { }, // deprecated
        removeListener: () => { }, // deprecated
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => { },
    }),
});

// Mock localStorage
const localStorageMock = {
    getItem: (key) => localStorageMock.store[key] || null,
    setItem: (key, value) => {
        localStorageMock.store[key] = value.toString();
    },
    removeItem: (key) => {
        delete localStorageMock.store[key];
    },
    clear: () => {
        localStorageMock.store = {};
    },
    store: {},
};

global.localStorage = localStorageMock;

// Reset localStorage before each test
beforeEach(() => {
    localStorageMock.clear();
});
