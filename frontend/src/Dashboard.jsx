// Dashboard.jsx - z trzema stanami: Planowany, Teraz, Do zamknięcia

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

function Dashboard({ activeReservations = [], completedReservations = [], todaysPickups = [] }) {
    const { userProfile, authTokens } = useAuth();
    const { t } = useTranslation();
    
    const [showTimeline, setShowTimeline] = useState(true);

    // Loading state gdy brak tokena lub profilu
    if (!authTokens || !userProfile) {
        return (
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded mb-6"></div>
                    <div className="bg-white rounded-2xl p-6">
                        <div className="h-6 bg-gray-300 rounded mb-4"></div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="text-center">
                                    <div className="bg-gray-300 w-16 h-16 rounded-full mx-auto mb-3"></div>
                                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-300 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Oblicz statystyki
    const totalReservations = activeReservations.length;
    const completedCount = completedReservations.length;
    const todaysCount = todaysPickups.length;
    const usage = userProfile.usage || totalReservations;
    const limit = userProfile.limit || 0;
    const usagePercentage = limit > 0 ? Math.round((usage / limit) * 100) : 0;

    // Kolor paska usage
    const getUsageColor = (percentage) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    // NOWA FUNKCJA - określa status odbioru (3 stany)
    const getPickupStatus = (pickupTime) => {
        const diffMinutes = (new Date() - new Date(pickupTime)) / (1000 * 60);
        
        if (diffMinutes < 0) {
            return 'planned'; // Jeszcze przed czasem
        } else if (diffMinutes >= 0 && diffMinutes <= 60) {
            return 'current'; // W trakcie (0-60 minut)
        } else {
            return 'overdue'; // Po czasie (ponad 60 minut)
        }
    };

    // Przygotuj dane dla osi czasu dzisiejszych odbiorów
    const getTodaysTimelineData = () => {
        const today = new Date();
        const todayString = today.toDateString();
        
        const todaysReservations = activeReservations.filter(res => {
            const returnDate = new Date(res.returnDate);
            return returnDate.toDateString() === todayString;
        }).sort((a, b) => new Date(a.returnDate) - new Date(b.returnDate));

        return todaysReservations;
    };

    const todaysTimeline = getTodaysTimelineData();

    return (
        <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {'Panel główny'}
                    </h2>
                    <p className="text-gray-600 mt-1">
                        {`Witaj ${userProfile.email || 'użytkowniku'}`}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Plan: {userProfile.plan_name || userProfile.plan}</p>
                    <p className="text-xs text-gray-400">
                        {new Date().toLocaleDateString('pl-PL', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
            </div>

        {/* Compact Stats Bar */}
<div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Przegląd statystyk</h3>
    
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🚗</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{totalReservations}</div>
            <div className="text-sm text-gray-600">Aktywne rezerwacje</div>
        </div>
        
        <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📅</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{todaysCount}</div>
            <div className="text-sm text-gray-600">Dzisiejsze odbiory</div>
        </div>
        
        <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✅</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{completedCount}</div>
            <div className="text-sm text-gray-600">Zakończone</div>
        </div>
        
        {/* ZMIENIONA KARTA - bez % i slidera */}
        <div className="text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{usage}/{limit} miejsc</div>
            <div className="text-sm text-gray-600">Wykorzystanie planu</div>
        </div>
    </div>

                {/* Progress bar dla wykorzystania planu */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Plan: {userProfile.plan_name}</span>
                        <span className="text-sm text-gray-600">{usage}/{limit} miejsc</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(usagePercentage)}`}
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Toggle osi czasu */}
            {todaysTimeline.length > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">📅</span>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Dzisiejsze odbiory - Oś czasu
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {todaysTimeline.length} odbiorów na dziś
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowTimeline(!showTimeline)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                showTimeline 
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {showTimeline ? '🔼 Ukryj' : '🔽 Pokaż'}
                        </button>
                    </div>
                </div>
            )}

            {/* SEKCJA OSI CZASU - z trzema stanami */}
            {todaysTimeline.length > 0 && showTimeline ? (
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <div className="relative">
                        {/* Linia osi czasu */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                        
                        <div className="space-y-6">
                            {todaysTimeline.map((pickup, index) => {
                                const pickupTime = new Date(pickup.returnDate);
                                const status = getPickupStatus(pickup.returnDate); // NOWA FUNKCJA
                                
                                // DEFINICJE KOLORÓW I TEKSTÓW dla 3 stanów
                                const statusConfig = {
                                    planned: {
                                        dotColor: 'bg-blue-500',
                                        bgColor: 'bg-blue-50 border-blue-500',
                                        badgeColor: 'bg-blue-100 text-blue-800',
                                        label: '📋 Planowany',
                                        subtitle: 'Zaplanowany'
                                    },
                                    current: {
                                        dotColor: 'bg-green-500 ring-4 ring-green-200',
                                        bgColor: 'bg-green-50 border-green-500 shadow-md',
                                        badgeColor: 'bg-green-100 text-green-800 ring-2 ring-green-300',
                                        label: '⏰ Teraz',
                                        subtitle: 'W trakcie (1h)'
                                    },
                                    overdue: {
                                        dotColor: 'bg-red-500 ring-4 ring-red-200',
                                        bgColor: 'bg-red-50 border-red-500 shadow-md',
                                        badgeColor: 'bg-red-100 text-red-800 ring-2 ring-red-300',
                                        label: '⚠️ Do zamknięcia',
                                        subtitle: 'Prawdopodobnie skończone'
                                    }
                                };
                                
                                const config = statusConfig[status];
                                
                                return (
                                    <div key={pickup.id} className="relative flex items-start">
                                        {/* Punkt na osi czasu */}
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg z-10 transition-all duration-300 ${config.dotColor}`}>
                                            {pickupTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        
                                        {/* Karta z danymi odbioru */}
                                        <div className={`ml-6 flex-1 p-4 rounded-lg shadow-sm border-l-4 transition-all duration-300 ${config.bgColor}`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{pickup.customerName}</h4>
                                                    <p className="text-gray-600">{pickup.licensePlate}</p>
                                                    {pickup.flightNumber && (
                                                        <p className="text-sm text-blue-600 font-medium">
                                                            ✈️ Lot: {pickup.flightNumber}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${config.badgeColor}`}>
                                                        {config.label}
                                                    </div>
                                                    <p className={`text-xs mt-1 ${
                                                        status === 'planned' ? 'text-blue-600' :
                                                        status === 'current' ? 'text-green-600' :
                                                        'text-red-600'
                                                    }`}>
                                                        {config.subtitle}
                                                    </p>
                                                </div>
                                            </div>
                                            {pickup.phone_number && (
                                                <p className="text-sm text-gray-500 mt-2">
                                                    📞 {pickup.phone_number}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : todaysTimeline.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm text-center mb-6">
                    <div className="text-6xl mb-4">🌅</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Brak odbiorów na dziś</h3>
                    <p className="text-gray-600">Nie ma zaplanowanych odbiorów na dzisiejszy dzień</p>
                </div>
            ) : null}

            {/* Brak danych */}
            {totalReservations === 0 && (
                <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Brak aktywnych rezerwacji</h3>
                    <p className="text-gray-600">Dodaj pierwszą rezerwację, aby rozpocząć zarządzanie parkingiem</p>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
