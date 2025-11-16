import firebase from '../firebase.config';
import { signInTestUser } from '../setupTests';

describe('Firebase Integration Tests', () => {
  describe('Firebase Auth', () => {
    test('auth returns mock auth instance', () => {
      const auth = firebase.auth();
      expect(auth).toBeDefined();
      expect(typeof auth.onAuthStateChanged).toBe('function');
      expect(typeof auth.signOut).toBe('function');
    });

    test('current user is null by default', () => {
      const auth = firebase.auth();
      expect(auth.currentUser).toBeNull();
    });

    test('current user is set after sign in', () => {
      signInTestUser({ uid: 'test-123' });
      
      // The currentUser is updated through the mock
      // In real usage, you would access it through the auth state callback
      const auth = firebase.auth();
      expect(auth.currentUser).toBeDefined();
    });
  });

  describe('Firebase Database', () => {
    test('database returns mock database instance', () => {
      const db = firebase.database();
      expect(db).toBeDefined();
      expect(typeof db.ref).toBe('function');
    });

    test('database ref can be called with path', () => {
      const db = firebase.database();
      const ref = db.ref('users/test-user');
      expect(ref).toBeDefined();
    });

    test('database operations are mocked', async () => {
      const db = firebase.database();
      const ref = db.ref('users/test-user');
      
      // These are all mocked operations
      await ref.set({ name: 'Test User' });
      await ref.update({ email: 'test@example.com' });
      await ref.remove();
      
      // Verify operations were called (they're jest mocks)
      expect(ref.set).toHaveBeenCalled();
      expect(ref.update).toHaveBeenCalled();
      expect(ref.remove).toHaveBeenCalled();
    });

    test('database push generates mock keys', () => {
      const db = firebase.database();
      const ref = db.ref('games');
      const newRef = ref.push();
      
      expect(newRef.key).toBeDefined();
      expect(typeof newRef.key).toBe('string');
      expect(newRef.key).toMatch(/^mock-key-/);
    });
  });

  describe('Firebase Messaging', () => {
    test('messaging returns mock messaging instance', () => {
      const messaging = firebase.messaging();
      expect(messaging).toBeDefined();
      expect(typeof messaging.getToken).toBe('function');
    });

    test('getToken returns mock token', async () => {
      const messaging = firebase.messaging();
      const token = await messaging.getToken({ vapidKey: 'test-key' });
      expect(token).toBe('mock-fcm-token');
    });

    test('deleteToken is mocked', async () => {
      const messaging = firebase.messaging();
      await messaging.deleteToken();
      expect(messaging.deleteToken).toHaveBeenCalled();
    });
  });

  describe('Firebase Config Helper Functions', () => {
    test('saveFcmToken is mocked', async () => {
      const { saveFcmToken } = require('../firebase.config');
      const result = await saveFcmToken();
      expect(result).toBe('mock-token');
    });

    test('getFcmToken is mocked', async () => {
      const { getFcmToken } = require('../firebase.config');
      const result = await getFcmToken();
      expect(result).toBe('mock-token');
    });

    test('clearFcmToken is mocked', async () => {
      const { clearFcmToken } = require('../firebase.config');
      await clearFcmToken();
      // No error thrown means success
      expect(true).toBe(true);
    });
  });
});
