import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.100.11:3000';


export const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return null;
    }


    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      {
        timeout: 10000,
      }
    );

    if (response.data.accessToken) {
      
      // Guardar el nuevo token
      await AsyncStorage.setItem('accessToken', response.data.accessToken);
      
      // Si el backend retorna un nuevo refresh token, actualizarlo también
      if (response.data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return response.data.accessToken;
    }
  } catch (error) {
    console.error('[TokenRefresh] Error al refrescar token:', error.message);
    
    // Si el refresh token es inválido, es posible que la sesión se haya cerrado en otro dispositivo
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      return null;
    }
    
    return null;
  }
};


export const getValidToken = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    
    if (!accessToken) {
      return null;
    }

    // Intentar refrescar el token
    const newToken = await refreshAccessToken();
    return newToken || accessToken;
  } catch (error) {
    console.error('[TokenRefresh] Error obteniendo token válido:', error.message);
    return null;
  }
};


export const decodeToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (error) {
    console.error('[TokenRefresh] Error decodificando token:', error.message);
    return null;
  }
};


export const isTokenExpiringSoon = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const expiresIn = decoded.exp * 1000 - Date.now(); // ms
    const fiveMinutesInMs = 5 * 60 * 1000;

    return expiresIn < fiveMinutesInMs;
  } catch (error) {
    return true;
  }
};
