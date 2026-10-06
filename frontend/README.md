# 🤖 MeetIQ - IBM BOB Hackathon
**Team Semicolon**

A comprehensive AI-powered transcription and meeting analysis platform built with modern web technologies. This dashboard transforms audio recordings into actionable insights with real-time AI processing, user authentication, and intelligent conversation capabilities.

## 🌟 Project Overview

MeetIQ is a full-stack web application that leverages cutting-edge AI services to provide:
- **Real-time audio transcription** using Groq Whisper API
- **Intelligent summarization** with Google Gemini AI
- **RAG-powered Q&A** for conversational meeting analysis
- **User authentication** and session management with Firebase
- **Persistent data storage** for transcript history and conversations
- **Modern, responsive UI** with dark theme and smooth animations

## ✨ Key Features

### 🎯 Core Functionality
- **🎤 Audio Upload & Processing**
  - Drag-and-drop interface with file validation
  - Support for MP3, WAV, M4A, OGG formats (up to 25MB)
  - Real-time transcription using Groq Whisper API
  - Automatic language detection

- **📝 AI-Powered Analysis**
  - Intelligent summarization with key insights
  - Topic extraction and sentiment analysis
  - Automatic action item generation with priorities
  - Speaker identification and timestamps

- **💬 Conversational AI (RAG)**
  - Ask questions about your meetings without re-uploading
  - Semantic search through transcript content
  - Persistent conversation history
  - Source citations for transparency

- **👤 User Management**
  - Firebase Authentication (Google OAuth + Email/Password)
  - Personal transcript history and storage
  - User profiles with session persistence
  - Secure data isolation per user

### 🎨 User Experience
- **Modern Dark UI** with gradient effects and smooth animations
- **Responsive Design** optimized for desktop, tablet, and mobile
- **Real-time Updates** with loading states and progress indicators
- **Export Functionality** to TXT, JSON, and Markdown formats
- **Search & Filter** capabilities across all content

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern component-based UI framework
- **Vite** - Lightning-fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework for rapid styling
- **Framer Motion** - Production-ready motion library for animations
- **Lucide React** - Beautiful, customizable SVG icons
- **React Router DOM** - Client-side routing for SPA navigation

### Backend & Services
- **Firebase Authentication** - Secure user authentication and session management
- **Cloud Firestore** - NoSQL database for user data and transcript storage
- **Groq Whisper API** - High-speed, accurate speech-to-text transcription
- **Google Gemini AI** - Advanced language model for summarization and Q&A
- **RAG Pipeline** - Custom implementation for intelligent document retrieval

### Development Tools
- **IBM Bob IDE** - AI-assisted development environment (Hackathon requirement)
- **Node.js 18+** - JavaScript runtime for development
- **PostCSS & Autoprefixer** - CSS processing and browser compatibility
- **ESLint** - Code quality and consistency

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd IBM-BOB-Hackathon-Semicolon
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your API keys:
   ```env
   # Groq API Key (FREE - No card required)
   VITE_GROQ_API_KEY=gsk_your_groq_key_here
   
   # Gemini API Key (FREE - No card required)
   VITE_GEMINI_API_KEY=AIza_your_gemini_key_here
   
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth/                    # Authentication components
│   │   ├── LoginModal.jsx       # Login/signup modal
│   │   ├── LoginPage.jsx        # Full-page login
│   │   └── UserMenu.jsx         # User dropdown menu
│   ├── Dashboard/               # Main dashboard layout
│   │   ├── DashboardLayout.jsx  # 3-column responsive layout
│   │   └── DashboardHeader.jsx  # Header with export & user menu
│   ├── Upload/                  # File upload functionality
│   │   └── AudioUpload.jsx      # Drag-and-drop audio upload
│   ├── Transcript/              # Transcript display
│   │   └── TranscriptViewer.jsx # Searchable transcript viewer
│   ├── Summary/                 # AI summary display
│   │   └── SummaryCards.jsx     # Key insights cards
│   ├── ActionItems/             # Task management
│   │   ├── ActionItemsPanel.jsx # Interactive checklist
│   │   └── ActionItemsPage.jsx  # Full-page action items
│   ├── Chatbot/                 # RAG Q&A interface
│   │   ├── ChatInterface.jsx    # Real-time chat UI
│   │   └── ConversationHistory.jsx # Chat history viewer
│   ├── History/                 # Transcript history
│   │   └── TranscriptHistory.jsx # User's saved transcripts
│   ├── Export/                  # Data export functionality
│   │   └── ExportButton.jsx     # Multi-format export modal
│   └── UI/                      # Reusable UI components
│       ├── Button.jsx           # Styled button component
│       ├── Card.jsx             # Container card component
│       ├── Modal.jsx            # Modal dialog component
│       └── Skeleton.jsx         # Loading skeleton screens
├── services/                    # API and business logic
│   ├── authService.js           # Firebase authentication
│   ├── firestoreService.js      # Database operations
│   ├── groqService.js           # Audio transcription API
│   ├── geminiService.js         # AI summarization API
│   ├── embeddingService.js      # Vector embeddings for RAG
│   ├── ragService.js            # RAG pipeline implementation
│   ├── conversationService.js   # Chat history management
│   └── localAuthService.js      # Local authentication fallback
├── contexts/                    # React context providers
│   ├── AuthContext.jsx          # Global authentication state
│   └── TranscriptContext.jsx    # Transcript data management
├── config/                      # Configuration files
│   └── firebase.js              # Firebase initialization
├── utils/                       # Utility functions
│   ├── sampleData.js            # Demo data for development
│   └── exportHelpers.js         # File export utilities
├── App.jsx                      # Root application component
├── main.jsx                     # Application entry point
└── index.css                    # Global styles and Tailwind imports
```

## 🎯 Core Features Explained

### 1. Audio Transcription Pipeline
- **Upload**: Drag-and-drop or click to select audio files
- **Validation**: File type, size, and format checking
- **Processing**: Real-time transcription via Groq Whisper API
- **Display**: Formatted transcript with search and copy functionality

### 2. AI Analysis Engine
- **Summarization**: Gemini AI extracts key insights and topics
- **Action Items**: Automatic task identification with priority levels
- **Sentiment Analysis**: Overall meeting tone and participant engagement
- **Caching**: Smart caching to preserve API credits

### 3. RAG-Powered Q&A System
- **Indexing**: Automatic vector embedding generation for transcripts
- **Retrieval**: Semantic search through meeting content
- **Generation**: Context-aware answers with source citations
- **Persistence**: Conversation history stored in Firestore

### 4. User Authentication & Data Management
- **Multi-Auth**: Google OAuth and email/password authentication
- **Data Isolation**: Secure, user-specific data storage
- **Session Management**: Persistent login across browser sessions
- **History**: Complete transcript and conversation history

## 📊 API Integration

### Groq Whisper API
- **Purpose**: High-speed audio transcription
- **Model**: Whisper Large V3
- **Rate Limits**: 14,400 requests/day (FREE)
- **Features**: Multi-language support, speaker diarization

### Google Gemini AI
- **Purpose**: Text summarization and Q&A generation
- **Model**: Gemini 1.5 Flash
- **Rate Limits**: 60 requests/minute, 1,500/day (FREE)
- **Features**: Long context, JSON output, conversation memory

### Firebase Services
- **Authentication**: Google OAuth, Email/Password
- **Firestore**: NoSQL database for user data
- **Security**: User-specific data isolation with security rules

## 🔒 Security & Privacy

### Data Protection
- **Client-Side Encryption**: Sensitive data encrypted before storage
- **User Isolation**: Firestore security rules prevent cross-user access
- **API Key Security**: Environment variables for sensitive credentials
- **Session Management**: Secure token-based authentication

### Privacy Features
- **Local Processing**: Audio files processed via secure APIs only
- **Data Retention**: User controls their data with delete functionality
- **No Tracking**: No analytics or user behavior tracking
- **GDPR Compliance**: User data export and deletion capabilities

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--primary-bg: #0a0e27        /* Deep navy background */
--primary-surface: #151b3d   /* Card backgrounds */
--primary-border: #1e293b    /* Subtle borders */

/* Accent Colors */
--accent-cyan: #00d4ff       /* Primary accent */
--accent-purple: #7c3aed     /* Secondary accent */
--accent-green: #10b981      /* Success states */
--accent-red: #ef4444        /* Error states */

/* Text Colors */
--text-primary: #f8fafc      /* Primary text */
--text-secondary: #94a3b8    /* Secondary text */
--text-muted: #64748b        /* Muted text */
```

### Typography
- **Font Family**: Inter (system fallback)
- **Headings**: Bold weights with proper hierarchy
- **Body Text**: Regular weight, optimized line height
- **Code**: Monospace font for technical content

### Animations
- **Page Transitions**: Smooth fade and slide effects
- **Hover States**: Subtle scale and color transitions
- **Loading States**: Skeleton screens and progress indicators
- **Micro-interactions**: Button clicks, form submissions

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px (Single column layout)
- **Tablet**: 768px - 1024px (Two column layout)
- **Desktop**: 1024px+ (Three column layout)

### Adaptive Features
- **Navigation**: Collapsible sidebar on mobile
- **Cards**: Stacked layout on smaller screens
- **Modals**: Full-screen on mobile, centered on desktop
- **Typography**: Responsive font sizes and spacing

## 🚀 Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Lazy loading for route components
- **Asset Optimization**: Compressed images and optimized bundles
- **Caching**: Service worker for offline functionality
- **Virtualization**: Efficient rendering for large lists

### API Optimizations
- **Request Caching**: Intelligent caching to reduce API calls
- **Batch Processing**: Grouped operations where possible
- **Error Handling**: Graceful degradation and retry logic
- **Rate Limiting**: Client-side rate limiting to prevent quota exhaustion

## 🧪 Testing & Quality Assurance

### Manual Testing Checklist
- [ ] Audio upload and transcription
- [ ] AI summarization and action items
- [ ] User authentication (Google + Email)
- [ ] RAG Q&A functionality
- [ ] Export functionality (all formats)
- [ ] Responsive design (all breakpoints)
- [ ] Error handling and edge cases
- [ ] Performance under load

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📈 Future Enhancements

### Planned Features
- **Real-time Collaboration**: Multi-user meeting analysis
- **Advanced Analytics**: Meeting insights and trends
- **Integration APIs**: Slack, Teams, Zoom integration
- **Mobile App**: React Native companion app
- **Enterprise Features**: Team management and admin controls

### Technical Improvements
- **Performance**: WebAssembly for client-side processing
- **Offline Support**: Progressive Web App capabilities
- **Accessibility**: WCAG 2.1 AA compliance
- **Internationalization**: Multi-language support

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request with detailed description

### Code Standards
- **ESLint**: Follow the configured linting rules
- **Prettier**: Use consistent code formatting
- **Comments**: Document complex logic and API integrations
- **Testing**: Add tests for new functionality

## 📄 License & Acknowledgments

### License
This project is developed for the IBM BOB Hackathon by Team Semicolon. All rights reserved.

### Acknowledgments
- **IBM Watson** for AI capabilities and hackathon opportunity
- **Groq** for lightning-fast transcription API
- **Google** for Gemini AI and Firebase services
- **Vercel** for inspiration on modern web development
- **Open Source Community** for the amazing tools and libraries

### Team Semicolon
Built with passion and dedication for the IBM BOB Hackathon 2024.

---

## 📞 Support & Documentation

For detailed setup instructions, see:
- [SETUP.md](./SETUP.md) - Complete setup guide
- [HOW_TO_RUN.md](./HOW_TO_RUN.md) - Step-by-step running instructions
- [API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md) - API configuration guide
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase setup instructions
- [RAG_IMPLEMENTATION.md](./RAG_IMPLEMENTATION.md) - RAG system documentation
- [Tech_Stack.md](./Tech_Stack.md) - Detailed technology overview

**Made with ❤️ using IBM Bob IDE**