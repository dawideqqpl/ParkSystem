// Plik: frontend/src/pages/SettingsPage.jsx
import { useState, useEffect } from 'react';
import * as api from '../apiService';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Spinner from '../Spinner';
import LanguageSwitcher from '../LanguageSwitcher'; // Importujemy przełącznik języka
import { useTranslation } from 'react-i18next'; // Importujemy hook do tłumaczeń

const PriceInput = ({ label, name, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="relative mt-1 rounded-md shadow-sm">
            <input
                type="number"
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                className="w-full rounded-md border-slate-300 pl-4 pr-12 focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">PLN</span>
            </div>
        </div>
    </div>
);

function SettingsPage() {
    const { t } = useTranslation(); // Inicjalizujemy funkcję tłumaczącą
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getPricingSettings()
            .then(res => setSettings(res.data))
            .catch(() => toast.error(t('toasts.settingsLoadError')))
            .finally(() => setIsLoading(false));
    }, [t]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.promise(
            api.updatePricingSettings(settings),
            {
                loading: t('toasts.settingsSaveLoading'),
                success: t('toasts.settingsSaveSuccess'),
                error: t('toasts.settingsSaveError')
            }
        );
    };

    if (isLoading || !settings) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="bg-slate-100 min-h-screen">
            <div className="container mx-auto p-4 max-w-4xl">
                <header className="bg-blue-800 text-white p-6 rounded-lg shadow-lg mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
                    <Link to="/" className="bg-slate-100 text-slate-800 font-bold py-2 px-4 rounded-lg hover:bg-slate-200 transition">
                        &larr; {t('settings.back')}
                    </Link>
                </header>
                <main className="bg-white p-6 rounded-lg shadow-md space-y-8">
                    {/* Sekcja zmiany języka */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Język</h2>
                        <LanguageSwitcher />
                    </div>

                    {/* Linia oddzielająca */}
                    <hr />

                    {/* Sekcja cennika */}
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-xl font-semibold mb-4">{t('settings.pricingTitle')}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <PriceInput label={t('settings.day', { count: 1 })} name="day_1" value={settings.day_1} onChange={handleChange} />
                            <PriceInput label={t('settings.days', { count: 2 })} name="day_2" value={settings.day_2} onChange={handleChange} />
                            <PriceInput label={t('settings.days', { count: 3 })} name="day_3" value={settings.day_3} onChange={handleChange} />
                            <PriceInput label={t('settings.days', { count: 4 })} name="day_4" value={settings.day_4} onChange={handleChange} />
                            <PriceInput label={t('settings.days', { count: 5 })} name="day_5" value={settings.day_5} onChange={handleChange} />
                            <PriceInput label={t('settings.days', { count: 6 })} name="day_6" value={settings.day_6} onChange={handleChange} />
                            <PriceInput label={t('settings.days', { count: 7 })} name="day_7" value={settings.day_7} onChange={handleChange} />
                            <PriceInput label={t('settings.extraDay')} name="extra_day" value={settings.extra_day} onChange={handleChange} />
                        </div>
                        <div className="mt-8 text-right">
                            <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700">
                                {t('settings.save')}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}

export default SettingsPage;
