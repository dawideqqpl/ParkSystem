// Plik: frontend/src/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Funkcja setupInterceptors do zarządzania axios interceptors
const setupInterceptors = (authTokens) => {
    // Wyczyść istniejące interceptors
    axios.interceptors.request.clear();
    axios.interceptors.response.clear();

    if (authTokens) {
        // Request interceptor - dodaj token do każdego requesta
        axios.interceptors.request.use(
            (config) => {
                if (authTokens.access_token) {
                    config.headers.Authorization = `Bearer ${authTokens.access_token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - obsługa błędów autoryzacji
        axios.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                if (error.response && error.response.status === 401) {
                    // Token wygasł - wyloguj użytkownika
                    console.log('Token expired - logging out');
                    localStorage.removeItem('authTokens');
                    localStorage.removeItem('userProfile');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }
};

// AuthContext.jsx - cała poprawiona funkcja AuthProvider

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() => 
        localStorage.getItem('authTokens') 
            ? JSON.parse(localStorage.getItem('authTokens')) 
            : null
    );
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Setup interceptors natychmiast gdy authTokens się zmieni
    useEffect(() => {
        setupInterceptors(authTokens);
    }, [authTokens]);

    // Pobierz profil użytkownika
    const fetchUserProfile = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/profile/');
            setUserProfile(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Jeśli błąd 401, nie loguj błędu - może być niezalogowany
            if (error.response && error.response.status === 401) {
                return null;
            }
            throw error;
        }
    };

    // Standardowe logowanie
    const loginUser = async (username, password) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
                username,
                password,
            });
            
            setAuthTokens(response.data);
            localStorage.setItem('authTokens', JSON.stringify(response.data));
            setupInterceptors(response.data);
            
            const profile = await fetchUserProfile();
            toast.success('Zalogowano pomyślnie!');
            return profile;
        } catch (error) {
            toast.error('Błąd logowania');
            throw error;
        }
    };

    // Logowanie przez Google (social login)
    const handleSocialLogin = async (data) => {
        try {
            setAuthTokens(data);
            localStorage.setItem('authTokens', JSON.stringify(data));
            setupInterceptors(data);
            
            const profile = await fetchUserProfile();
            toast.success('Zalogowano przez Google!');
            return profile;
        } catch (error) {
            toast.error('Błąd logowania przez Google');
            throw error;
        }
    };

    // Wylogowanie
    const logoutUser = () => {
        // Wyłącz automatyczne wybieranie konta Google
        if (window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        
        // Usuń tokeny z localStorage
        localStorage.removeItem('authTokens');
        localStorage.removeItem('userProfile');
        
        // Wyczyść stan
        setAuthTokens(null);
        setUserProfile(null);
        setIsLoading(false);
        
        // Wyczyść interceptors
        setupInterceptors(null);
        
        // Opcjonalnie wywołaj API logout
        try {
            axios.post('http://127.0.0.1:8000/api/auth/logout/');
        } catch (error) {
            console.log('Logout API error:', error);
        }
        
        // Przekieruj na login
        navigate('/login');
        
        toast.success('Wylogowano pomyślnie');
    };

    // Funkcja do ustawiania planu użytkownika
    const setUserPlan = async (planCode) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/set-plan/', {
                plan_code: planCode
            });
            
            // Odśwież profil po ustawieniu planu
            await fetchUserProfile();
            toast.success('Plan został ustawiony!');
            return response.data;
        } catch (error) {
            toast.error('Błąd ustawiania planu');
            throw error;
        }
    };

    // POPRAWIONA inicjalizacja auth - z timeout jako safety net
    useEffect(() => {
        let timeoutId;
        
        const initializeAuth = async () => {
            console.log('Initializing auth...', { hasTokens: !!authTokens });
            
            if (authTokens) {
                try {
                    console.log('Fetching user profile...');
                    await fetchUserProfile();
                    console.log('Profile fetched successfully');
                } catch (error) {
                    console.error('Error initializing auth:', error);
                    if (error.response?.status === 401) {
                        // Token nieprawidłowy - wyloguj bez komunikatów
                        console.log('Invalid token, clearing auth state');
                        setAuthTokens(null);
                        setUserProfile(null);
                        localStorage.removeItem('authTokens');
                        localStorage.removeItem('userProfile');
                    }
                }
            } else {
                console.log('No auth tokens found');
            }
            
            // ZAWSZE ustaw isLoading na false
            console.log('Setting isLoading to false');
            setIsLoading(false);
        };

        // Timeout jako safety net - 10 sekund maksymalnie
        timeoutId = setTimeout(() => {
            console.warn('Auth initialization timeout - forcing isLoading to false');
            setIsLoading(false);
        }, 10000);

        // Uruchom inicjalizację
        initializeAuth().finally(() => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        });

        // Cleanup
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []); // PUSTA TABLICA - tylko raz przy mount, bez authTokens dependency

    // Context value
    const contextValue = {
        authTokens,
        userProfile,
        isLoading,
        loginUser,
        logoutUser,
        handleSocialLogin,
        fetchUserProfile,
        setUserPlan,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
// Hook do używania AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
