import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderPrincipal from '../../components/layout/header.jsx';
import Menu from '../../components/common/bottom.navigation.jsx';
import Boton from '../../components/common/bottom.plus.jsx';


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

    </View>

  );
};

export default Business;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },


  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e6eb",
    elevation: 2,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 15,
    color: "#6b7280",
    textTransform: "capitalize",
  },
  tabActive: {
    color: "#0077cc",
    fontWeight: "700",
  },
  barBackground: {
    height: 6,
    backgroundColor: "#d1d5db",
    borderRadius: 10,
    marginHorizontal: 18,
    overflow: "hidden",
  },
  barActive: {
    height: 6,
    backgroundColor: "#0077cc",
    borderRadius: 10,
  },


  scroll: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },


  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#0077cc",
  },

  text: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 4,
    textTransform: "capitalize",
  },

  statusIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 18,
  },


  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0077cc",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
});

