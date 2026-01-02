import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshAccessToken, isTokenExpiringSoon } from '../Api/tokenRefresh.js';

const AuthContext = createContext();

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionClosedMessage, setSessionClosedMessage] = useState(null);
  const tokenRefreshTimerRef = useRef(null);

  const login = async (data) => {
    const { user, accessToken, refreshToken } = data;

    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ]);

    setUser(user);
    setIsLoggedIn(true);
    
    // Iniciar el temporizador de refresh de token
    startTokenRefreshTimer(accessToken);
  };

  /**
   * Inicia un temporizador para refrescar el token antes de que expire
   */
  const startTokenRefreshTimer = (accessToken) => {
    // Limpiar timer anterior si existe
    if (tokenRefreshTimerRef.current) {
      clearTimeout(tokenRefreshTimerRef.current);
    }

    try {
      // Calcular tiempo hasta expiración
      const tokenParts = accessToken.split('.');
      if (tokenParts.length !== 3) return;

      const decoded = JSON.parse(atob(tokenParts[1]));
      const expiresIn = decoded.exp * 1000 - Date.now(); // ms
      
      // Refrescar 5 minutos antes de que expire
      const refreshTime = Math.max(expiresIn - (5 * 60 * 1000), 10000);
      

      tokenRefreshTimerRef.current = setTimeout(() => {
        performTokenRefresh();
      }, refreshTime);
    } catch (error) {
      console.error('[AuthContext] Error iniciando timer de refresh:', error.message);
    }
  };

  /**
   * Ejecuta el refresh del token
   */
  const performTokenRefresh = async () => {
    try {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Reiniciar el timer con el nuevo token
        startTokenRefreshTimer(newToken);
      } else {
        await forceLogoutWithMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
    } catch (error) {
      console.error('[AuthContext] Error en refresh automático:', error.message);
    }
  };

  const logout = async () => {
    // Limpiar timer de refresh
    if (tokenRefreshTimerRef.current) {
      clearTimeout(tokenRefreshTimerRef.current);
    }
    
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    setUser(null);
    setIsLoggedIn(false);
  };

  const forceLogoutWithMessage = async (message = 'Tu sesión ha sido cerrada. Vuelve a iniciar sesión.') => {
    await logout();
    setSessionClosedMessage(message);
  };

  const clearSessionMessage = () => setSessionClosedMessage(null);

  const restoreSession = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const userData = await AsyncStorage.getItem('user');

      if (accessToken && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
        
        // Iniciar el timer de refresh para la sesión restaurada
        startTokenRefreshTimer(accessToken);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('[AuthContext] Error restaurando sesión:', error.message);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();

    // Limpiar timer cuando se desmonta el componente
    return () => {
      if (tokenRefreshTimerRef.current) {
        clearTimeout(tokenRefreshTimerRef.current);
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        logout,
        loading,
        sessionClosedMessage,
        clearSessionMessage,
        forceLogoutWithMessage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
