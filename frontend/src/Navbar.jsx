// Plik: frontend/src/Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
    const { logoutUser, userProfile } = useAuth();
    const { t } = useTranslation();

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-blue-600">
                            🅿️ ParkSystem
                        </div>
                        <div className="hidden sm:block text-sm text-gray-500">
                            {t('dashboard.subtitle') || 'Centrum zarządzania parkingiem'}
                        </div>
                    </div>

                    {/* User info i przyciski */}
                    <div className="flex items-center space-x-4">
                        {/* Informacje o planie użytkownika */}
                        {userProfile && (
                            <div className="hidden md:flex items-center space-x-3 text-sm">
                                <div className="text-gray-600">
                                    <span className="font-medium">{userProfile.plan}</span>
                                </div>
                                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {userProfile.usage}/{userProfile.limit}
                                </div>
                            </div>
                        )}

                        {/* Przyciski */}
                        <div className="flex items-center space-x-2">
                            <Link
                                to="/settings"
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Ustawienia"
                            >
                                <span className="text-lg">⚙️</span>
                                <span className="hidden sm:inline">Ustawienia</span>
                            </Link>
                            
                            <button
                                onClick={logoutUser}
                                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Wyloguj"
                            >
                                <span className="text-lg">🔓</span>
                                <span className="hidden sm:inline">Wyloguj</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
