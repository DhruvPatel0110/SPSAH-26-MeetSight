// Firebase Authentication Service
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';

// Sign in with Google
export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured || !auth) {
    return {
      success: false,
      error: 'Firebase is not configured. Please add Firebase credentials to .env.local',
    };
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: result.user,
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Sign in with Email and Password
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: result.user,
    };
  } catch (error) {
    console.error('Email sign-in error:', error);
    return {
      success: false,
      error: getErrorMessage(error.code),
    };
  }
};

// Sign up with Email and Password
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    
    return {
      success: true,
      user: result.user,
    };
  } catch (error) {
    console.error('Email sign-up error:', error);
    return {
      success: false,
      error: getErrorMessage(error.code),
    };
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign-out error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Listen to auth state changes
export const onAuthChange = (callback) => {
  if (!isFirebaseConfigured || !auth) {
    // If Firebase is not configured, call callback with null immediately
    callback(null);
    return () => {}; // Return empty cleanup function
  }
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  if (!isFirebaseConfigured || !auth) {
    return null;
  }
  return auth.currentUser;
};

// Helper function to get user-friendly error messages
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection',
  };
  
  return errorMessages[errorCode] || 'An error occurred. Please try again';
};

// Made with Bob