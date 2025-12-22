// Loader.jsx
import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

const Loader = ({ text = "Cargando..." }) => {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#1E3A5F" />
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#1E3A5F",
  },
});

export default Loader;
