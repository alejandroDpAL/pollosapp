// App.js
import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

import { AuthProvider } from "./src/Hook/context/AuthContext.jsx";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1 }}>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </AuthProvider>
    </SafeAreaProvider>
  );
}