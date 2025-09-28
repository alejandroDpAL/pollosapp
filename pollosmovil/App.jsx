import React, { useState } from "react";
import { View, SafeAreaView } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Menu from "./src/components/bottom.navigation.jsx"; 
import Dashboard from "./src/pages/Dashboard.jsx";
import negocios from "./src/pages/business.jsx";
import estadisticas from "./src/pages/estadisticas.jsx";
import ajustes from "./src/pages/ajustes.jsx";
import productos from "./src/pages/productos.jsx";
import clientes from "./src/pages/clientes.jsx";
import Perfil from "./src/pages/Perfil.jsx";
import Modal from "./src/components/Modal.componet.jsx";

const Stack = createNativeStackNavigator();

// Referencia de navegación para controlar la navegación fuera de los componentes
const navigationRef = createNavigationContainerRef();

const MENU_HEIGHT = 62; // ajusta el tamaño

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(null);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            const r = navigationRef.getCurrentRoute();
            setCurrentRoute(r ? r.name : null);
          }}
          onStateChange={() => {
            const r = navigationRef.getCurrentRoute();
            setCurrentRoute(r ? r.name : null);
          }}
        >
          {/* Layout: la vista de navegación reserva espacio inferior para el menú */}
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, paddingBottom: MENU_HEIGHT }}>
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
            </View>

            {/* Menú. Se monta sola desde el layout */}
            <Menu
              navigationRef={navigationRef}
              currentRouteName={currentRoute}
              height={MENU_HEIGHT}
            />
          </View>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
