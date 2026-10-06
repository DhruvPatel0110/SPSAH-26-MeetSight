// Gemini API Service for Summarization and Action Items Extraction
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Cache to prevent redundant API calls
const summaryCache = new Map();

export const generateSummaryAndActions = async (transcriptText) => {
  // Check cache first to save Gemini credits
  const cacheKey = transcriptText.substring(0, 100); // Use first 100 chars as key
  if (summaryCache.has(cacheKey)) {
    console.log('Using cached summary to save Gemini credits');
    return summaryCache.get(cacheKey);
  }

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
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API failed');
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response (remove markdown code blocks if present)
    let jsonText = generatedText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const result = JSON.parse(jsonText);
    
    // Cache the result to save credits
    summaryCache.set(cacheKey, result);
    
    // Clear old cache entries if too many (keep last 10)
    if (summaryCache.size > 10) {
      const firstKey = summaryCache.keys().next().value;
      summaryCache.delete(firstKey);
    }
    
    return result;
  } catch (error) {
    console.error('Gemini summarization error:', error);
    
    // Return fallback summary if Gemini fails
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

// Clear cache manually if needed
export const clearSummaryCache = () => {
  summaryCache.clear();
  console.log('Summary cache cleared');
};
