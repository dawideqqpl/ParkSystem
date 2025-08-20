// Plik: frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Importujemy dostawcę
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegistrationPage from './pages/RegistrationPage.jsx';
import PlanSelectionPage from './pages/PlanSelectionPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import Spinner from './Spinner.jsx';
import './index.css';
import 'react-datepicker/dist/react-datepicker.css';
import './i18n';

// --- WAŻNE: Upewnij się, że wkleiłeś tutaj swój Client ID ---
const GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_OAUTH2_CLIENT_ID');

function PrivateRoute({ children }) {
  const { authTokens, userProfile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!authTokens) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!userProfile?.plan_code && location.pathname !== '/select-plan') {
    return <Navigate to="/select-plan" replace />;
  }

  if (userProfile?.plan_code && location.pathname === '/select-plan') {
    return <Navigate to="/" replace />;
  }

  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* --- POPRAWKA: Opakowujemy całą aplikację w GoogleOAuthProvider --- */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/select-plan" element={<PrivateRoute><PlanSelectionPage /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
            <Route path="/" element={<PrivateRoute><App /></PrivateRoute>} />
          </Routes>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
