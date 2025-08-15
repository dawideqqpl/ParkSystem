// Plik: frontend/src/apiService.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Ta funkcja konfiguruje "przechwytywacz" (interceptor)
export const setupInterceptors = (authTokens) => {
  apiClient.interceptors.request.use(
    config => {
      if (authTokens) {
        config.headers['Authorization'] = `Bearer ${authTokens.access}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
};

// Reszta funkcji pozostaje bez zmian

export const getReservations = () => apiClient.get('reservations/');
export const addReservation = (reservationData) => apiClient.post('reservations/', reservationData);
export const updateReservation = (id, reservationData) => apiClient.put(`reservations/${id}/`, reservationData);
export const deleteReservation = (id) => apiClient.delete(`reservations/${id}/`);

export const saveSubscription = (subscriptionData) => {
  return apiClient.post('save-subscription/', subscriptionData);
};