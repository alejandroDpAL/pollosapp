
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshAccessToken } from './tokenRefresh.js';

const BASE_URL = 'http://192.168.100.11:3000';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Interceptor de Request - Agregar token de acceso
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de Response - Manejar errores 401 y refrescar token
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (newToken) => {
    refreshSubscribers.forEach((cb) => cb(newToken));
    refreshSubscribers = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // No es un error 401, rechazar
        if (!error.response || error.response.status !== 401) {
            return Promise.reject(error);
        }

        // Ya intentamos refrescar, no intentar de nuevo
        if (originalRequest._retry) {
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
            return Promise.reject(error);
        }

        // Marcar que ya intentamos
        originalRequest._retry = true;

        // Si ya está refrescando, esperar a que termine
        if (isRefreshing) {
            return new Promise((resolve) => {
                subscribeTokenRefresh((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    resolve(api(originalRequest));
                });
            });
        }

        // Iniciar el refresh
        isRefreshing = true;
        try {
            const newToken = await refreshAccessToken();

            if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                onRefreshed(newToken);
                isRefreshing = false;
                return api(originalRequest);
            } else {
                onRefreshed(null);
                isRefreshing = false;
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
                return Promise.reject(error);
            }
        } catch (refreshError) {
            console.error('[ApiConnection] Error refrescando token:', refreshError.message);
            onRefreshed(null);
            isRefreshing = false;
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
            return Promise.reject(refreshError);
        }
    }
);

export default api;
