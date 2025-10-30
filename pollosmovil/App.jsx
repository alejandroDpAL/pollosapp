// App.js
import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

import { AuthProvider, useAuth } from "./src/Hook/context/AuthContext";
import AuthNavigator from "./src/navigation/AuthNavigator.jsx";
import AppNavigator from "./src/navigation/AppNavigator.jsx";

// Componente interno que usa el contexto
function AppContent() {
  const { isLoggedIn } = useAuth();

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          {!isLoggedIn ? (
            <AuthNavigator onLoginSuccess={() => setIsLoggedIn(true)} /> 
          ) : ( 
            <AppNavigator />
          )}
        </NavigationContainer>
@
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Componente principal que provee el contexto
export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1 }}>
          <AppContent />
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}