import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../pages/Auth/Login.jsx";

const Stack = createNativeStackNavigator();

export default function AuthNavigator({ onLoginSuccess }) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login">
                {() => <Login onLoginSuccess={onLoginSuccess} />}
            </Stack.Screen>
        </Stack.Navigator>
    );
}
