// src/navigation/RootNavigator.jsx
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../Hook/context/AuthContext.jsx';
import { useNegocio } from '../Hook/context/NegocioContext.jsx';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import SelectNegocio from '../pages/Business/SelectNegocio.jsx';

export default function RootNavigator() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const { negocioActivo, loading: negocioLoading } = useNegocio();

  // Mostrar loader mientras se restaura la sesión
  if (authLoading || negocioLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  // Si no está logueado, mostrar pantalla de login
  if (!isLoggedIn) {
    return <AuthNavigator />;
  }

  // Si está logueado pero no ha seleccionado negocio, mostrar selector
  if (!negocioActivo) {
    return <SelectNegocio />;
  }

  // Si está logueado y tiene negocio seleccionado, mostrar app principal
  return <AppNavigator />;
}
