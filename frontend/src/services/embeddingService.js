// Embedding Service using Gemini API for text embeddings
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const EMBEDDING_MODEL = 'text-embedding-004';
const EMBEDDING_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`;

/**
 * Generate embeddings for text using Gemini API
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
export const generateEmbedding = async (text) => {
  try {
    const response = await fetch(EMBEDDING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: {
          parts: [{
            text: text
          }]
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Embedding generation failed');
    }

    const data = await response.json();
    return data.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
};

/**
 * Generate embeddings for multiple text chunks
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
export const generateBatchEmbeddings = async (texts) => {
  try {
    const embeddings = await Promise.all(
      texts.map(text => generateEmbedding(text))
    );
    return embeddings;
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw error;
  }
};

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} - Similarity score (0-1)
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
};

/**
 * Split text into chunks for embedding
 * @param {string} text - Text to split
 * @param {number} chunkSize - Size of each chunk in characters
 * @param {number} overlap - Overlap between chunks
 * @returns {string[]} - Array of text chunks
 */
export const splitTextIntoChunks = (text, chunkSize = 1000, overlap = 200) => {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
};

/**
 * Find most relevant chunks based on query
 * @param {string} query - User query
 * @param {Array} chunks - Array of {text, embedding} objects
 * @param {number} topK - Number of top results to return
 * @returns {Promise<Array>} - Top K most relevant chunks with scores
 */
export const findRelevantChunks = async (query, chunks, topK = 3) => {
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    const similarities = chunks.map(chunk => ({
      ...chunk,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
    }));

    // Sort by similarity (highest first) and return top K
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch (error) {
    console.error('Error finding relevant chunks:', error);
    throw error;
  }
};

// Made with Bob