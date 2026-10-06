// Groq API Service for Speech-to-Text using Whisper and Summarization
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const transcribeAudio = async (audioFile) => {
  try {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'en'); // Auto-detect if not specified
    formData.append('response_format', 'verbose_json'); // Get detailed response with timestamps
    formData.append('temperature', '0'); // More accurate transcription

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Transcription failed');
    }

    const data = await response.json();
    
    // Extract transcript and metadata
    return {
      text: data.text,
      duration: data.duration || 0,
      language: data.language || 'en',
      segments: data.segments || [],
      words: data.words || [],
    };
  } catch (error) {
    console.error('Groq transcription error:', error);
    throw error;
  }
};

// Helper function to format duration
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to count words
export const countWords = (text) => {
  return text.trim().split(/\s+/).length;
};

// Generate summary and action items using Groq's LLM
export const generateSummaryAndActions = async (transcriptText) => {
  try {
    const prompt = `Analyze this meeting transcript and provide:

1. Extract 4 key insights/highlights (each with a title and description)
2. List main topics discussed
3. Determine overall sentiment (positive/negative/neutral)
4. Extract 3-5 action items with priority levels

Transcript:
${transcriptText}

Respond in this EXACT JSON format (no markdown, just pure JSON):
{
  "keyPoints": [
    {
      "id": 1,
      "title": "Brief title",
      "description": "Detailed description",
      "icon": "TrendingUp",
      "color": "cyan"
    }
  ],
  "topics": ["Topic 1", "Topic 2"],
  "sentiment": "positive",
  "actionItems": [
    {
      "id": 1,
      "text": "Action item description",
      "priority": "high",
      "completed": false,
      "assignee": "Team Name",
      "dueDate": "2024-06-30"
    }
  ]
}

Use these icons: TrendingUp, ThumbsUp, Target, Users, Lightbulb, Sparkles
Use these colors: cyan, purple, pink
Use these priorities: high, medium, low`;

    const response = await fetch(GROQ_CHAT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Summary generation failed');
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    
    // Extract JSON from response (remove markdown code blocks if present)
    let jsonText = generatedText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const result = JSON.parse(jsonText);
    return result;
    
  } catch (error) {
    console.error('Groq summarization error:', error);
    
    // Return fallback summary if Groq fails
    return {
      keyPoints: [
        {
          id: 1,
          title: "Transcription Complete",
          description: "Audio has been successfully transcribed. Summary generation encountered an issue.",
          icon: "Sparkles",
          color: "cyan"
        }
      ],
      topics: ["General Discussion"],
      sentiment: "neutral",
      actionItems: [
        {
          id: 1,
          text: "Review the transcript for key points",
          priority: "medium",
          completed: false,
          assignee: "Team",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ]
    };
  }
};
