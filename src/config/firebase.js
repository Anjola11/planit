const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if service account key is provided as JSON string (Railway/Production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin initialized successfully (from env variable)');
    } 
    // Check if service account path is provided (Local development)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin initialized successfully (from file)');
    } 
    else {
      throw new Error('Firebase service account not configured. Set either FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH');
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    console.error('Make sure Firebase credentials are properly configured');
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