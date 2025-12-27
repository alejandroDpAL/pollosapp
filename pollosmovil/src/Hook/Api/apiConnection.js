
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveTokens, getAccessToken, getRefreshToken, clearTokens } from '../../services/storageService.jsx';

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
    const token = await getAccessToken();
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

        
        if (!error.response || error.response.status !== 401) {
            return Promise.reject(error);
        }

       
        if (originalRequest._retry) {
            return Promise.reject(error);
        }
        originalRequest._retry = true;

        // Intentar refrescar el token de forma coordinada
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
            await clearTokens();
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // Esperar a que termine el refresh en curso
            return new Promise((resolve) => {
                subscribeTokenRefresh((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    resolve(api(originalRequest));
                });
            });
        }

        isRefreshing = true;
        try {
            const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
            const newAccess = res?.data?.accessToken;

            if (!newAccess) {
                throw new Error('No se recibió nuevo access token');
            }

            await saveTokens(newAccess, refreshToken);
            onRefreshed(newAccess);
            isRefreshing = false;

            // Reintentar la petición original con el nuevo token
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return api(originalRequest);
        } catch (refreshErr) {
            isRefreshing = false;
            await clearTokens();
            return Promise.reject(refreshErr);
        }
    }
);

export default api;
