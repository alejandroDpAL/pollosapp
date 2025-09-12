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


const Dashboard = () => {
  return (
    <View style={styles.completa}>
      {/* principal */}
      <HeaderPrincipal title={"Asogasinga"}/>
      <View style={styles.content}>
        <View style={styles.contentGrafic}></View>

        <View style={styles.contentDivs}>
          <View style={styles.cartas}>
            <View style={[styles.contenedorIcono, { backgroundColor: '#dceafe' }]} >
              <Icon name='account-outline' size={30} color='#2d77ff' />
            </View>
            <Text style={styles.Cardtittle}>Clientes</Text>
            <Text style={styles.CardNumber}>200</Text>
          </View>

          <View style={styles.cartas}>
            <View style={[styles.contenedorIcono, { backgroundColor: '#fdecc8' }]} >
              <Icon name='storefront-outline' size={30} color='#f2a600' />
            </View>
            <Text style={styles.Cardtittle}>Ventas</Text>
            <Text style={styles.CardNumber}>65</Text>
          </View>

          <View style={styles.cartas}>
            <View style={[styles.contenedorIcono, { backgroundColor: '#e5dbff' }]} >
              <Icon name='currency-usd' size={30} color='#4b0082' />
            </View>
            <Text style={styles.Cardtittle}>Costos</Text>
            <Text style={styles.CardNumber}>6500</Text>
          </View>

          <View style={styles.cartas}>
            <View style={[styles.contenedorIcono, { backgroundColor: '#e0f7e9' }]} >
              <Icon name='cube-outline' size={30} color='#2e7d32' />
            </View>
            <Text style={styles.Cardtittle}>Productos</Text>
            <Text style={styles.CardNumber}>2</Text>
          </View>
        </View>
        <Menu />
      </View>
    </View>
  );
};

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
        </Stack.Navigator>
      </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  SafeArea: {
    flex: 1,
    backgroundColor: "#ff00008a"
  },
  completa: {
    flex: 1,
    backgroundColor: '#fff3f3ff',
  },
  content: {
    flex: 1,
    padding: 30,
  },
  tittle: {
    fontSize: 30,
    fontWeight: 'bold',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  contentGrafic: {
    marginTop: 20,
    height: '50%',
    backgroundColor: '#fdd8d8ff',
    borderRadius: 40,
  },
  contentDivs: {
    paddingTop: 30,
    justifyContent: 'space-between',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cartas: {
    backgroundColor: '#f9f9f9',
    width: '47%',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.01,
    shadowRadius: 5,
    elevation: 5,
  },
  contenedorIcono: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
    borderRadius: 20,
    marginBottom: 10,
  },
  Cardtittle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  CardNumber: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
