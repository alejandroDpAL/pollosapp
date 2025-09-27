import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Menu from './src/components/bottom.navigation.jsx';
import HeaderPrincipal from './src/components/header.jsx';

// Pantallas
import negocios from './src/pages/business.jsx';
import estadisticas from './src/pages/estadisticas.jsx';
import ajustes from './src/pages/ajustes.jsx';
import productos from './src/pages/productos.jsx';
import clientes from './src/pages/clientes.jsx';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Perfil from './src/pages/Perfil.jsx';
import Modal from './src/components/Modal.componet.jsx';
import Dashboard from './src/pages/Dashboard.jsx';




// Stack Navigator
const Stack = createNativeStackNavigator()

const App = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ec0202c5" }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="app" component={Dashboard} />
          <Stack.Screen name="negocios" component={negocios} />
          <Stack.Screen name="estadisticas" component={estadisticas} />
          <Stack.Screen name="ajustes" component={ajustes} />
          <Stack.Screen name="productos" component={productos} />
          <Stack.Screen name="clientes" component={clientes} />
         <Stack.Screen name="Perfil" component={Perfil} />
         <Stack.Screen name="Modal" component={Modal} />
        </Stack.Navigator>
      </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;


