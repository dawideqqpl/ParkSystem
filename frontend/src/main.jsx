// Plik: frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Krok 1: Import
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import './index.css';

function PrivateRoute({ children }) {
  const { authTokens } = useAuth();
  return authTokens ? children : <Navigate to="/login" />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Toaster position="top-center" reverseOrder={false} /> {/* Krok 2: Dodaj komponent */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <App />
              </PrivateRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);