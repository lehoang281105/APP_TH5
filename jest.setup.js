/* eslint-env jest */
const mockStorage = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key) => Promise.resolve(mockStorage.get(key) || null)),
  setItem: jest.fn((key, value) => {
    mockStorage.set(key, value);
    return Promise.resolve();
  }),
  removeItem: jest.fn((key) => {
    mockStorage.delete(key);
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    mockStorage.clear();
    return Promise.resolve();
  }),
}));

jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn((success) =>
    success({ coords: { latitude: 21.0285, longitude: 105.8542 } })
  ),
  requestAuthorization: jest.fn(),
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => [{ name: '[DEFAULT]' }]),
  getApp: jest.fn(() => ({ name: '[DEFAULT]' })),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'test-user-1', email: 'test@example.com', displayName: 'Test User' },
  })),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({ uid: 'test-user-1', email: 'test@example.com', displayName: 'Test User' });
    return jest.fn();
  }),
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(() => ({})),
  ref: jest.fn(),
  push: jest.fn(() => ({ key: 'mock-key' })),
  set: jest.fn(() => Promise.resolve()),
  get: jest.fn(() => Promise.resolve({ exists: () => false, val: () => null })),
  onValue: jest.fn((ref, callback) => {
    callback({ val: () => ({}) });
    return jest.fn();
  }),
  onDisconnect: jest.fn(() => ({
    update: jest.fn(() => Promise.resolve()),
  })),
  serverTimestamp: jest.fn(() => Date.now()),
  update: jest.fn(() => Promise.resolve()),
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return new Proxy(
    {},
    {
      get: () => {
        return (props) => React.createElement(View, props);
      },
    }
  );
});
