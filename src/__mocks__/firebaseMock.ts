// Mock Firebase Auth for testing
// This module provides utilities to bypass Firebase authentication in tests

import type firebase from 'firebase/compat/app';

export interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  providerData: any[];
  phoneNumber: string | null;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  providerData: [],
  phoneNumber: null,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  ...overrides,
});

export const createMockAnonymousUser = (): MockUser => 
  createMockUser({
    uid: 'anonymous-user-id',
    email: null,
    displayName: null,
    isAnonymous: true,
  });

let currentMockUser: MockUser | null = null;
let authStateCallbacks: Array<(user: MockUser | null) => void> = [];

export const mockFirebaseAuth = () => {
  const auth = jest.fn(() => ({
    currentUser: currentMockUser,
    onAuthStateChanged: jest.fn((callback: (user: MockUser | null) => void) => {
      authStateCallbacks.push(callback);
      callback(currentMockUser);
      return jest.fn(() => {
        authStateCallbacks = authStateCallbacks.filter(cb => cb !== callback);
      });
    }),
    signInAnonymously: jest.fn(async () => ({
      user: currentMockUser,
    })),
    signInWithEmailAndPassword: jest.fn(async (email: string, password: string) => ({
      user: currentMockUser,
    })),
    signOut: jest.fn(async () => {
      currentMockUser = null;
      authStateCallbacks.forEach(cb => cb(null));
    }),
  }));

  return auth;
};

export const mockFirebaseDatabase = () => {
  const mockRef = jest.fn(() => ({
    get: jest.fn(async () => ({
      exists: jest.fn(() => false),
      val: jest.fn(() => null),
    })),
    set: jest.fn(async () => {}),
    update: jest.fn(async () => {}),
    remove: jest.fn(async () => {}),
    on: jest.fn(),
    off: jest.fn(),
    push: jest.fn(() => ({
      key: 'mock-key-' + Math.random().toString(36).substring(7),
    })),
  }));

  return jest.fn(() => ({
    ref: mockRef,
  }));
};

export const mockFirebaseMessaging = () => {
  return jest.fn(() => ({
    getToken: jest.fn(async () => 'mock-fcm-token'),
    deleteToken: jest.fn(async () => {}),
    onMessage: jest.fn(),
  }));
};

export const setMockAuthUser = (user: MockUser | null) => {
  currentMockUser = user;
  authStateCallbacks.forEach(cb => cb(user));
};

export const getMockAuthUser = () => currentMockUser;

export const resetMockAuth = () => {
  currentMockUser = null;
  authStateCallbacks = [];
};

export const createMockFirebase = () => {
  const firebase = {
    auth: mockFirebaseAuth(),
    database: mockFirebaseDatabase(),
    messaging: mockFirebaseMessaging(),
    initializeApp: jest.fn(),
  };

  return firebase;
};
