# 🔥 Firebase Setup Guide for Task 4 - Authentication & User Sessions

## Overview

Task 4 implements Firebase Authentication with Google and Email/Password login, along with Firestore for storing user data and transcript history.

---

## 📋 Prerequisites

- Google account
- Firebase project (free tier is sufficient)
- Node.js and npm installed

---

## 🚀 Step-by-Step Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name (e.g., "AI-Transcription-Dashboard")
4. Disable Google Analytics (optional for this project)
5. Click **"Create project"**

### Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`)
2. Register app with a nickname (e.g., "AI Dashboard Web")
3. **Don't** check "Firebase Hosting" (we're using Vite)
4. Click **"Register app"**
5. Copy the Firebase configuration object (you'll need this later)

### Step 3: Enable Authentication Methods

1. In Firebase Console, go to **"Authentication"** → **"Sign-in method"**
2. Enable **"Email/Password"**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"
3. Enable **"Google"**:
   - Click on "Google"
   - Toggle "Enable"
   - Select a support email
   - Click "Save"

### Step 4: Set Up Firestore Database

1. In Firebase Console, go to **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll add rules next)
4. Select a location (choose closest to your users)
5. Click **"Enable"**

### Step 5: Configure Firestore Security Rules

1. Go to **"Firestore Database"** → **"Rules"**
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Transcripts subcollection - users can only access their own transcripts
      match /transcripts/{transcriptId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

3. Click **"Publish"**

---

## 🔑 Configure Your Application

### Step 1: Create `.env.local` File

In your project root, create a `.env.local` file:

```env
# Groq API Key (for audio transcription)
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here

# Gemini API Key (for AI summarization)
VITE_GEMINI_API_KEY=AIza_your_gemini_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 2: Get Your Firebase Config Values

From the Firebase configuration object you copied earlier:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // → VITE_FIREBASE_API_KEY
  authDomain: "project.firebaseapp.com",  // → VITE_FIREBASE_AUTH_DOMAIN
  projectId: "project-id",        // → VITE_FIREBASE_PROJECT_ID
  storageBucket: "project.appspot.com",   // → VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456",    // → VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc"          // → VITE_FIREBASE_APP_ID
};
```

### Step 3: Restart Development Server

After adding environment variables:

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

---

## ✅ Features Implemented

### 1. **Authentication**
- ✅ Google Sign-In (OAuth)
- ✅ Email/Password Sign-Up
- ✅ Email/Password Sign-In
- ✅ Sign Out
- ✅ Session persistence (automatic)

### 2. **User Management**
- ✅ User profile creation
- ✅ Display name and photo
- ✅ Transcript count tracking
- ✅ User preferences storage

### 3. **Transcript History**
- ✅ Save transcripts to Firestore
- ✅ View transcript history
- ✅ Load previous transcripts
- ✅ Delete transcripts
- ✅ Automatic user association

### 4. **UI Components**
- ✅ Login/Signup modal
- ✅ User menu with avatar
- ✅ Transcript history modal
- ✅ Sign-in button for guests

---

## 🎯 How It Works

### Authentication Flow

```
User clicks "Sign In"
    ↓
Login Modal opens
    ↓
User chooses:
├─ Google Sign-In → OAuth popup → Auto sign-in
└─ Email/Password → Enter credentials → Sign in/up
    ↓
Firebase authenticates
    ↓
User profile created/loaded from Firestore
    ↓
User menu appears in header
    ↓
User can access transcript history
```

### Data Storage Flow

```
User uploads audio
    ↓
Transcription + AI Summary generated
    ↓
If user is authenticated:
    ↓
Save to Firestore:
├─ /users/{userId}/transcripts/{transcriptId}
│   ├─ filename
│   ├─ text
│   ├─ duration
│   ├─ wordCount
│   ├─ summary
│   └─ actionItems
└─ Update user's transcript count
```

---

## 📁 File Structure

```
src/
├── config/
│   └── firebase.js              # Firebase initialization
├── services/
│   ├── authService.js           # Authentication functions
│   └── firestoreService.js      # Database operations
├── contexts/
│   └── AuthContext.jsx          # Global auth state
├── components/
│   ├── Auth/
│   │   ├── LoginModal.jsx       # Login/Signup UI
│   │   └── UserMenu.jsx         # User dropdown menu
│   ├── History/
│   │   └── TranscriptHistory.jsx # History viewer
│   └── Dashboard/
│       ├── DashboardHeader.jsx  # Updated with auth
│       └── DashboardLayout.jsx  # Updated with storage
└── main.jsx                     # AuthProvider wrapper
```

---

## 🧪 Testing the Implementation

### Test Google Sign-In

1. Click "Sign In" button in header
2. Click "Continue with Google"
3. Select your Google account
4. Should see your profile in header

### Test Email Sign-Up

1. Click "Sign In" button
2. Click "Don't have an account? Sign Up"
3. Enter name, email, and password (min 6 chars)
4. Click "Sign Up"
5. Should be signed in automatically

### Test Email Sign-In

1. Sign out from user menu
2. Click "Sign In" button
3. Enter your email and password
4. Click "Sign In"
5. Should see your profile

### Test Transcript History

1. Upload and transcribe an audio file
2. Click on your profile avatar
3. Click "Transcript History"
4. Should see your saved transcript
5. Click "View" to load it
6. Click "Delete" to remove it

### Test Session Persistence

1. Sign in
2. Refresh the page
3. Should still be signed in (Firebase handles this automatically)

---

## 🔒 Security Features

### Firestore Rules
- Users can only access their own data
- Transcripts are private to each user
- No public read/write access

### Authentication
- Passwords hashed by Firebase
- OAuth tokens managed securely
- Session tokens stored in browser (httpOnly cookies)

### Best Practices
- API keys in environment variables
- No sensitive data in client code
- User data isolated by UID

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Check that all Firebase env variables are set
- Restart dev server after adding variables

### "Missing or insufficient permissions"
- Check Firestore security rules
- Ensure user is authenticated
- Verify userId matches auth.uid

### "Firebase: Error (auth/popup-blocked)"
- Browser blocked the Google sign-in popup
- Allow popups for localhost
- Try email/password instead

### "Firebase: Error (auth/email-already-in-use)"
- Email is already registered
- Use "Sign In" instead of "Sign Up"
- Or use password reset (not implemented yet)

---

## 📊 Firestore Data Structure

```
users/
  {userId}/
    - email: string
    - displayName: string
    - photoURL: string
    - createdAt: timestamp
    - transcriptCount: number
    - preferences: object
    
    transcripts/
      {transcriptId}/
        - filename: string
        - text: string
        - duration: string
        - wordCount: number
        - language: string
        - status: string
        - uploadDate: string
        - createdAt: timestamp
        - updatedAt: timestamp
        - summary: object
          - keyPoints: array
          - topics: array
          - sentiment: string
        - actionItems: array
```

---

## 🚀 Next Steps (Optional Enhancements)

- [ ] Password reset functionality
- [ ] Email verification
- [ ] Profile editing
- [ ] Export transcript history
- [ ] Share transcripts with other users
- [ ] Real-time collaboration
- [ ] Mobile app with same Firebase backend

---

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Console](https://console.firebase.google.com/)

---

