// Plik: frontend/src/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import * as api from './apiService'; // Będziemy potrzebować apiService

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authTokens, setAuthTokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null);

  const loginUser = async (username, password) => {
    const response = await axios.post('http://127.0.0.1:8000/api/token/', {
      username,
      password
    });
    if (response.status === 200) {
      setAuthTokens(response.data);
      // Prosta symulacja danych użytkownika - w przyszłości można pobrać z API
      setUser({ username }); 
      localStorage.setItem('authTokens', JSON.stringify(response.data));
    }
    return response;
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
  };

  const contextData = {
    user,
    authTokens,
    loginUser,
    logoutUser,
  };

  // Dodajemy token do każdego zapytania w apiService
  useEffect(() => {
    api.setupInterceptors(authTokens);
  }, [authTokens]);

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;