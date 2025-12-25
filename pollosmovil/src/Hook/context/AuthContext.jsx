import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const login = async (data) => {
    const { user, accessToken, refreshToken } = data;

    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
    ]);

    setUser(user);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    setUser(null);
    setIsLoggedIn(false);
  };

  const restoreSession = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, login, logout, loading }}
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
