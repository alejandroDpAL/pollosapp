import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator } from "react-native";
import HeaderPrincipal from "../../components/layout/header";
import { getVentasByCliente } from "../../Hook/Api/clientApi";

const InfoClient = ({ route }) => {
  const { client } = route.params;
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const data = await getVentasByCliente(client.id);
        setVentas(data);
      } catch (error) {
        console.error("Error al cargar las ventas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVentas();
  }, [client.id]);

  const renderVenta = ({ item }) => (
    <View style={styles.ventaCard}>
      <Text style={styles.ventaTitulo}>🧾 Venta #{item.id}</Text>
      <Text style={styles.ventaDetalle}>Lote: {item.nombre_lote}</Text>
      <Text style={styles.ventaDetalle}>Cantidad: {item.cantidad}</Text>
      <Text style={styles.ventaDetalle}>Total: ${item.valor_total}</Text>
      <Text style={styles.ventaDetalle}>
        Fecha: {new Date(item.fecha).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <>
      <HeaderPrincipal title="Cliente" />

      <View style={styles.container}>
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{client.nombre}</Text>
        <Text style={styles.info}>📧 {client.correo || "Sin correo"}</Text>
        <Text style={styles.info}>📞 {client.telefono}</Text>
        <Text style={styles.info}>🏠 {client.direccion || "Sin dirección"}</Text>

        <Text style={styles.sectionTitle}>Ventas realizadas</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
        ) : ventas.length === 0 ? (
          <Text style={styles.emptyText}>No hay ventas registradas para este cliente.</Text>
        ) : (
          <FlatList
            data={ventas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderVenta}
            contentContainerStyle={styles.ventasList}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 30,
    backgroundColor: "#f4f6f8",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 5,
  },
  info: {
    fontSize: 16,
    color: "#555",
    marginBottom: 3,
  },
  sectionTitle: {
    marginTop: 25,
    fontSize: 18,
    fontWeight: "700",
    color: "#007bff",
  },
  ventasList: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  ventaCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    width: 320,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ventaTitulo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  ventaDetalle: {
    fontSize: 14,
    color: "#4b5563",
  },
  emptyText: {
    marginTop: 20,
    fontSize: 15,
    color: "#6b7280",
  },
});

export default InfoClient;
