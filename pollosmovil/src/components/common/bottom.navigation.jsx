import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

const Menu = () => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState("home");

  const handlePress = (route, name) => {
    setSelected(name);
    navigation.navigate(route);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.iconWrapper, selected === "home" && styles.active]}
        onPress={() => handlePress("home")}
      >
        <Icon
          name="home-outline"
          size={24} // 🔹 más pequeño
          color={selected === "home" ? "#000" : "#fff"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.iconWrapper, selected === "store" && styles.active]}
        onPress={() => handlePress("negocios", "store")}
      >
        <Icon
          name="store-outline"
          size={24}
          color={selected === "store" ? "#000" : "#fff"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.iconWrapper, selected === "char" && styles.active]}
        onPress={() => handlePress("estadisticas", "char")}
      >
        <Icon
          name="chart-bar"
          size={24}
          color={selected === "char" ? "#000" : "#fff"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.iconWrapper, selected === "cog" && styles.active]}
        onPress={() => handlePress("ajustes", "cog")}
      >
        <Icon
          name="cog"
          size={24}
          color={selected === "cog" ? "#000" : "#fff"}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#552525ff",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#fff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  iconWrapper: {
    padding: 6, // 🔹 menos padding
    borderRadius: 20, // 🔹 círculo más pequeño
  },
  active: {
    backgroundColor: "rgba(255,255,255,0.25)", // círculo de selección
  },
});

export default Menu;
