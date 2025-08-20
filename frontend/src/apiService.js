// Plik: frontend/src/apiService.js

import axios from 'axios';

// Stwórz instancję axios z konfiguracją
const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    withCredentials: false, // Ustaw na false dla JWT tokens
    headers: {
        'Content-Type': 'application/json',
    },
});

// INTERCEPTOR REQUEST - automatycznie dodaje token do każdego requesta
apiClient.interceptors.request.use(
    (config) => {
        const tokensString = localStorage.getItem('authTokens');
        if (tokensString) {
            try {
                const tokens = JSON.parse(tokensString);
                if (tokens.access_token) {
                    config.headers.Authorization = `Bearer ${tokens.access_token}`;
                    console.log('🔑 Token added to request');
                }
            } catch (error) {
                console.error('Error parsing tokens from localStorage:', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// INTERCEPTOR RESPONSE - obsługa błędów autoryzacji
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            console.log('❌ Unauthorized - redirecting to login');
            localStorage.removeItem('authTokens');
            localStorage.removeItem('userProfile');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// FUNKCJE API

// Rezerwacje
export const getReservations = () => {
    return apiClient.get('reservations/');
};

export const addReservation = (reservationData) => {
    return apiClient.post('reservations/', reservationData);
};

export const updateReservation = (id, reservationData) => {
    return apiClient.put(`reservations/${id}/`, reservationData);
};

export const deleteReservation = (id) => {
    return apiClient.delete(`reservations/${id}/`);
};

export const toggleReservationStatus = (id) => {
    return apiClient.post(`reservations/${id}/toggle_complete/`);
};

export const togglePaymentStatus = (id) => {
    return apiClient.post(`reservations/${id}/toggle_payment/`);
};

export const getFlightStatus = (id) => {
    return apiClient.get(`reservations/${id}/flight_status/`);
};

// Profil użytkownika
export const getUserProfile = () => {
    return apiClient.get('profile/');
};

export const setUserPlan = (plan) => {
    return apiClient.post('set-plan/', { plan_code: plan });
};

// Ustawienia cenowe
export const getPricingSettings = () => {
    return apiClient.get('pricing-settings/');
};

export const updatePricingSettings = (settings) => {
    return apiClient.put('pricing-settings/', settings);
};

// Eksport domyślny
export default apiClient;
