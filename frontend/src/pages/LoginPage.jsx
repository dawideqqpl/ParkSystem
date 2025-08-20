// Plik: frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import toast from 'react-hot-toast';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { loginUser, handleSocialLogin } = useAuth();
    const navigate = useNavigate();

    const handleTraditionalLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const profile = await loginUser(username, password);
            if (profile && profile.plan_code) {
                navigate('/');
            } else {
                navigate('/select-plan');
            }
        } catch (err) {
            setError('Nieprawidłowa nazwa użytkownika lub hasło.');
        }
    };

    // POPRAWIONA FUNKCJA - takie same URL i nazwy jak w RegistrationPage
    const handleGoogleSuccess = async (credentialResponse) => {
        const id_token = credentialResponse.credential;
        try {
            // POPRAWIONY URL - bez /login/ na końcu
            const response = await axios.post('http://127.0.0.1:8000/api/auth/google/', {
                id_token: id_token, // POPRAWIONA NAZWA TOKENA
            });
            
            const profile = await handleSocialLogin(response.data);
            if (profile && profile.plan_code) {
                navigate('/');
            } else {
                navigate('/select-plan');
            }
        } catch (err) {
            toast.error("Logowanie przez Google nie powiodło się.");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-center text-gray-900">
                        Zaloguj się do ParkSystem
                    </h2>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg">
                    {/* Formularz standardowego logowania */}
                    <form onSubmit={handleTraditionalLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Nazwa użytkownika
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Wprowadź nazwę użytkownika"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Hasło
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Wprowadź hasło"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Zaloguj
                            </button>
                        </div>
                    </form>

                    {/* Separator */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">lub</span>
                            </div>
                        </div>
                    </div>

                    {/* Google Login Button */}
                    <div className="mt-6">
                      <GoogleLogin
    onSuccess={handleGoogleSuccess}
    onError={() => toast.error('Logowanie przez Google nie powiodło się')}
    useOneTap={false}  // Wyłącz One Tap, żeby zawsze pokazać picker
    auto_select={false}  // Wyłącz automatyczny wybór
    locale="pl"
/>
                    </div>

                    {/* Link do rejestracji */}
                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            Nie masz konta?{' '}
                            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                Zarejestruj się
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
