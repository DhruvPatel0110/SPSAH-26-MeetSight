# RAG Implementation Guide

## Overview

This document describes the implementation of a **Retrieval-Augmented Generation (RAG)** pipeline for MeetIQ. The system allows users to ask questions about their meeting transcripts without re-uploading files, with full conversation history storage.

## Architecture

### Components

1. **Embedding Service** (`src/services/embeddingService.js`)
   - Uses Google Gemini's `text-embedding-004` model
   - Generates vector embeddings for text chunks
   - Implements cosine similarity for semantic search
   - Handles text chunking with overlap

2. **Conversation Service** (`src/services/conversationService.js`)
   - Stores conversation sessions in Firestore
   - Links conversations to specific transcripts
   - Maintains message history
   - Supports multiple conversations per transcript

3. **RAG Service** (`src/services/ragService.js`)
   - Indexes transcripts by creating embeddings
   - Retrieves relevant context using semantic search
   - Generates answers using Gemini with context
   - Maintains conversation continuity

4. **Chat Interface** (`src/components/Chatbot/ChatInterface.jsx`)
   - Real-time Q&A interface
   - Shows source citations
   - Handles indexing status
   - Displays conversation history

5. **Conversation History** (`src/components/Chatbot/ConversationHistory.jsx`)
   - Lists all conversations
   - Filters by transcript
   - Shows timestamps and message counts

## How It Works

### 1. Transcript Indexing

When a user uploads a meeting:

```javascript
// Split transcript into chunks (1000 chars with 200 char overlap)
const chunks = splitTextIntoChunks(transcriptText, 1000, 200);

// Generate embeddings for each chunk
for (const chunk of chunks) {
  const embedding = await generateEmbedding(chunk);
  indexedChunks.push({ text: chunk, embedding });
}

// Store in Firestore
await updateTranscript(userId, transcriptId, {
  ragIndexed: true,
  ragChunks: indexedChunks
});
```

### 2. Question Answering

When a user asks a question:

```javascript
// 1. Generate embedding for the question
const queryEmbedding = await generateEmbedding(question);

// 2. Find most relevant chunks using cosine similarity
const relevantChunks = findRelevantChunks(queryEmbedding, indexedChunks, topK=3);

// 3. Build context from relevant chunks
const context = relevantChunks.map(chunk => chunk.text).join('\n\n');

// 4. Generate answer using Gemini with context
const answer = await generateAnswer(question, context, conversationHistory);
```

### 3. Conversation Storage

```javascript
// Create conversation session
const conversation = await createConversation(userId, transcriptId, title);

// Add messages
await addMessage(conversationId, {
  role: 'user',
  content: question
});

await addMessage(conversationId, {
  role: 'assistant',
  content: answer,
  sources: relevantChunks
});
```

## Key Features

### ✅ Persistent Conversation History
- All conversations stored in Firestore
- Linked to specific transcripts
- Accessible across sessions
- No need to re-upload files

### ✅ Semantic Search
- Vector embeddings for intelligent retrieval
- Cosine similarity matching
- Top-K relevant chunks
- Context-aware answers

### ✅ Source Citations
- Shows which parts of the meeting were used
- Similarity scores for transparency
- Chunk references for verification

### ✅ Conversation Continuity
- Maintains context across messages
- References previous questions/answers
- Natural conversation flow

## Data Structure

### Firestore Schema

```javascript
// Transcripts Collection
transcripts/{transcriptId}
{
  transcript: "full text...",
  ragIndexed: true,
  ragChunks: [
    {
      id: "chunk_0",
      text: "chunk text...",
      embedding: [0.123, 0.456, ...],
      chunkIndex: 0
    }
  ],
  ragIndexedAt: "2024-01-01T00:00:00Z"
}

// Conversations Collection
conversations/{conversationId}
{
  userId: "user123",
  transcriptId: "transcript456",
  title: "Meeting Q&A",
  messages: [
    {
      id: "msg_123",
      role: "user",
      content: "What was discussed?",
      timestamp: "2024-01-01T00:00:00Z"
    },
    {
      id: "msg_124",
      role: "assistant",
      content: "The meeting discussed...",
      sources: [...],
      timestamp: "2024-01-01T00:00:01Z"
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## API Usage

### Gemini Embedding API

```javascript
POST https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent

{
  "content": {
    "parts": [{ "text": "text to embed" }]
  }
}

Response:
{
  "embedding": {
    "values": [0.123, 0.456, ...]  // 768-dimensional vector
  }
}
```

### Gemini Generation API

```javascript
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent

{
  "contents": [{
    "parts": [{ "text": "prompt with context" }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 1024
  }
}
```

## Performance Considerations

### Chunking Strategy
- **Chunk Size**: 1000 characters
- **Overlap**: 200 characters
- **Rationale**: Balances context preservation with embedding quality

### Embedding Generation
- **Rate Limiting**: 100ms delay between chunks
- **Batch Processing**: Sequential to avoid API limits
- **Caching**: Embeddings stored in Firestore

### Retrieval
- **Top-K**: 3 most relevant chunks
- **Similarity Threshold**: None (uses top-K)
- **Context Window**: ~3000 characters total

## Cost Optimization

### Gemini API Credits
1. **Embeddings**: Free tier includes generous limits
2. **Generation**: Cached prompts reduce costs
3. **Storage**: Firestore free tier sufficient for moderate use

### Best Practices
- Index transcripts once, query many times
- Store embeddings to avoid regeneration
- Use conversation history efficiently
- Implement client-side caching

## User Experience

### Workflow

1. **Upload Meeting** → Automatic indexing in background
2. **Ask Questions** → Instant answers with sources
3. **Continue Conversation** → Context maintained
4. **Switch Meetings** → Load previous conversations
5. **Multiple Sessions** → All history preserved

### UI Features

- **Toggle View**: Switch between Summary and Q&A
- **Loading States**: Clear feedback during indexing
- **Error Handling**: Graceful fallbacks
- **Source Display**: Transparent citations
- **Conversation List**: Easy navigation

## Future Enhancements

### Potential Improvements

1. **Advanced Retrieval**
   - Hybrid search (keyword + semantic)
   - Re-ranking algorithms
   - Query expansion

2. **Better Chunking**
   - Sentence-aware splitting
   - Topic-based segmentation
   - Hierarchical chunking

3. **Enhanced Context**
   - Multi-document retrieval
   - Cross-meeting insights
   - Temporal awareness

4. **User Features**
   - Conversation sharing
   - Export Q&A sessions
   - Suggested questions
   - Meeting summaries from Q&A

## Troubleshooting

### Common Issues

**Indexing Fails**
- Check Gemini API key
- Verify transcript text exists
- Check Firestore permissions

**Poor Answer Quality**
- Increase chunk overlap
- Adjust top-K value
- Improve prompt engineering

**Slow Performance**
- Reduce chunk count
- Implement caching
- Use batch processing

## Environment Variables

Required in `.env`:

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_key
# ... other Firebase config
```

## Dependencies

No external RAG libraries needed! Uses:
- Google Gemini API (embeddings + generation)
- Firebase Firestore (storage)
- Native JavaScript (vector operations)

## Testing

### Manual Testing Steps

1. Upload a meeting transcript
2. Wait for indexing to complete
3. Ask a specific question
4. Verify answer relevance
5. Check source citations
6. Ask follow-up question
7. Verify conversation continuity
8. Reload page and check history

### Test Questions

- "What were the main topics discussed?"
- "Who was assigned to work on X?"
- "What decisions were made?"
- "Can you summarize the action items?"

## Conclusion

This RAG implementation provides:
- ✅ No re-upload needed
- ✅ Persistent conversation history
- ✅ Semantic search capabilities
- ✅ Source transparency
- ✅ Cost-effective solution
- ✅ Scalable architecture

Built with IBM Bob IDE for the IBM-BOB Hackathon! 🚀

---

**Made with Bob**