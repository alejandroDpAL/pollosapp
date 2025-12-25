
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    baseURL: 'http://192.168.100.11:3000',
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
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (!refreshToken) return Promise.reject(error);

            try {
                const res = await axios.post('http://192.168.100.11:3000/auth/refresh', {
                    refreshToken,
                });

                await AsyncStorage.setItem('accessToken', res.data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
                return api(originalRequest);
            } catch (err) {
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
