// RAG (Retrieval-Augmented Generation) Service for Q&A from meeting transcripts
import { generateEmbedding, splitTextIntoChunks, findRelevantChunks } from './embeddingService';
import { getTranscript, updateTranscript } from './firestoreService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Process and index a transcript for RAG
 * @param {string} userId - User ID
 * @param {string} transcriptId - Transcript ID
 * @param {string} transcriptText - Full transcript text
 * @returns {Promise<Object>} - Indexed chunks with embeddings
 */
export const indexTranscript = async (userId, transcriptId, transcriptText) => {
  try {
    console.log('Indexing transcript for RAG...');
    
    // Split transcript into chunks
    const chunks = splitTextIntoChunks(transcriptText, 1000, 200);
    console.log(`Split into ${chunks.length} chunks`);
    
    // Generate embeddings for each chunk
    const indexedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Generating embedding for chunk ${i + 1}/${chunks.length}`);
      const embedding = await generateEmbedding(chunks[i]);
      indexedChunks.push({
        id: `chunk_${i}`,
        text: chunks[i],
        embedding: embedding,
        chunkIndex: i,
      });
      
      // Add small delay to avoid rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Store indexed chunks in Firestore
    await updateTranscript(userId, transcriptId, {
      ragIndexed: true,
      ragChunks: indexedChunks.map(chunk => ({
        id: chunk.id,
        text: chunk.text,
        embedding: chunk.embedding,
        chunkIndex: chunk.chunkIndex,
      })),
      ragIndexedAt: new Date().toISOString(),
    });
    
    console.log('Transcript indexed successfully');
    return { success: true, chunks: indexedChunks };
  } catch (error) {
    console.error('Error indexing transcript:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Answer a question using RAG
 * @param {string} userId - User ID
 * @param {string} transcriptId - Transcript ID
 * @param {string} question - User's question
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<Object>} - Answer with sources
 */
export const answerQuestion = async (userId, transcriptId, question, conversationHistory = []) => {
  try {
    console.log('Answering question with RAG...');
    
    // Get transcript with indexed chunks
    const transcriptResult = await getTranscript(userId, transcriptId);
    
    if (!transcriptResult.success) {
      throw new Error('Transcript not found');
    }
    
    const transcript = transcriptResult.data;
    
    // Check if transcript is indexed
    if (!transcript.ragIndexed || !transcript.ragChunks) {
      console.log('Transcript not indexed, indexing now...');
      const indexResult = await indexTranscript(userId, transcriptId, transcript.transcript);
      
      if (!indexResult.success) {
        throw new Error('Failed to index transcript');
      }
      
      transcript.ragChunks = indexResult.chunks;
    }
    
    // Find relevant chunks
    console.log('Finding relevant chunks...');
    const relevantChunks = await findRelevantChunks(question, transcript.ragChunks, 3);
    
    // Build context from relevant chunks
    const context = relevantChunks
      .map((chunk, idx) => `[Context ${idx + 1}]:\n${chunk.text}`)
      .join('\n\n');
    
    // Build conversation history context
    const historyContext = conversationHistory
      .slice(-4) // Last 4 messages for context
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    
    // Generate answer using Gemini
    const prompt = `You are an AI assistant helping users understand their meeting transcripts. Answer the user's question based on the provided context from the meeting transcript.

${historyContext ? `Previous conversation:\n${historyContext}\n\n` : ''}Context from the meeting:
${context}

User's question: ${question}

Instructions:
- Answer based ONLY on the provided context
- Be concise and specific
- If the context doesn't contain enough information, say so
- Reference specific parts of the meeting when relevant
- Maintain conversation continuity with previous messages

Answer:`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate answer');
    }

    const data = await response.json();
    const answer = data.candidates[0].content.parts[0].text;
    
    console.log('Answer generated successfully');
    
    return {
      success: true,
      answer: answer,
      sources: relevantChunks.map(chunk => ({
        text: chunk.text.substring(0, 200) + '...',
        similarity: chunk.similarity,
        chunkIndex: chunk.chunkIndex,
      })),
      relevanceScores: relevantChunks.map(c => c.similarity),
    };
  } catch (error) {
    console.error('Error answering question:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if a transcript is indexed for RAG
 * @param {string} userId - User ID
 * @param {string} transcriptId - Transcript ID
 * @returns {Promise<boolean>} - Whether transcript is indexed
 */
export const isTranscriptIndexed = async (userId, transcriptId) => {
  try {
    const result = await getTranscript(userId, transcriptId);
    return result.success && result.data.ragIndexed === true;
  } catch (error) {
    console.error('Error checking if transcript is indexed:', error);
    return false;
  }
};

/**
 * Generate a summary of the conversation
 * @param {Array} messages - Conversation messages
 * @returns {string} - Conversation summary
 */
export const generateConversationSummary = (messages) => {
  if (messages.length === 0) return 'New Conversation';
  
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (firstUserMessage) {
    const summary = firstUserMessage.content.substring(0, 50);
    return summary.length < firstUserMessage.content.length ? summary + '...' : summary;
  }
  
  return 'Conversation';
};

// Made with Bob