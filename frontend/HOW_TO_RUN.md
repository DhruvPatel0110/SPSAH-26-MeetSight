# 🎯 How to Run - MeetIQ
## Simple Step-by-Step Guide for Everyone

This guide is designed for **anyone** - whether you're a developer or someone with no technical background. Just follow these simple steps!

---

## 🎬 Quick Start (For Experienced Users)

If you're familiar with development:

```bash
# 1. Navigate to project
cd IBM-BOB-Hackathon-Semicolon

# 2. Install dependencies (first time only)
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Start the application
npm run dev

# 5. Open browser
# Navigate to http://localhost:5173
```

**That's it!** Skip to [Using the Dashboard](#using-the-dashboard) section.

---

## 📚 Detailed Guide (For Beginners)

### What You'll Need

Before starting, make sure you have:
- ✅ A computer (Windows, Mac, or Linux)
- ✅ Internet connection
- ✅ 15-20 minutes of time
- ✅ Node.js installed (see [SETUP.md](./SETUP.md) if not)

---

## 🚀 Step-by-Step Instructions

### STEP 1: Open Your Terminal/Command Prompt

**What is a Terminal?**
A terminal is a text-based interface where you type commands to control your computer.

#### On Windows:
1. Press `Windows Key` + `R` on your keyboard
2. Type `cmd` and press Enter
3. A black window opens - this is your Command Prompt ✅

**Alternative**: Press `Windows Key`, type "Command Prompt", and click it

#### On Mac:
1. Press `Command` + `Space` on your keyboard
2. Type `terminal` and press Enter
3. A window opens - this is your Terminal ✅

**Alternative**: Go to Applications → Utilities → Terminal

#### On Linux:
1. Press `Ctrl` + `Alt` + `T` on your keyboard
2. A window opens - this is your Terminal ✅

---

### STEP 2: Navigate to the Project Folder

**What does "navigate" mean?**
It means telling your computer which folder to work in.

#### Find Your Project Path:
1. Open File Explorer (Windows) or Finder (Mac)
2. Navigate to where you downloaded/cloned the project
3. Right-click on the folder
4. Select "Copy as path" (Windows) or "Get Info" (Mac)

#### In the Terminal, type:

**Windows Example**:
```bash
cd "C:\Users\YourName\Downloads\IBM-BOB-Hackathon-Semicolon"
```

**Mac/Linux Example**:
```bash
cd /Users/YourName/Downloads/IBM-BOB-Hackathon-Semicolon
```

**Replace the path with your actual folder location!**

Press `Enter` after typing the command.

**How to know it worked?**
The terminal will show your folder name in the prompt.

---

### STEP 3: Install Required Files (First Time Only)

**What are we installing?**
The application needs some helper files (called "dependencies") to work.

#### Type this command:
```bash
npm install
```

Press `Enter` and wait.

**What you'll see**:
- Text scrolling on the screen
- Progress bars
- "added XXX packages" message at the end

**How long does it take?**
Usually 1-3 minutes depending on your internet speed.

**⚠️ Only do this ONCE** - the first time you set up the project.

---

### STEP 4: Set Up Your API Keys

**What are API keys?**
Think of them as passwords that let the app use AI services.

#### Create the Configuration File:

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

#### Edit the File:

1. Open the project folder in File Explorer/Finder
2. Find the file named `.env.local`
3. Right-click and open with Notepad (Windows) or TextEdit (Mac)
4. You'll see something like this:

```env
VITE_GROQ_API_KEY=gsk_your_groq_key_here
VITE_GEMINI_API_KEY=AIza_your_gemini_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
# ... more lines
```

5. Replace the placeholder text with your actual API keys
6. Save the file

**Where to get API keys?**
See [API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md) for detailed instructions.

**⚠️ Important**: Don't share these keys with anyone!

---

### STEP 5: Start the Application

Now we're ready to run the dashboard!

#### Type this command:
```bash
npm run dev
```

Press `Enter`.

**What you'll see**:
```
  VITE v5.2.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**✅ Success!** The application is now running!

**⚠️ Don't close this terminal window** - keep it open while using the app.

---

### STEP 6: Open the Dashboard in Your Browser

1. Open your web browser (Chrome, Firefox, Safari, or Edge)
2. In the address bar at the top, type:
   ```
   http://localhost:5173
   ```
3. Press `Enter`

**🎉 MeetIQ will appear!**

---

## 🖥️ Using the Dashboard

### First Time: Sign In

When you first open the dashboard, you'll see a login page.

#### Option 1: Sign in with Google
1. Click the **"Continue with Google"** button
2. Choose your Google account
3. Click "Allow" to grant permissions
4. You'll be taken to the dashboard ✅

#### Option 2: Create an Account with Email
1. Click **"Don't have an account? Sign Up"**
2. Enter your name
3. Enter your email address
4. Create a password (at least 6 characters)
5. Click **"Sign Up"**
6. You'll be automatically signed in ✅

---

### Understanding the Dashboard Layout

Once signed in, you'll see three main sections:

```
┌─────────────────────────────────────────────────────────┐
│  Header: Your Name | Export Button | Sign Out           │
├──────────────┬──────────────────────┬───────────────────┤
│              │                      │                   │
│  LEFT PANEL  │   CENTER PANEL       │   RIGHT PANEL     │
│              │                      │                   │
│  • Upload    │   • Transcript       │   • AI Summary    │
│  • Actions   │   • Search           │   • Topics        │
│              │   • Q&A Chat         │   • Insights      │
│              │                      │                   │
└──────────────┴──────────────────────┴───────────────────┘
```

---

### Feature Guide

#### 🎤 Upload Audio File

**Location**: Top of left panel

**Steps**:
1. Find an audio file on your computer (MP3, WAV, M4A, or OGG)
2. **Drag and drop** it into the upload box
   - OR click the box and select a file
3. Wait for the upload (you'll see a progress bar)
4. The file will be automatically transcribed

**Supported Formats**:
- ✅ MP3 (most common)
- ✅ WAV (high quality)
- ✅ M4A (iPhone recordings)
- ✅ OGG (web audio)

**File Size Limit**: 25MB

**Tips**:
- Shorter files process faster (under 5 minutes recommended)
- Clear audio = better transcription
- English works best (other languages supported)

---

#### 📝 View Transcript

**Location**: Center panel

**What you'll see**:
- Full text of your audio
- Word count
- Duration
- Timestamp

**Features**:
- **Search**: Type a word in the search box to find it
- **Copy**: Click the copy button to copy all text
- **Scroll**: Scroll through long transcripts

**Example**:
```
Meeting Transcript
Duration: 5:23 | Words: 847

[00:00] John: Welcome everyone to today's meeting...
[00:15] Sarah: Thanks for having me. I'd like to discuss...
```

---

#### 🤖 AI Summary

**Location**: Right panel

**What you'll see**:
- **Key Insights**: 4 main points from the meeting
- **Topics**: Main subjects discussed
- **Sentiment**: Overall tone (Positive, Neutral, Negative)

**Example Card**:
```
┌─────────────────────────────────┐
│ 💡 Key Insight                  │
│                                 │
│ The team agreed to launch the   │
│ new feature by end of Q2        │
└─────────────────────────────────┘
```

---

#### ✅ Action Items

**Location**: Bottom of left panel

**What you'll see**:
- List of tasks extracted from the meeting
- Priority levels (High, Medium, Low)
- Checkboxes to mark complete

**How to use**:
1. Click checkbox to mark a task as done
2. Use filter buttons: All | Active | Completed
3. See progress bar update automatically

**Example**:
```
☐ High Priority: Review Q2 budget by Friday
☐ Medium: Schedule follow-up meeting
☑ Low: Send meeting notes to team (DONE)

Progress: 1/3 completed (33%)
```

---

#### 💬 Ask Questions (RAG Q&A)

**Location**: Center panel (toggle from Transcript view)

**What is this?**
Ask questions about your meeting without re-uploading the file!

**How to use**:
1. Click **"Q&A"** tab in center panel
2. Type your question in the chat box
3. Press Enter or click Send
4. Get an AI-powered answer with sources

**Example Questions**:
- "What were the main decisions made?"
- "Who is responsible for the budget review?"
- "What are the next steps?"
- "Can you summarize the discussion about marketing?"

**Features**:
- ✅ Answers cite specific parts of the transcript
- ✅ Conversation history is saved
- ✅ Can ask follow-up questions
- ✅ Works offline once transcript is indexed

---

#### 📥 Export Your Data

**Location**: Top right corner (Export button)

**Steps**:
1. Click the **"Export"** button
2. Choose what to include:
   - ☑ Transcript
   - ☑ Summary
   - ☑ Action Items
3. Select a format:
   - **TXT** - Plain text (simple)
   - **JSON** - Structured data (for developers)
   - **Markdown** - Formatted text (for documentation)
4. Click on your preferred format
5. File downloads to your Downloads folder

**When to use each format**:
- **TXT**: For reading or printing
- **JSON**: For importing into other apps
- **Markdown**: For GitHub, Notion, or documentation

---

#### 📚 View History

**Location**: Click your profile picture → "Transcript History"

**What you'll see**:
- All your previous transcripts
- Upload dates
- File names
- Quick actions (View, Delete)

**How to use**:
1. Click on any transcript to load it
2. All data (transcript, summary, Q&A) is restored
3. Continue where you left off

---

## 🛑 How to Stop the Application

When you're done using the dashboard:

### Step 1: Close the Browser Tab
Just close the tab with the dashboard.

### Step 2: Stop the Server
1. Go back to the terminal window
2. Press `Ctrl` + `C` on your keyboard
   - Works on Windows, Mac, and Linux
3. You'll see the prompt return
4. You can now close the terminal

**✅ The application is now stopped.**

---

## 🔄 How to Run It Again Later

Next time you want to use the dashboard:

1. **Open Terminal** (Step 1)
2. **Navigate to Project** (Step 2)
   ```bash
   cd path/to/IBM-BOB-Hackathon-Semicolon
   ```
3. **Start Application** (Step 5)
   ```bash
   npm run dev
   ```
4. **Open Browser** (Step 6)
   ```
   http://localhost:5173
   ```

**⚠️ You DON'T need to**:
- ❌ Run `npm install` again
- ❌ Set up API keys again
- ❌ Sign up again (just sign in)

---

## ❓ Frequently Asked Questions

### Q: What if I see an error when running `npm run dev`?

**A**: Try these solutions:

1. **Make sure you're in the right folder**:
   ```bash
   # Check current folder
   pwd  # Mac/Linux
   cd   # Windows
   ```

2. **Restart the terminal**:
   - Close the terminal
   - Open a new one
   - Try again

3. **Check if Node.js is installed**:
   ```bash
   node --version
   # Should show v18.x.x or higher
   ```

### Q: The browser shows "This site can't be reached"

**A**: Make sure:
- ✅ The terminal is still running (don't close it)
- ✅ You see the "ready" message in terminal
- ✅ You typed the correct URL: `http://localhost:5173`
- ✅ No other app is using port 5173

### Q: Can I use this on my phone or tablet?

**A**: Yes! If your device is on the same WiFi network:
1. Look for the "Network" URL in the terminal
2. Type that URL in your phone's browser
3. The dashboard will work on mobile too!

### Q: Do I need internet to use this?

**A**: 
- ✅ **First time**: Yes, to download dependencies and set up
- ✅ **Using AI features**: Yes, for transcription and summarization
- ⚠️ **Viewing saved transcripts**: No, works offline

### Q: Where do my exported files go?

**A**: They go to your computer's **Downloads** folder.

**To find them**:
- **Windows**: Open File Explorer → Downloads
- **Mac**: Open Finder → Downloads
- **Linux**: Open Files → Downloads

### Q: How do I update my API keys?

**A**:
1. Open the `.env.local` file in the project folder
2. Edit the keys
3. Save the file
4. **Restart the application** (Ctrl+C, then `npm run dev`)

### Q: Can multiple people use this at the same time?

**A**: 
- ✅ Yes, each person needs their own account
- ✅ Each person's data is private and separate
- ✅ Multiple people can run it on different computers

### Q: What if I forget my password?

**A**: 
- Use **"Sign in with Google"** instead
- Or create a new account with a different email
- (Password reset feature coming soon!)

---

## 🆘 Getting Help

### If Something Doesn't Work:

1. **Check the terminal** for error messages
2. **Check the browser console**:
   - Press `F12` on your keyboard
   - Look for red error messages
3. **Read the error message** - it often tells you what's wrong
4. **Try the troubleshooting steps** in [SETUP.md](./SETUP.md)

### Common Error Messages:

**"Cannot find module"**
- Solution: Run `npm install` again

**"Port already in use"**
- Solution: Close other apps or use a different port

**"API key invalid"**
- Solution: Check your `.env.local` file

**"Network error"**
- Solution: Check your internet connection

---

## 💡 Tips for Best Experience

### For Better Transcription:
- ✅ Use clear audio recordings
- ✅ Minimize background noise
- ✅ Speak clearly and at normal pace
- ✅ Use good quality microphone

### For Better AI Summaries:
- ✅ Upload complete meetings (not fragments)
- ✅ Include context in the recording
- ✅ Mention names and topics clearly

### For Better Performance:
- ✅ Close unnecessary browser tabs
- ✅ Use a modern browser (Chrome recommended)
- ✅ Have stable internet connection
- ✅ Keep files under 10MB when possible

---

## 🎨 What Makes This Dashboard Special?

### Beautiful Design
- 🌙 **Dark Theme** - Easy on the eyes
- ✨ **Smooth Animations** - Everything moves beautifully
- 📱 **Responsive** - Works on any screen size
- 🎨 **Modern UI** - Professional and clean

### Powerful Features
- 🚀 **Fast** - Lightning-quick transcription
- 🤖 **Smart** - AI-powered insights
- 💬 **Interactive** - Ask questions about your meetings
- 📊 **Organized** - Keep all your transcripts in one place

### Easy to Use
- 👆 **Drag & Drop** - Simple file upload
- 🔍 **Search** - Find anything instantly
- 📥 **Export** - Download in multiple formats
- 💾 **Auto-Save** - Never lose your work

---

## 📝 Quick Reference Card

Print this out or keep it handy!

```
┌─────────────────────────────────────────────────┐
│  AI TRANSCRIPTION DASHBOARD - QUICK REFERENCE   │
├─────────────────────────────────────────────────┤
│                                                 │
│  START:                                         │
│  1. Open terminal                               │
│  2. cd IBM-BOB-Hackathon-Semicolon             │
│  3. npm run dev                                 │
│  4. Open http://localhost:5173                  │
│                                                 │
│  STOP:                                          │
│  1. Press Ctrl + C in terminal                  │
│                                                 │
│  UPLOAD:                                        │
│  • Drag audio file to upload box                │
│  • Formats: MP3, WAV, M4A, OGG                 │
│  • Max size: 25MB                               │
│                                                 │
│  FEATURES:                                      │
│  • Left: Upload & Action Items                  │
│  • Center: Transcript & Q&A                     │
│  • Right: AI Summary & Topics                   │
│  • Top: Export & User Menu                      │
│                                                 │
│  HELP:                                          │
│  • Check terminal for errors                    │
│  • Press F12 for browser console                │
│  • Read SETUP.md for detailed help              │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎉 You're Ready!

Congratulations! You now know how to:
- ✅ Start the application
- ✅ Sign in and use all features
- ✅ Upload and transcribe audio
- ✅ Get AI summaries and action items
- ✅ Ask questions about your meetings
- ✅ Export your data
- ✅ Stop the application

**Now go ahead and try it out!** 🚀

---

## 📞 Additional Resources

For more detailed information:
- [README.md](./README.md) - Project overview and features
- [SETUP.md](./SETUP.md) - Complete setup guide
- [API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md) - API configuration
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase setup
- [RAG_IMPLEMENTATION.md](./RAG_IMPLEMENTATION.md) - Q&A system details
- [Tech_Stack.md](./Tech_Stack.md) - Technology overview

---

**Remember**: You don't need to understand how it works - just follow these steps and enjoy using it!

**Built with ❤️ by Team Semicolon using IBM Bob IDE**

**Made for IBM BOB Hackathon 2024** 🏆