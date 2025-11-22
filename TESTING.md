# Testing with Firebase Authentication Mocks

This project includes a comprehensive testing setup that allows you to bypass Firebase authentication during tests.

## Overview

The testing infrastructure provides:
- **Firebase Auth Mocking**: Mock Firebase authentication without needing real credentials
- **User State Control**: Programmatically sign in/out test users
- **Complete Test Isolation**: Each test runs with a clean authentication state

## Setup

All necessary testing dependencies are already installed. The test setup includes:

- **Jest**: Test runner
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: DOM matchers
- **ts-jest**: TypeScript support for Jest

## Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode (auto-rerun on file changes)
yarn test:watch

# Run tests with coverage report
yarn test:coverage
```

## How It Works

### Mock Files

1. **`src/__mocks__/firebaseMock.ts`**: Core Firebase mocking utilities
   - `createMockUser()`: Create a mock authenticated user
   - `createMockAnonymousUser()`: Create a mock anonymous user
   - `setMockAuthUser()`: Set the current authenticated user
   - `mockFirebaseAuth()`: Mock Firebase auth functions
   - `mockFirebaseDatabase()`: Mock Firebase database functions

2. **`src/setupTests.ts`**: Test environment setup
   - Configures all Firebase mocks globally
   - Provides helper functions: `signInTestUser()` and `signOutTestUser()`
   - Automatically resets auth state before each test

### Writing Tests

#### Basic Test Example

```typescript
import { render } from '@testing-library/react';
import { App } from './index';

test('renders app without authentication', () => {
  render(<App />);
  // Your assertions here
});
```

#### Testing with Authenticated User

```typescript
import { render } from '@testing-library/react';
import { App } from './index';
import { signInTestUser } from './setupTests';

test('renders app with authenticated user', () => {
  // Sign in a mock user
  signInTestUser({
    uid: 'test-user-123',
    displayName: 'Test Player',
    email: 'player@test.com',
  });

  render(<App />);
  // Your assertions here
});
```

#### Testing with Anonymous User

```typescript
import { signInTestUser } from './setupTests';

test('renders app with anonymous user', () => {
  signInTestUser({
    uid: 'anon-123',
    displayName: null,
    email: null,
    isAnonymous: true,
  });

  render(<App />);
  // Your assertions here
});
```

#### Testing Sign Out

```typescript
import { signInTestUser, signOutTestUser } from './setupTests';

test('handles user sign out', () => {
  signInTestUser({ uid: 'test-123' });
  render(<App />);
  
  // Sign out the user
  signOutTestUser();
  
  // Your assertions here
});
```

## Mock User Properties

When creating a mock user with `signInTestUser()`, you can override any of these properties:

```typescript
{
  uid: string;              // User ID (default: 'test-user-id')
  email: string | null;     // Email (default: 'test@example.com')
  displayName: string | null; // Display name (default: 'Test User')
  photoURL: string | null;  // Photo URL (default: null)
  emailVerified: boolean;   // Email verified status (default: true)
  isAnonymous: boolean;     // Anonymous status (default: false)
  phoneNumber: string | null; // Phone (default: null)
}
```

## Examples

See `src/__tests__/App.test.tsx` for complete working examples.

## Troubleshooting

### Import Errors

If you see import errors related to Firebase, ensure your test file imports from the mocked modules:

```typescript
// This is automatically mocked in setupTests.ts
import firebase from './firebase.config';
```

### Auth State Not Updating

If auth state changes don't reflect in your test:

1. Make sure you call `signInTestUser()` or `signOutTestUser()` before rendering
2. Check that `setupTests.ts` is properly configured in `jest.config.ts`
3. Verify `beforeEach` hooks aren't interfering with auth state

## Best Practices

1. **Reset state between tests**: The setup automatically resets auth state before each test
2. **Use descriptive user IDs**: Make test users identifiable (e.g., 'user-for-game-test')
3. **Test both authenticated and unauthenticated states**: Ensure your app works in all scenarios
4. **Don't test Firebase itself**: Focus on testing your app's logic, not Firebase's behavior

## Advanced Usage

### Custom Firebase Mock Behavior

You can customize mock behavior in individual tests:

```typescript
import { createMockFirebase } from './__mocks__/firebaseMock';

test('custom firebase behavior', () => {
  const mockFirebase = createMockFirebase();
  // Customize mock behavior as needed
});
```

### Mocking Database Responses

```typescript
import firebase from './firebase.config';

jest.spyOn(firebase.database().ref(), 'get').mockResolvedValue({
  exists: () => true,
  val: () => ({ name: 'Test Data' }),
});
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
