// src/navigation/RootNavigator.jsx
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../Hook/context/AuthContext.jsx';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

export default function RootNavigator() {
  const { isLoggedIn, loading } = useAuth();

  // Mostrar loader mientras se restaura la sesión
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  // Decidir qué navegador mostrar según el estado de autenticación
  return isLoggedIn ? <AppNavigator /> : <AuthNavigator />;
}
