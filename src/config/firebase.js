const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Using service account file path
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin initialized successfully');
    } else {
      throw new Error('Firebase service account path not found in .env file');
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    console.error('Make sure serviceAccountKey.json exists and .env is configured correctly');
    process.exit(1);
  }
};

// Get Firestore instance
const db = () => admin.firestore();

// Get Auth instance
const auth = () => admin.auth();

// Collections
const collections = {
  USERS: 'users',
  EVENTS: 'events',
  TASKS: 'tasks',
  GIFTS: 'gifts',
  STAFF: 'staff',
  REFRESH_TOKENS: 'refreshTokens'
};

module.exports = {
  initializeFirebase,
  db,
  auth,
  admin,
  collections
};