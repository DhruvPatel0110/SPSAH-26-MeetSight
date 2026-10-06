// Conversation History Service for storing and retrieving chat sessions
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
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const CONVERSATIONS_COLLECTION = 'conversations';

/**
 * Create a new conversation session
 * @param {string} userId - User ID
 * @param {string} transcriptId - Associated transcript ID
 * @param {string} title - Conversation title
 * @returns {Promise<Object>} - Created conversation with ID
 */
export const createConversation = async (userId, transcriptId, title = 'New Conversation') => {
  try {
    const conversationRef = doc(collection(db, CONVERSATIONS_COLLECTION));
    const conversationData = {
      userId,
      transcriptId,
      title,
      messages: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
    };

    await setDoc(conversationRef, conversationData);
    
    return {
      success: true,
      id: conversationRef.id,
      data: conversationData,
    };
  } catch (error) {
    console.error('Error creating conversation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Add a message to a conversation
 * @param {string} conversationId - Conversation ID
 * @param {Object} message - Message object {role: 'user'|'assistant', content: string, timestamp: Date}
 * @returns {Promise<Object>} - Success status
 */
export const addMessage = async (conversationId, message) => {
  try {
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    
    const messageWithTimestamp = {
      ...message,
      timestamp: new Date().toISOString(),
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    await updateDoc(conversationRef, {
      messages: arrayUnion(messageWithTimestamp),
      lastMessage: messageWithTimestamp.content,
      updatedAt: serverTimestamp(),
    });

    return { success: true, message: messageWithTimestamp };
  } catch (error) {
    console.error('Error adding message:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get a conversation by ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} - Conversation data
 */
export const getConversation = async (conversationId) => {
  try {
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
      return {
        success: true,
        data: {
          id: conversationSnap.id,
          ...conversationSnap.data(),
        },
      };
    } else {
      return { success: false, error: 'Conversation not found' };
    }
  } catch (error) {
    console.error('Error getting conversation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all conversations for a user
 * @param {string} userId - User ID
 * @param {number} limitCount - Maximum number of conversations to retrieve
 * @returns {Promise<Object>} - Array of conversations
 */
export const getUserConversations = async (userId, limitCount = 20) => {
  try {
    const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
    const q = query(
      conversationsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const conversations = [];

    querySnapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, data: conversations };
  } catch (error) {
    console.error('Error getting user conversations:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get conversations for a specific transcript
 * @param {string} userId - User ID
 * @param {string} transcriptId - Transcript ID
 * @returns {Promise<Object>} - Array of conversations
 */
export const getTranscriptConversations = async (userId, transcriptId) => {
  try {
    const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
    const q = query(
      conversationsRef,
      where('userId', '==', userId),
      where('transcriptId', '==', transcriptId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const conversations = [];

    querySnapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, data: conversations };
  } catch (error) {
    console.error('Error getting transcript conversations:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update conversation title
 * @param {string} conversationId - Conversation ID
 * @param {string} title - New title
 * @returns {Promise<Object>} - Success status
 */
export const updateConversationTitle = async (conversationId, title) => {
  try {
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(conversationRef, {
      title,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating conversation title:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get conversation messages
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} - Array of messages
 */
export const getConversationMessages = async (conversationId) => {
  try {
    const result = await getConversation(conversationId);
    
    if (result.success) {
      return {
        success: true,
        data: result.data.messages || [],
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    return { success: false, error: error.message };
  }
};

// Made with Bob