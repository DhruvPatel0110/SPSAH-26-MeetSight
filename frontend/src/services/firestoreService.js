// Firestore Service for User Data and Transcript History
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';

// Helper to check if Firestore is available
const checkFirestore = () => {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase/Firestore is not configured. Please add Firebase credentials to .env.local');
  }
};

// Collections
const USERS_COLLECTION = 'users';
const TRANSCRIPTS_COLLECTION = 'transcripts';

// Save user profile
export const saveUserProfile = async (userId, userData) => {
  try {
    checkFirestore();
    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error saving user profile:', error);
    return { success: false, error: error.message };
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    checkFirestore();
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
};

// Save transcript to user's history
export const saveTranscript = async (userId, transcriptData) => {
  try {
    checkFirestore();
    const transcriptRef = doc(collection(db, USERS_COLLECTION, userId, TRANSCRIPTS_COLLECTION));
    await setDoc(transcriptRef, {
      ...transcriptData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: transcriptRef.id };
  } catch (error) {
    console.error('Error saving transcript:', error);
    return { success: false, error: error.message };
  }
};

// Get user's transcript history
export const getTranscriptHistory = async (userId, limitCount = 10) => {
  try {
    checkFirestore();
    const transcriptsRef = collection(db, USERS_COLLECTION, userId, TRANSCRIPTS_COLLECTION);
    const q = query(
      transcriptsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const transcripts = [];
    
    querySnapshot.forEach((doc) => {
      transcripts.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return { success: true, data: transcripts };
  } catch (error) {
    console.error('Error getting transcript history:', error);
    return { success: false, error: error.message };
  }
};

// Get single transcript
export const getTranscript = async (userId, transcriptId) => {
  try {
    checkFirestore();
    const transcriptRef = doc(db, USERS_COLLECTION, userId, TRANSCRIPTS_COLLECTION, transcriptId);
    const transcriptSnap = await getDoc(transcriptRef);
    
    if (transcriptSnap.exists()) {
      return {
        success: true,
        data: {
          id: transcriptSnap.id,
          ...transcriptSnap.data(),
        },
      };
    } else {
      return { success: false, error: 'Transcript not found' };
    }
  } catch (error) {
    console.error('Error getting transcript:', error);
    return { success: false, error: error.message };
  }
};

// Update transcript
export const updateTranscript = async (userId, transcriptId, updates) => {
  try {
    checkFirestore();
    const transcriptRef = doc(db, USERS_COLLECTION, userId, TRANSCRIPTS_COLLECTION, transcriptId);
    await updateDoc(transcriptRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating transcript:', error);
    return { success: false, error: error.message };
  }
};

// Delete transcript
export const deleteTranscript = async (userId, transcriptId) => {
  try {
    checkFirestore();
    const transcriptRef = doc(db, USERS_COLLECTION, userId, TRANSCRIPTS_COLLECTION, transcriptId);
    await deleteDoc(transcriptRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting transcript:', error);
    return { success: false, error: error.message };
  }
};

// Save user preferences
export const saveUserPreferences = async (userId, preferences) => {
  try {
    checkFirestore();
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      preferences,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving preferences:', error);
    return { success: false, error: error.message };
  }
};

// Made with Bob