// Plik: frontend/src/pages/RegistrationPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../apiService';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../AuthContext';
import axios from 'axios';

function RegistrationPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { handleSocialLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== password2) {
            setError({ detail: "Hasła nie są takie same." });
            return;
        }

        try {
            await api.registerUser({ username, email, password, password2 });
            toast.success('Konto zostało utworzone! Możesz się teraz zalogować.');
            navigate('/login');
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData) {
                const formattedErrors = Object.entries(errorData).map(([key, value]) => {
                    const fieldName = {
                        username: "Nazwa użytkownika",
                        email: "Email",
                        password: "Hasło"
                    }[key] || key;
                    return `${fieldName}: ${value.join(' ')}`;
                }).join('\n');
                setError({ detail: formattedErrors });
            } else {
                setError({ detail: "Wystąpił nieznany błąd." });
            }
        }
    };
    
    const handleGoogleSuccess = async (credentialResponse) => {
        const id_token = credentialResponse.credential;
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/auth/google/', {
                id_token: id_token,  // Używaj id_token
            });
            
            const profile = await handleSocialLogin(response.data);
            if (profile && profile.plan_code) {
                navigate('/');
            } else {
                navigate('/select-plan');
            }
        } catch (err) {
            toast.error("Rejestracja przez Google nie powiodła się.");
            console.error(err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Utwórz nowe konto</h1>

                <div className="flex justify-center">
                  <GoogleLogin
    onSuccess={handleGoogleSuccess}
    onError={() => toast.error('Logowanie przez Google nie powiodło się')}
    useOneTap={false}  // Wyłącz One Tap, żeby zawsze pokazać picker
    auto_select={false}  // Wyłącz automatyczny wybór
    locale="pl"
/>
                </div>

                <div className="relative flex items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">LUB</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium">Nazwa użytkownika</label>
                        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium">Adres e-mail</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="password">Hasło</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="password2">Powtórz hasło</label>
                        <input id="password2" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md"/>
                    </div>
                    
                    {error && (
                        <div className="text-red-500 text-sm whitespace-pre-line">
                            {error.detail}
                        </div>
                    )}

                    <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">Zarejestruj się</button>
                </form>
                <p className="text-center text-sm text-slate-600">
                    Masz już konto?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:underline">
                        Zaloguj się
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegistrationPage;
