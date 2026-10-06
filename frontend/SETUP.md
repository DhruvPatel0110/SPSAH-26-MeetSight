# 🚀 Complete Setup Guide - MeetIQ

This comprehensive guide will walk you through setting up MeetIQ from scratch. Follow each step carefully to ensure a smooth setup process.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Installation Steps](#installation-steps)
4. [API Configuration](#api-configuration)
5. [Firebase Setup](#firebase-setup)
6. [Environment Variables](#environment-variables)
7. [Running the Application](#running-the-application)
8. [Verification](#verification)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

#### **Node.js (v18.0.0 or higher)**
- **Download**: [nodejs.org](https://nodejs.org/)
- **Verify Installation**:
  ```bash
  node --version
  # Should output: v18.x.x or higher
  ```

#### **npm (comes with Node.js)**
- **Verify Installation**:
  ```bash
  npm --version
  # Should output: 9.x.x or higher
  ```

#### **Git (for cloning repository)**
- **Download**: [git-scm.com](https://git-scm.com/)
- **Verify Installation**:
  ```bash
  git --version
  # Should output: git version 2.x.x
  ```

#### **Modern Web Browser**
- Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

### Required Accounts (All FREE)

1. **Groq Account** - For audio transcription
   - Sign up at: [console.groq.com](https://console.groq.com)
   - No credit card required

2. **Google Account** - For Gemini AI and Firebase
   - Sign up at: [google.com](https://google.com)
   - No credit card required

3. **Firebase Project** - For authentication and database
   - Create at: [console.firebase.google.com](https://console.firebase.google.com)
   - Free tier is sufficient

---

## System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: 4GB (8GB recommended)
- **Storage**: 500MB free space
- **Internet**: Stable connection for API calls

### Recommended Setup
- **OS**: Windows 11 or macOS 12+
- **RAM**: 8GB or more
- **Storage**: 1GB free space
- **Internet**: Broadband connection (5+ Mbps)

---

## Installation Steps

### Step 1: Clone the Repository

Open your terminal/command prompt and run:

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd IBM-BOB-Hackathon-Semicolon
```

**Alternative**: Download ZIP file from GitHub and extract it.

### Step 2: Install Dependencies

Install all required npm packages:

```bash
npm install
```

**Expected Output**:
```
added 250 packages, and audited 251 packages in 30s
```

**If you encounter errors**, try:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Step 3: Verify Installation

Check that all dependencies are installed:

```bash
npm list --depth=0
```

You should see all packages listed in `package.json`.

---

## API Configuration

### 1. Groq API Setup (Audio Transcription)

#### Get Your API Key:

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up with your email (no card required)
3. Click **"API Keys"** in the left sidebar
4. Click **"Create API Key"**
5. Give it a name (e.g., "AI Dashboard")
6. Copy the key (starts with `gsk_...`)
7. **Save it securely** - you won't see it again!

#### Key Features:
- ✅ **FREE**: 14,400 requests per day
- ✅ **Fast**: 10x faster than alternatives
- ✅ **No Card**: No credit card required
- ✅ **Generous**: Perfect for development and demos

### 2. Google Gemini API Setup (AI Summarization)

#### Get Your API Key:

1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select **"Create API key in new project"**
5. Copy the key (starts with `AIza...`)
6. **Save it securely**

#### Key Features:
- ✅ **FREE**: 1,500 requests per day
- ✅ **Powerful**: Gemini 1.5 Flash model
- ✅ **Long Context**: 1M token context window
- ✅ **No Card**: No credit card required

---

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name: `AI-Transcription-Dashboard`
4. **Disable** Google Analytics (optional for this project)
5. Click **"Create project"**
6. Wait for project creation (30-60 seconds)

### Step 2: Register Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`)
2. Register app with nickname: `AI Dashboard Web`
3. **Don't check** "Firebase Hosting" (we use Vite)
4. Click **"Register app"**
5. **Copy the configuration object** - you'll need this!

Example configuration:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### Step 3: Enable Authentication

1. In Firebase Console, go to **"Authentication"**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab

#### Enable Email/Password:
1. Click on **"Email/Password"**
2. Toggle **"Enable"**
3. Click **"Save"**

#### Enable Google Sign-In:
1. Click on **"Google"**
2. Toggle **"Enable"**
3. Select a **support email** from dropdown
4. Click **"Save"**

### Step 4: Set Up Firestore Database

1. In Firebase Console, go to **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select a **location** (choose closest to your users)
5. Click **"Enable"**

### Step 5: Configure Firestore Security Rules

1. Go to **"Firestore Database"** → **"Rules"** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Transcripts subcollection
      match /transcripts/{transcriptId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Conversations collection
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

---

## Environment Variables

### Step 1: Create Environment File

In the project root directory, create a file named `.env.local`:

**Windows (Command Prompt)**:
```bash
copy .env.example .env.local
```

**Windows (PowerShell)**:
```bash
Copy-Item .env.example .env.local
```

**Mac/Linux**:
```bash
cp .env.example .env.local
```

### Step 2: Fill in Your API Keys

Open `.env.local` in a text editor and fill in your keys:

```env
# Groq API Key (for audio transcription)
VITE_GROQ_API_KEY=gsk_your_actual_groq_key_here

# Gemini API Key (for AI summarization)
VITE_GEMINI_API_KEY=AIza_your_actual_gemini_key_here

# Firebase Configuration (from Step 2 of Firebase Setup)
VITE_FIREBASE_API_KEY=AIzaSy_your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### Step 3: Verify Environment Variables

**Important Notes**:
- ✅ All variables must start with `VITE_` prefix
- ✅ No spaces around the `=` sign
- ✅ No quotes around values
- ✅ Save the file after editing
- ✅ Never commit `.env.local` to Git (already in .gitignore)

---

## Running the Application

### Step 1: Start Development Server

In your terminal, run:

```bash
npm run dev
```

**Expected Output**:
```
  VITE v5.2.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 2: Open in Browser

1. Open your web browser
2. Navigate to: `http://localhost:5173`
3. You should see the login page

### Step 3: Sign In

**Option 1: Google Sign-In**
1. Click **"Continue with Google"**
2. Select your Google account
3. Grant permissions
4. You'll be redirected to the dashboard

**Option 2: Email/Password Sign-Up**
1. Click **"Don't have an account? Sign Up"**
2. Enter your name, email, and password (min 6 characters)
3. Click **"Sign Up"**
4. You'll be automatically signed in

---

## Verification

### Test Each Feature

#### ✅ 1. Authentication
- [ ] Can sign in with Google
- [ ] Can sign up with email/password
- [ ] Can sign out
- [ ] Session persists after page refresh

#### ✅ 2. Audio Upload
- [ ] Can drag and drop audio file
- [ ] Can click to browse and select file
- [ ] File validation works (correct formats only)
- [ ] Upload progress shows

#### ✅ 3. Transcription
- [ ] Audio transcribes successfully
- [ ] Transcript appears in center panel
- [ ] Word count and duration display
- [ ] Can search within transcript

#### ✅ 4. AI Summary
- [ ] Summary cards appear on right panel
- [ ] Key insights are relevant
- [ ] Topics are extracted
- [ ] Sentiment analysis shows

#### ✅ 5. Action Items
- [ ] Action items appear in left panel
- [ ] Can check/uncheck items
- [ ] Priority indicators show
- [ ] Progress bar updates

#### ✅ 6. RAG Q&A
- [ ] Can toggle to Q&A view
- [ ] Can ask questions about transcript
- [ ] Answers are relevant and cite sources
- [ ] Conversation history saves

#### ✅ 7. Export
- [ ] Can export to TXT format
- [ ] Can export to JSON format
- [ ] Can export to Markdown format
- [ ] Files download correctly

#### ✅ 8. History
- [ ] Can view transcript history
- [ ] Can load previous transcripts
- [ ] Can delete transcripts
- [ ] Conversation history accessible

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: `npm install` fails

**Solution 1**: Clear cache and retry
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Solution 2**: Check Node.js version
```bash
node --version
# Must be 18.0.0 or higher
```

**Solution 3**: Use legacy peer deps
```bash
npm install --legacy-peer-deps
```

#### Issue: Port 5173 already in use

**Solution**: Vite will automatically use next available port, or specify a different port:
```bash
npm run dev -- --port 3000
```

#### Issue: "API key not found" error

**Solutions**:
1. Check `.env.local` file exists in root directory
2. Verify all keys start with `VITE_` prefix
3. Ensure no extra spaces or quotes
4. **Restart dev server** after adding keys:
   - Press `Ctrl+C` to stop
   - Run `npm run dev` again

#### Issue: Firebase authentication fails

**Solutions**:
1. Verify Firebase config in `.env.local`
2. Check Firebase Console for enabled auth methods
3. Ensure correct domain in Firebase settings
4. Clear browser cache and cookies

#### Issue: Transcription fails

**Solutions**:
1. Verify Groq API key is correct
2. Check audio file format (MP3, WAV, M4A, OGG)
3. Ensure file size is under 25MB
4. Check internet connection
5. View browser console for detailed errors

#### Issue: Gemini summarization fails

**Solutions**:
1. Verify Gemini API key is correct
2. Check API quota at [makersuite.google.com](https://makersuite.google.com)
3. Wait a few minutes if rate limited
4. Check browser console for errors

#### Issue: Firestore permission denied

**Solutions**:
1. Verify security rules are published
2. Ensure user is authenticated
3. Check userId matches in Firestore
4. Review Firebase Console logs

#### Issue: Build fails

**Solution**: Check for syntax errors
```bash
npm run build
# Review error messages
```

#### Issue: Blank page after deployment

**Solutions**:
1. Check browser console for errors
2. Verify all environment variables are set
3. Ensure base URL is correct in `vite.config.js`
4. Clear browser cache

---

## Additional Configuration

### Custom Port

Edit `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 3000, // Change to your preferred port
  },
});
```

### Custom Domain

For Firebase Hosting:
1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow DNS configuration steps

### Environment-Specific Configs

Create multiple environment files:
- `.env.local` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production environment

---

## Production Build

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy
```

---

## Performance Tips

### Development
- Use Chrome DevTools for debugging
- Enable React DevTools extension
- Monitor Network tab for API calls
- Check Console for errors

### Production
- Enable gzip compression
- Use CDN for static assets
- Implement service worker for offline support
- Monitor Firebase usage and quotas

---

## Security Best Practices

### API Keys
- ✅ Never commit `.env.local` to Git
- ✅ Use environment variables for all secrets
- ✅ Rotate keys periodically
- ✅ Monitor API usage for anomalies

### Firebase
- ✅ Use security rules to protect data
- ✅ Enable App Check for production
- ✅ Monitor authentication logs
- ✅ Set up billing alerts

### User Data
- ✅ Encrypt sensitive data
- ✅ Implement data retention policies
- ✅ Provide data export functionality
- ✅ Allow users to delete their data

---

## Next Steps

After successful setup:

1. **Explore Features**: Try all functionality with sample audio
2. **Read Documentation**: Review other .md files for details
3. **Customize**: Modify colors, layout, or features
4. **Deploy**: Deploy to Firebase Hosting or Vercel
5. **Share**: Share with team or submit for hackathon

---

## Support Resources

### Documentation
- [README.md](./README.md) - Project overview
- [HOW_TO_RUN.md](./HOW_TO_RUN.md) - Beginner's guide
- [API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md) - Detailed API setup
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase configuration
- [RAG_IMPLEMENTATION.md](./RAG_IMPLEMENTATION.md) - RAG system details
- [Tech_Stack.md](./Tech_Stack.md) - Technology overview

### External Resources
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide)
- [Firebase Docs](https://firebase.google.com/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [Gemini API Docs](https://ai.google.dev/docs)

### Community
- GitHub Issues for bug reports
- Stack Overflow for technical questions
- Firebase Community for Firebase-specific issues

---

## Congratulations! 🎉

You've successfully set up MeetIQ!

**What's Next?**
- Upload your first audio file
- Explore the AI-powered features
- Ask questions using the RAG Q&A
- Export your transcripts
- Customize the dashboard to your needs

**Built with ❤️ by Team Semicolon using IBM Bob IDE**

**Made for IBM BOB Hackathon 2024**