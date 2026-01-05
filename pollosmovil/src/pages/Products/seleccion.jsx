import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNegocio } from "../../Hook/context/NegocioContext";
import ProductosView from "./ProductosView";
import LotesView from "./LotesView";
import HeaderPrincipal from "../../components/layout/header";

const Seleccion = ({ navigation }) => {
  const { negocioActivo } = useNegocio();
  const [vistaActiva, setVistaActiva] = useState("productos");

  return (
    <View style={styles.container}>
        <HeaderPrincipal title={negocioActivo?.nombre || "Dashboard"} />
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, vistaActiva === "productos" && styles.tabActive]}
          onPress={() => setVistaActiva("productos")}
        >
          <Icon
            name="package"
            size={20}
            color={vistaActiva === "productos" ? "#0077cc" : "#9ca3af"}
          />
          <Text
            style={[
              styles.tabLabel,
              vistaActiva === "productos" && styles.tabLabelActive,
            ]}
          >
            Productos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, vistaActiva === "lotes" && styles.tabActive]}
          onPress={() => setVistaActiva("lotes")}
        >
          <Icon
            name="list-box"
            size={20}
            color={vistaActiva === "lotes" ? "#ff6b6b" : "#9ca3af"}
          />
          <Text
            style={[
              styles.tabLabel,
              vistaActiva === "lotes" && styles.tabLabelActive,
            ]}
          >
            Lotes
          </Text>
        </TouchableOpacity>
      </View>

      {vistaActiva === "productos" && <ProductosView navigation={navigation} />}
      {vistaActiva === "lotes" && <LotesView navigation={navigation} />}
    </View>
  );
}

export default Seleccion;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#0077cc",
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9ca3af",
  },
  tabLabelActive: {
    color: "#0077cc",
    fontWeight: "700",
  },
});
