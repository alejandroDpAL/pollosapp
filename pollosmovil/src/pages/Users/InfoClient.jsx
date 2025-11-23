import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderPrincipal from "../../components/layout/header";
import { getVentasByCliente } from "../../Hook/Api/clientApi";
import Loader from "../../components/common/Loader";

const InfoClient = ({ route }) => {
  const { client } = route.params;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const result = await getVentasByCliente(client.id);
        setData(result);
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
      <View style={styles.ventaHeader}>
        <View style={styles.ventaMainInfo}>
          <Text style={styles.productoNombre}>
            {item.producto?.nombre || "Producto sin especificar"}
          </Text>
          <Text style={styles.fechaText}>
            {new Date(item.fecha).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${parseFloat(item.valor_total).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>
      </View>

      <View style={styles.ventaBody}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Lote</Text>
            <Text style={styles.detailValue}>{item.lote.nombre}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Cantidad</Text>
            <Text style={styles.detailValue}>{item.cantidad} uds</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Precio Unitario</Text>
            <Text style={styles.detailValue}>${parseFloat(item.precio_unitario).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return <Loader text="Cargando información del cliente..." />;
  }

  if (!data) {
    return (
      <View style={styles.loaderContainer}>
        <Icon name="alert-circle-outline" size={48} color="#5A6C7D" />
        <Text style={styles.errorText}>No se pudo cargar la información</Text>
      </View>
    );
  }

  const { cliente, ventas, total_ventas, vendedor } = data;

  const totalMonetario = ventas.reduce(
    (sum, venta) => sum + parseFloat(venta.valor_total),
    0
  );

  return (
    <>
      <HeaderPrincipal title="Información del Cliente" />

      <ScrollView style={styles.scrollContainer}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.avatarSection}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }}
                style={styles.avatar}
              />
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.clientName}>{cliente.nombre}</Text>
              {vendedor && (
                <View style={styles.vendedorContainer}>
                  <Icon name="account-tie" size={14} color="#5A6C7D" />
                  <Text style={styles.vendedorText}>Gestor: {vendedor.nombre}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Datos de Contacto</Text>

          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <View style={styles.contactIconContainer}>
                <Icon name="email-outline" size={18} color="#1E3A5F" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Correo Electrónico</Text>
                <Text style={styles.contactValue}>
                  {cliente.correo || "No registrado"}
                </Text>
              </View>
            </View>

            <View style={styles.contactDivider} />

            <View style={styles.contactRow}>
              <View style={styles.contactIconContainer}>
                <Icon name="phone-outline" size={18} color="#1E3A5F" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Teléfono</Text>
                <Text style={styles.contactValue}>
                  {cliente.telefono || "No registrado"}
                </Text>
              </View>
            </View>

            {cliente.direccion && (
              <>
                <View style={styles.contactDivider} />
                <View style={styles.contactRow}>
                  <View style={styles.contactIconContainer}>
                    <Icon name="map-marker-outline" size={18} color="#1E3A5F" />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Dirección</Text>
                    <Text style={styles.contactValue}>{cliente.direccion}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Resumen de Actividad</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Icon name="file-document-outline" size={22} color="#1E3A5F" />
              </View>
              <Text style={styles.statValue}>{total_ventas}</Text>
              <Text style={styles.statLabel}>Ventas Registradas</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Icon name="currency-usd" size={22} color="#2D5F3F" />
              </View>
              <Text style={styles.statValue}>
                ${totalMonetario.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={styles.statLabel}>Monto Total</Text>
            </View>
          </View>
        </View>

        {/* Sales History */}
        <View style={styles.sectionContainer}>
          <View style={styles.ventasHeader}>
            <Text style={styles.sectionTitle}>Historial de Transacciones</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{ventas.length}</Text>
            </View>
          </View>

          {ventas.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="clipboard-text-outline" size={48} color="#B0BEC5" />
              <Text style={styles.emptyStateTitle}>Sin registros</Text>
              <Text style={styles.emptyStateText}>
                No hay transacciones registradas para este cliente
              </Text>
            </View>
          ) : (
            <FlatList
              data={ventas}
              keyExtractor={(item) => item.venta_id.toString()}
              renderItem={renderVenta}
              scrollEnabled={false}
              contentContainerStyle={styles.ventasList}
            />
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  // Header Section
  headerCard: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E9F0",
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarSection: {
    marginRight: 16,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#E5E9F0",
  },

  headerInfo: {
    flex: 1,
  },

  clientName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E3A5F",
    marginBottom: 6,
  },

  vendedorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  vendedorText: {
    fontSize: 13,
    color: "#5A6C7D",
    fontWeight: "500",
  },

  // Section Container
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E3A5F",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Contact Card
  contactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E9F0",
    overflow: "hidden",
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  contactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  contactInfo: {
    flex: 1,
  },

  contactLabel: {
    fontSize: 11,
    color: "#5A6C7D",
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  contactValue: {
    fontSize: 14,
    color: "#1E3A5F",
    fontWeight: "500",
  },

  contactDivider: {
    height: 1,
    backgroundColor: "#E5E9F0",
    marginLeft: 64,
  },

  // Statistics
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E9F0",
    padding: 20,
    alignItems: "center",
  },

  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E3A5F",
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 11,
    color: "#5A6C7D",
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  // Ventas Section
  ventasHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  countBadge: {
    backgroundColor: "#1E3A5F",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  ventasList: {
    gap: 12,
  },

  ventaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E9F0",
    overflow: "hidden",
  },

  ventaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "#FAFBFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E9F0",
  },

  ventaMainInfo: {
    flex: 1,
    marginRight: 12,
  },

  productoNombre: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E3A5F",
    marginBottom: 4,
  },

  fechaText: {
    fontSize: 12,
    color: "#5A6C7D",
    fontWeight: "500",
  },

  totalContainer: {
    alignItems: "flex-end",
  },

  totalLabel: {
    fontSize: 10,
    color: "#5A6C7D",
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D5F3F",
  },

  ventaBody: {
    padding: 16,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailItem: {
    flex: 1,
    alignItems: "center",
  },

  detailDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#E5E9F0",
  },

  detailLabel: {
    fontSize: 10,
    color: "#5A6C7D",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  detailValue: {
    fontSize: 13,
    color: "#1E3A5F",
    fontWeight: "600",
  },

  // Empty State
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E9F0",
    padding: 40,
    alignItems: "center",
  },

  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A5F",
    marginTop: 16,
    marginBottom: 8,
  },

  emptyStateText: {
    fontSize: 13,
    color: "#5A6C7D",
    textAlign: "center",
    lineHeight: 20,
  },

  // Loading States
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },

  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#5A6C7D",
    fontWeight: "500",
  },

  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: "#5A6C7D",
    fontWeight: "500",
  },

  bottomSpacer: {
    height: 32,
  },
});

export default InfoClient;