// ==================================================
// SportVerse AI - Firebase Configuration
// ==================================================
// Google Authentication via Firebase
// ==================================================

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    getRedirectResult,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Force account selection every time
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in with Google — tries popup first, falls back to redirect
 * Returns { idToken, user } on success
 */
export async function signInWithGoogle() {
  let result;
  try {
    result = await signInWithPopup(auth, googleProvider);
  } catch (popupError) {
    // If popup blocked or closed, fall back to redirect
    if (
      popupError.code === 'auth/popup-blocked' ||
      popupError.code === 'auth/popup-closed-by-user' ||
      popupError.code === 'auth/cancelled-popup-request'
    ) {
      await signInWithRedirect(auth, googleProvider);
      // Page will reload after redirect — this line won't execute
      return null;
    }
    throw popupError;
  }

  const idToken = await result.user.getIdToken();
  return {
    idToken,
    user: {
      email: result.user.email,
      name: result.user.displayName,
      photo: result.user.photoURL,
      uid: result.user.uid,
    },
  };
}

/**
 * Check for redirect result on page load (after Google redirect flow)
 * Returns { idToken, user } or null if no redirect happened
 */
export async function checkGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const idToken = await result.user.getIdToken();
      return {
        idToken,
        user: {
          email: result.user.email,
          name: result.user.displayName,
          photo: result.user.photoURL,
          uid: result.user.uid,
        },
      };
    }
  } catch (err) {
    console.error('Google redirect result error:', err);
  }
  return null;
}

export { auth };
export default app;
