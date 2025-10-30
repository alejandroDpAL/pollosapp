import React, { useState } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

import AuthNavigator from "./src/navigation/AuthNavigator.jsx";
import AppNavigator from "./src/navigation/AppNavigator.jsx";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
