# 🚀 API Integration Guide - Groq + Gemini

## ✅ What's Been Implemented

Your dashboard now uses **REAL AI** with:
- **Groq Whisper** for speech-to-text transcription
- **Gemini 1.5 Flash** for summarization and action items

## 🔑 Getting Your API Keys

### 1. Groq API Key (FREE - No Card Required)

1. Go to: https://console.groq.com
2. Sign up with email (no card needed!)
3. Click "API Keys" in the left sidebar
4. Click "Create API Key"
5. Copy your key (starts with `gsk_...`)

### 2. Gemini API Key (FREE - No Card Required)

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Select "Create API key in new project"
5. Copy your key (starts with `AIza...`)

## 📝 Setting Up Your Keys

Your `.env.local` file should look like this:

```env
VITE_GROQ_API_KEY=gsk_your_groq_key_here
VITE_GEMINI_API_KEY=AIzaSy_your_gemini_key_here
```

**Important:** 
- Keys must start with `VITE_` for Vite to recognize them
- Never commit `.env.local` to Git (already in .gitignore)
- Restart your dev server after adding keys: `npm run dev`

## 🎯 How It Works

### Step 1: Upload Audio
User uploads an audio file (MP3, WAV, M4A, OGG)

### Step 2: Groq Transcription (FAST! 🚀)
- File sent to Groq Whisper API
- Returns transcript text in seconds
- No limits on free tier - abuse it! 😈

### Step 3: Gemini Summarization (Smart! 🧠)
- Transcript sent to Gemini
- Returns:
  - 4 key insights
  - Main topics
  - Sentiment analysis
  - 3-5 action items with priorities
- **Cached to save credits!** Same transcript = no new API call

### Step 4: Display Results
Everything appears in your beautiful dashboard!

## 💡 Smart Features Implemented

### 1. **Gemini Credit Saving** 💰
- Results are cached in memory
- Same transcript = reuses cached summary
- Saves your Gemini credits!

### 2. **Groq Abuse Mode** 😈
- No caching for Groq (unlimited free tier)
- Every upload = fresh transcription
- Super fast processing

### 3. **Error Handling**
- Clear error messages
- Fallback summaries if Gemini fails
- Helpful debugging in console

### 4. **Loading States**
- Shows skeleton screens while processing
- Real-time console logs
- Progress indicators

## 🧪 Testing Your Integration

### Test with a Short Audio File:

1. Find a short audio file (30 seconds - 2 minutes)
2. Upload it to the dashboard
3. Watch the console for logs:
   ```
   🎤 Starting transcription with Groq Whisper...
   ✅ Transcription complete!
   🤖 Generating summary with Gemini...
   ✅ Summary and action items generated!
   ```
4. See results appear in dashboard!

### What You Should See:

- **Left Panel:** Your uploaded file info
- **Center Panel:** Full transcript text
- **Right Panel:** AI-generated summary cards
- **Left Bottom:** Extracted action items

## 📊 API Usage Limits

### Groq (FREE Forever)
- **14,400 requests per day**
- **No credit card required**
- **Super fast processing**
- ✅ Perfect for unlimited testing!

### Gemini (FREE Tier)
- **60 requests per minute**
- **1,500 requests per day**
- **No credit card required**
- ⚠️ Use wisely (we cache to help!)

## 🐛 Troubleshooting

### "API key not found" Error
- Check `.env.local` file exists in root directory
- Keys must start with `VITE_`
- Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### "Failed to fetch" Error
- Check internet connection
- Verify API keys are correct
- Check browser console for detailed errors

### "Invalid audio file" Error
- Groq supports: MP3, WAV, M4A, OGG, FLAC
- Max file size: 25MB
- Try a different audio file

### Gemini Returns Weird Format
- The code handles JSON extraction automatically
- If issues persist, check console logs
- Fallback summary will be used

## 🎨 Customizing AI Behavior

### Make Summaries More Detailed:
Edit `src/services/geminiService.js` line 15-50 to change the prompt

### Change Transcription Language:
Edit `src/services/groqService.js` line 10:
```javascript
formData.append('language', 'es'); // Spanish
formData.append('language', 'fr'); // French
// Or remove for auto-detect
```

### Adjust Summary Length:
In `geminiService.js`, change:
```javascript
maxOutputTokens: 2048, // Increase for longer summaries
```

## 🚀 Performance Tips

1. **Audio File Size:** Smaller files = faster processing
2. **Audio Quality:** Better quality = better transcription
3. **Internet Speed:** Faster connection = quicker results
4. **Caching:** Upload same file twice = instant second result!

## 🔒 Security Notes

⚠️ **Important:** Your API keys are visible in the browser!

**For Production:**
1. Create a backend API (Node.js/Express)
2. Store keys on server
3. Frontend calls your backend
4. Backend calls Groq/Gemini

**For Hackathon/Demo:** Current setup is fine! ✅

## 📈 Monitoring Usage

### Check Groq Usage:
- Go to: https://console.groq.com
- View "Usage" tab
- See requests and tokens used

### Check Gemini Usage:
- Go to: https://makersuite.google.com
- View quota information
- Monitor daily limits

## 🎉 You're All Set!

Your dashboard now has:
- ✅ Real AI transcription (Groq Whisper)
- ✅ Smart summarization (Gemini)
- ✅ Credit-saving caching
- ✅ Beautiful UI
- ✅ Export functionality
- ✅ Responsive design

**Upload an audio file and watch the magic happen!** 🪄

---

Need help? Check the console logs for detailed debugging info!