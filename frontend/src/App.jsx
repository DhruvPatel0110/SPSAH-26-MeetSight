import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { TranscriptProvider } from './contexts/TranscriptContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './components/Auth/LoginPage';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import ActionItemsPage from './components/ActionItems/ActionItemsPage';
import ChatPageSimple from './components/Chatbot/ChatPageSimple';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <TranscriptProvider>
          <Routes>
            <Route path="/" element={<DashboardLayout />} />
            <Route path="/actions" element={<ActionItemsPage />} />
            <Route path="/chat" element={<ChatPageSimple />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TranscriptProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
