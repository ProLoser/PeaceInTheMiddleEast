import '@testing-library/jest-dom';
import { createMockFirebase, setMockAuthUser, createMockUser, resetMockAuth } from './__mocks__/firebaseMock';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for jsdom
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

// Mock firebase/compat/auth
jest.mock('firebase/compat/auth', () => ({}));

// Mock firebase/compat/database
jest.mock('firebase/compat/database', () => ({}));

// Mock firebase/compat/messaging
jest.mock('firebase/compat/messaging', () => ({}));

// Mock firebase module
jest.mock('./firebase.config', () => {
  const mockFirebase = createMockFirebase();
  return {
    __esModule: true,
    default: mockFirebase,
    config: {
      apiKey: "test-api-key",
      authDomain: "test.firebaseapp.com",
      databaseURL: "https://test.firebaseio.com",
      projectId: "test-project",
      storageBucket: "test.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abc123",
      measurementId: "G-TEST123"
    },
    saveFcmToken: jest.fn(async () => 'mock-token'),
    getFcmToken: jest.fn(async () => 'mock-token'),
    clearFcmToken: jest.fn(async () => {}),
  };
});

// Mock firebaseui
jest.mock('firebaseui', () => ({
  auth: {
    AuthUI: jest.fn().mockImplementation(() => ({
      start: jest.fn(),
      reset: jest.fn(),
    })),
    AnonymousAuthProvider: {
      PROVIDER_ID: 'anonymous',
    },
  },
}));

// Mock firebase/compat/app
jest.mock('firebase/compat/app', () => {
  const mockFirebase = createMockFirebase();
  return {
    __esModule: true,
    default: {
      ...mockFirebase,
      auth: {
        EmailAuthProvider: {
          PROVIDER_ID: 'password',
        },
        GoogleAuthProvider: {
          PROVIDER_ID: 'google.com',
        },
      },
    },
  };
});

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn();
  }),
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Mock Sentry
jest.mock('@sentry/react', () => ({
  ErrorBoundary: ({ children }: any) => children,
  init: jest.fn(),
  captureException: jest.fn(),
}));

// Mock audio
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn(),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: jest.fn(),
});

// Reset auth state before each test
beforeEach(() => {
  resetMockAuth();
});

// Utility to sign in a mock user in tests
export const signInTestUser = (userOverrides?: any) => {
  const user = createMockUser(userOverrides);
  setMockAuthUser(user);
  return user;
};

// Utility to sign out in tests
export const signOutTestUser = () => {
  setMockAuthUser(null);
};
