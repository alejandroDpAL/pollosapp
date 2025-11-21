import React from "react";
import { View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Dashboard from "../pages/Business/Dashboard";
import Estadisticas from "../pages/Statistics/estadisticas.jsx";
import Ajustes from "../pages/Settings/ajustes";
import Productos from "../pages/Products/productos";
import Perfil from "../pages/Users/Perfil";
import Modal from "../components/common/Modal.componet";
import clientes from "../pages/Users/clientes.jsx";
import negocios from "../pages/Business/business";
import Menu from "../components/common/bottom.navigation.jsx";
import { StatusBar } from "react-native/types_generated/index";
import InfoClient from "../pages/Users/InfoClient.jsx";

// Pages


const Stack = createNativeStackNavigator();
const MENU_HEIGHT = 62;

export default function AppNavigator({ navigationRef, currentRoute }) {
    //  <StatusBar
    //     translucent={false}
    //     backgroundColor="#ffffff"
    //     barStyle="dark-content"
    //   />

    return (
        <View style={{ flex: 1, paddingBottom: MENU_HEIGHT }}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="home" component={Dashboard} />
                <Stack.Screen name="negocios" component={negocios} />
                <Stack.Screen name="estadisticas" component={Estadisticas} />
                <Stack.Screen name="ajustes" component={Ajustes} />
                <Stack.Screen name="productos" component={Productos} />
                <Stack.Screen name="clientes" component={clientes} />
                <Stack.Screen name="Perfil" component={Perfil} />
                <Stack.Screen name="modal" component={Modal} />
                <Stack.Screen name="infoclient" component={InfoClient} />

            </Stack.Navigator>

            <Menu
                navigationRef={navigationRef}
                currentRouteName={currentRoute}
                height={MENU_HEIGHT}
            />
        </View>
    );
}
