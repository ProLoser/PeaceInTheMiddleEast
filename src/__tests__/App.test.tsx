import { createMockUser, createMockAnonymousUser, setMockAuthUser, getMockAuthUser, resetMockAuth } from '../__mocks__/firebaseMock';
import { signInTestUser, signOutTestUser } from '../setupTests';

describe('Firebase Auth Mock', () => {
  beforeEach(() => {
    resetMockAuth();
  });

  describe('Mock User Creation', () => {
    test('creates a default authenticated user', () => {
      const user = createMockUser();
      expect(user.uid).toBe('test-user-id');
      expect(user.email).toBe('test@example.com');
      expect(user.displayName).toBe('Test User');
      expect(user.isAnonymous).toBe(false);
      expect(user.emailVerified).toBe(true);
    });

    test('creates user with custom properties', () => {
      const user = createMockUser({
        uid: 'custom-123',
        displayName: 'Custom Name',
        email: 'custom@test.com',
      });
      expect(user.uid).toBe('custom-123');
      expect(user.displayName).toBe('Custom Name');
      expect(user.email).toBe('custom@test.com');
    });

    test('creates anonymous user', () => {
      const user = createMockAnonymousUser();
      expect(user.isAnonymous).toBe(true);
      expect(user.email).toBe(null);
      expect(user.displayName).toBe(null);
      expect(user.uid).toBe('anonymous-user-id');
    });
  });

  describe('Auth State Management', () => {
    test('sets and gets mock auth user', () => {
      const user = createMockUser({ uid: 'test-123' });
      setMockAuthUser(user);
      
      const currentUser = getMockAuthUser();
      expect(currentUser).toEqual(user);
      expect(currentUser?.uid).toBe('test-123');
    });

    test('resets auth state', () => {
      const user = createMockUser();
      setMockAuthUser(user);
      expect(getMockAuthUser()).toBeTruthy();
      
      resetMockAuth();
      expect(getMockAuthUser()).toBeNull();
    });

    test('handles null user (signed out state)', () => {
      setMockAuthUser(null);
      expect(getMockAuthUser()).toBeNull();
    });
  });

  describe('Test Helper Functions', () => {
    test('signInTestUser helper sets authenticated user', () => {
      const user = signInTestUser({
        uid: 'helper-test-123',
        displayName: 'Helper Test User',
      });
      
      expect(user.uid).toBe('helper-test-123');
      expect(user.displayName).toBe('Helper Test User');
      expect(getMockAuthUser()).toEqual(user);
    });

    test('signOutTestUser helper clears user', () => {
      signInTestUser({ uid: 'test-123' });
      expect(getMockAuthUser()).toBeTruthy();
      
      signOutTestUser();
      expect(getMockAuthUser()).toBeNull();
    });

    test('creates user with defaults when no overrides provided', () => {
      const user = signInTestUser();
      expect(user.uid).toBe('test-user-id');
      expect(user.email).toBe('test@example.com');
      expect(user.displayName).toBe('Test User');
    });
  });

  describe('Multiple User Scenarios', () => {
    test('switches between different users', () => {
      const user1 = createMockUser({ uid: 'user-1', displayName: 'User One' });
      const user2 = createMockUser({ uid: 'user-2', displayName: 'User Two' });
      
      setMockAuthUser(user1);
      expect(getMockAuthUser()?.uid).toBe('user-1');
      
      setMockAuthUser(user2);
      expect(getMockAuthUser()?.uid).toBe('user-2');
    });

    test('switches from authenticated to anonymous user', () => {
      const authUser = createMockUser({ uid: 'auth-user' });
      const anonUser = createMockAnonymousUser();
      
      setMockAuthUser(authUser);
      expect(getMockAuthUser()?.isAnonymous).toBe(false);
      
      setMockAuthUser(anonUser);
      expect(getMockAuthUser()?.isAnonymous).toBe(true);
    });
  });

  describe('User Properties', () => {
    test('mock user has all required fields', () => {
      const user = createMockUser();
      
      expect(user).toHaveProperty('uid');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('displayName');
      expect(user).toHaveProperty('photoURL');
      expect(user).toHaveProperty('emailVerified');
      expect(user).toHaveProperty('isAnonymous');
      expect(user).toHaveProperty('providerData');
      expect(user).toHaveProperty('phoneNumber');
      expect(user).toHaveProperty('metadata');
    });

    test('metadata contains timestamps', () => {
      const user = createMockUser();
      
      expect(user.metadata).toBeDefined();
      expect(user.metadata.creationTime).toBeDefined();
      expect(user.metadata.lastSignInTime).toBeDefined();
    });
  });
});

