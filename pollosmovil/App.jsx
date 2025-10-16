import React, { useState } from "react";
import { View, StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
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
import Ventas from "./src/pages/Ventas.jsx";

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();
const MENU_HEIGHT = 62;

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(null);

  return (
    <SafeAreaProvider>

      <StatusBar
        translucent={false}
        backgroundColor="#ffffff"
        barStyle="dark-content"
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => setCurrentRoute(navigationRef.getCurrentRoute()?.name)}
          onStateChange={() => setCurrentRoute(navigationRef.getCurrentRoute()?.name)}
        >
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
              <Stack.Screen name="Ventas" component={Ventas} />
            </Stack.Navigator>

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
