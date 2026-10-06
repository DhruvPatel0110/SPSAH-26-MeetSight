import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { TranscriptProvider } from './contexts/TranscriptContext';
import LoginPage from './components/Auth/LoginPage';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import ActionItemsPage from './components/ActionItems/ActionItemsPage';
import ChatPageSimple from './components/Chatbot/ChatPageSimple';

function App() {
  const { isAuthenticated } = useAuth();

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show dashboard with routing if authenticated
  return (
    <BrowserRouter>
      <TranscriptProvider>
        <Routes>
          <Route path="/" element={<DashboardLayout />} />
          <Route path="/actions" element={<ActionItemsPage />} />
          <Route path="/chat" element={<ChatPageSimple />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TranscriptProvider>
    </BrowserRouter>
  );
}

export default App;
