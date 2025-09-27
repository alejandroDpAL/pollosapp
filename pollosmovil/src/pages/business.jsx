import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderPrincipal from '../components/header';
import Menu from '../components/bottom.navigation';
import Boton from '../components/bottom.plus.jsx';
/* import SearchBar from '../components/Inputsearch.jsx'; */
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get("window");
const tabs = ["todas", "realizada", "pendiente"];

const Business = () => {
  /*   const [searchText, setSearchText] = useState(''); */
  const [filter, setFilter] = useState("todas");
  const indicator = useRef(new Animated.Value(0)).current;

  const ventas = [
    { id: 1, cliente: "Pepe", producto: "Pollo", cantidad: 2, valor: 28000, fecha: "17/08/2025", estado: "realizada" },
    { id: 2, cliente: "Lucho", producto: "Pollo", cantidad: 2, valor: 28000, fecha: "17/08/2025", estado: "pendiente" },
    { id: 3, cliente: "Lucho", producto: "Pollo", cantidad: 2, valor: 28000, fecha: "17/08/2025", estado: "pendiente" },
    { id: 4, cliente: "Lucho", producto: "Pollo", cantidad: 2, valor: 28000, fecha: "17/08/2025", estado: "pendiente" },
    { id: 5, cliente: "Lucho", producto: "Pollo", cantidad: 2, valor: 28000, fecha: "17/08/2025", estado: "pendiente" },
  ];

  const filteredVentas = filter === "todas" ? ventas : ventas.filter(v => v.estado === filter);

  // mover el indicador
  const moveIndicator = (index) => {
    Animated.spring(indicator, {
      toValue: index * (width / tabs.length),
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    moveIndicator(tabs.indexOf(filter));
  }, [filter]);

  return (
    <View style={styles.container}>
      <HeaderPrincipal title="Ventas">
        {/*       <SearchBar
      Value = {searchText}
      onChangeText={setSearchText}
      /> */}
      </HeaderPrincipal>
      <View>
        <View style={styles.tabs}>
          {tabs.map((tab, index) => (
            <TouchableOpacity key={tab} style={styles.tab} onPress={() => setFilter(tab)}>
              <Text style={[styles.tabText, filter === tab && styles.tabActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.barBackground}>
          <Animated.View
            style={[
              styles.barActive,
              { width: width / tabs.length, transform: [{ translateX: indicator }] },
            ]}
          />
        </View>
      </View>

      {/* Lista de ventas */}
      <ScrollView style={styles.scroll}>
        {filteredVentas.map((venta) => (
          <View key={venta.id} style={styles.card}>
            {/* Icono estado arriba derecha */}
            <View style={styles.statusIcon}>
              {venta.estado === "realizada" ? (
                <Icon name="check-circle" size={26} color="green" />
              ) : (
                <Icon name="clock-outline" size={26} color="orange" />
              )}
            </View>

            <Text style={styles.text}>cliente: {venta.cliente}</Text>
            <Text style={styles.text}>producto: {venta.producto}</Text>
            <Text style={styles.text}>Cantidad: {venta.cantidad}</Text>
            <Text style={styles.text}>valor: $ {venta.valor}</Text>
            <Text style={styles.text}>fecha: {venta.fecha}</Text>

            <View style={styles.actions}>
              <TouchableOpacity>
                <Icon name="delete" size={26} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <Boton />
      <Menu />
    </View>
  );
};

export default Business;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff3f3ff",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    color: 'black'
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    color: "#444",
  },
  tabActive: {
    fontWeight: "bold",
    color: "#000",
  },
  barBackground: {
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 10,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  barActive: {
    height: 10,
    backgroundColor: "green",
    borderRadius: 10,
  },
  scroll: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: "#ffffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    position: "relative",
  },
  text: {
    fontSize: 18,
    marginBottom: 3,
  },
  statusIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 15,
  },
});
