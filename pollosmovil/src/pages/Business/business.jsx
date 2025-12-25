import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, ActivityIndicator, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderPrincipal from '../../components/layout/header.jsx';
import Menu from '../../components/common/bottom.navigation.jsx';
import Boton from '../../components/common/bottom.plus.jsx';
import DraggableModal from "../../components/common/DraggableModal";
import { getVentasAdmin } from '../../Hook/Api/VentasApi.js';
import { useAuth } from "../../Hook/context/AuthContext.jsx";

const { width, height } = Dimensions.get("window");
const TAB_WIDTH = 120;
const tabs = ["todas", "pendiente", "pagado", "anulado"];
const estadosDisponibles = ["pendiente", "pagado", "anulado"];

const Business = ({ navigation }) => {
  const { user } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todas");
  const [modalVisible, setModalVisible] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [modalEstadoVisible, setModalEstadoVisible] = useState(false);
  const indicator = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const tabRefs = useRef({});

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    if (!user || !user.id) {
      console.error("No hay usuario autenticado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getVentasAdmin(user.id);

      const ventasTransformadas = data.map(venta => ({
        id: venta.id,
        cliente: venta.nombre_cliente,
        producto: venta.nombre_lote,
        cantidad: venta.cantidad,
        valor: parseFloat(venta.valor_total),
        fecha: formatearFecha(venta.fecha),
        observaciones: venta.observaciones,
        estado: venta.estado || "pendiente"
      }));

      setVentas(ventasTransformadas);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  const filteredVentas = filter === "todas"
    ? ventas
    : ventas.filter(v => v.estado === filter);

  const moveIndicator = (index) => {
    Animated.spring(indicator, {
      toValue: index * TAB_WIDTH,
      useNativeDriver: false,
    }).start();

    if (scrollViewRef.current) {
      const offsetX = index * TAB_WIDTH - (width / 2) + (TAB_WIDTH / 2);
      scrollViewRef.current.scrollTo({
        x: Math.max(0, offsetX),
        animated: true
      });
    }
  };

  useEffect(() => {
    moveIndicator(tabs.indexOf(filter));
  }, [filter]);

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "realizada":
        return { name: "check-circle", color: "#10b981" };
      case "pendiente":
        return { name: "clock-outline", color: "#f59e0b" };
      case "pagado":
        return { name: "cash-check", color: "#059669" };
      case "parcial":
        return { name: "cash-minus", color: "#f97316" };
      case "anulado":
        return { name: "close-circle", color: "#ef4444" };
      default:
        return { name: "help-circle", color: "#6b7280" };
    }
  };

  const getEstadoBackground = (estado) => {
    switch (estado) {
      case "realizada":
        return "#d1fae5";
      case "pendiente":
        return "#fef3c7";
      case "pagado":
        return "#d1fae5";
      case "parcial":
        return "#fed7aa";
      case "anulado":
        return "#fee2e2";
      default:
        return "#f3f4f6";
    }
  };

  const handleVerDetalle = (venta) => {
    setVentaSeleccionada(venta);
    setModalVisible(true);
  };

  const handleCambiarEstado = async (nuevoEstado) => {
    try {
      // Aquí llamarías a tu API para actualizar el estado
      // await actualizarEstadoVenta(ventaSeleccionada.id, nuevoEstado);

      // Actualizar localmente
      setVentas(ventas.map(v =>
        v.id === ventaSeleccionada.id ? { ...v, estado: nuevoEstado } : v
      ));

      setVentaSeleccionada({ ...ventaSeleccionada, estado: nuevoEstado });
      setModalEstadoVisible(false);
      Alert.alert("Éxito", "Estado actualizado correctamente");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el estado");
      console.error(error);
    }
  };

  const handleEliminar = () => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que deseas eliminar esta venta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // Aquí llamarías a tu API para eliminar
              // await eliminarVenta(ventaSeleccionada.id);

              setVentas(ventas.filter(v => v.id !== ventaSeleccionada.id));
              setModalVisible(false);
              Alert.alert("Éxito", "Venta eliminada correctamente");
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar la venta");
              console.error(error);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <HeaderPrincipal title="Ventas" />

      <View style={styles.tabsContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScrollView}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => setFilter(tab)}
              ref={ref => tabRefs.current[index] = ref}
            >
              <Text style={[styles.tabText, filter === tab && styles.tabActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.barContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={styles.barContent}
          >
            <Animated.View
              style={[
                styles.barActive,
                {
                  width: TAB_WIDTH,
                  transform: [{ translateX: indicator }]
                },
              ]}
            />
          </ScrollView>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0077cc" />
          <Text style={styles.loadingText}>Cargando ventas...</Text>
        </View>
      ) : filteredVentas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="cart-off" size={64} color="#9ca3af" />
          <Text style={styles.emptyText}>No hay ventas {filter !== "todas" ? filter + "s" : ""}</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {filteredVentas.map((venta) => (
            <TouchableOpacity
              key={venta.id}
              style={styles.card}
              onPress={() => handleVerDetalle(venta)}
              activeOpacity={0.7}
            >
              {/* Badge de estado */}
              <View style={[styles.estadoBadge, { backgroundColor: getEstadoBackground(venta.estado) }]}>
                <Icon
                  name={getEstadoIcon(venta.estado).name}
                  size={16}
                  color={getEstadoIcon(venta.estado).color}
                />
                <Text style={[styles.estadoBadgeText, { color: getEstadoIcon(venta.estado).color }]}>
                  {venta.estado}
                </Text>
              </View>

              {/* Contenido principal */}
              <View style={styles.cardHeader}>
                <View style={styles.clienteContainer}>
                  <Icon name="account" size={20} color="#6b7280" />
                  <Text style={styles.clienteText}>{venta.cliente}</Text>
                </View>
                <Text style={styles.fechaText}>{venta.fecha}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Icon name="package-variant" size={18} color="#6b7280" />
                  <Text style={styles.infoLabel}>Producto:</Text>
                  <Text style={styles.infoValue}>{venta.producto}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="numeric" size={18} color="#6b7280" />
                  <Text style={styles.infoLabel}>Cantidad:</Text>
                  <Text style={styles.infoValue}>{venta.cantidad}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="cash" size={18} color="#6b7280" />
                  <Text style={styles.infoLabel}>Total:</Text>
                  <Text style={styles.valorText}>$ {venta.valor.toLocaleString('es-CO')}</Text>
                </View>
              </View>

              {/* Flecha indicadora */}
              <View style={styles.footerCard}>
                <Text style={styles.verMasText}>Ver detalles</Text>
                <Icon name="chevron-right" size={20} color="#0077cc" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Boton />

      {/* Modal de Detalles con DraggableModal */}
      <DraggableModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Detalle de Venta"
        initialHeight={0.6}
        minHeight={0.3}
        maxHeight={0.95}
      >
        {ventaSeleccionada && (
          <>
            {/* Estado actual */}
            <View style={[styles.estadoCard, { backgroundColor: getEstadoBackground(ventaSeleccionada.estado) }]}>
              <Icon
                name={getEstadoIcon(ventaSeleccionada.estado).name}
                size={28}
                color={getEstadoIcon(ventaSeleccionada.estado).color}
              />
              <View style={styles.estadoCardInfo}>
                <Text style={styles.estadoCardLabel}>Estado actual</Text>
                <Text style={[styles.estadoCardText, { color: getEstadoIcon(ventaSeleccionada.estado).color }]}>
                  {ventaSeleccionada.estado.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Información del cliente */}
            <View style={styles.modalSection}>
              <View style={styles.modalInfoRow}>
                <Icon name="account" size={20} color="#6b7280" />
                <View style={styles.modalInfoContent}>
                  <Text style={styles.modalLabel}>Cliente</Text>
                  <Text style={styles.modalValue}>{ventaSeleccionada.cliente}</Text>
                </View>
              </View>

              <View style={styles.modalInfoRow}>
                <Icon name="calendar" size={20} color="#6b7280" />
                <View style={styles.modalInfoContent}>
                  <Text style={styles.modalLabel}>Fecha</Text>
                  <Text style={styles.modalValue}>{ventaSeleccionada.fecha}</Text>
                </View>
              </View>

              <View style={styles.modalInfoRow}>
                <Icon name="package-variant" size={20} color="#6b7280" />
                <View style={styles.modalInfoContent}>
                  <Text style={styles.modalLabel}>Producto</Text>
                  <Text style={styles.modalValue}>{ventaSeleccionada.producto}</Text>
                </View>
              </View>

              <View style={styles.modalInfoRow}>
                <Icon name="numeric" size={20} color="#6b7280" />
                <View style={styles.modalInfoContent}>
                  <Text style={styles.modalLabel}>Cantidad</Text>
                  <Text style={styles.modalValue}>{ventaSeleccionada.cantidad}</Text>
                </View>
              </View>

              <View style={styles.modalInfoRow}>
                <Icon name="cash-multiple" size={20} color="#0077cc" />
                <View style={styles.modalInfoContent}>
                  <Text style={styles.modalLabel}>Valor Total</Text>
                  <Text style={styles.modalValueDestacado}>
                    $ {ventaSeleccionada.valor.toLocaleString('es-CO')}
                  </Text>
                </View>
              </View>

              {ventaSeleccionada.observaciones && (
                <View style={styles.observacionesContainer}>
                  <Icon name="note-text" size={20} color="#6b7280" />
                  <View style={styles.modalInfoContent}>
                    <Text style={styles.modalLabel}>Observaciones</Text>
                    <Text style={styles.observacionesModal}>{ventaSeleccionada.observaciones}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Botones de acción */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnCambiarEstado}
                onPress={() => setModalEstadoVisible(true)}
              >
                <Icon name="swap-horizontal" size={20} color="#fff" />
                <Text style={styles.btnText}>Cambiar Estado</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnEliminar}
                onPress={handleEliminar}
              >
                <Icon name="delete" size={20} color="#fff" />
                <Text style={styles.btnText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </DraggableModal>

      {/* Modal para cambiar estado */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalEstadoVisible}
        onRequestClose={() => setModalEstadoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalEstadoContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambiar Estado</Text>
              <TouchableOpacity onPress={() => setModalEstadoVisible(false)}>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.estadosList}>
              {estadosDisponibles.map((estado) => (
                <TouchableOpacity
                  key={estado}
                  style={[
                    styles.estadoOption,
                    ventaSeleccionada?.estado === estado && styles.estadoOptionActive
                  ]}
                  onPress={() => handleCambiarEstado(estado)}
                >
                  <Icon
                    name={getEstadoIcon(estado).name}
                    size={24}
                    color={getEstadoIcon(estado).color}
                  />
                  <Text style={[
                    styles.estadoOptionText,
                    ventaSeleccionada?.estado === estado && styles.estadoOptionTextActive
                  ]}>
                    {estado}
                  </Text>
                  {ventaSeleccionada?.estado === estado && (
                    <Icon name="check" size={20} color="#0077cc" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Business;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  tabsContainer: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e6eb",
    elevation: 2,
  },
  tabsScrollView: {
    paddingVertical: 10,
  },
  tabsContent: {
    paddingHorizontal: 10,
  },
  tab: {
    width: TAB_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabText: {
    fontSize: 15,
    color: "#6b7280",
    textTransform: "capitalize",
    fontWeight: "500",
  },
  tabActive: {
    color: "#0077cc",
    fontWeight: "700",
  },
  barContainer: {
    height: 6,
    backgroundColor: "#d1d5db",
    overflow: "hidden",
  },
  barContent: {
    height: 6,
  },
  barActive: {
    height: 6,
    backgroundColor: "#0077cc",
    borderRadius: 3,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  estadoBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  estadoBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  cardHeader: {
    marginBottom: 12,
  },
  clienteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  clienteText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    textTransform: "capitalize",
  },
  fechaText: {
    fontSize: 13,
    color: "#9ca3af",
    marginLeft: 28,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },
  cardBody: {
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    minWidth: 70,
  },
  infoValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    textTransform: "capitalize",
    flex: 1,
  },
  valorText: {
    fontSize: 16,
    color: "#0077cc",
    fontWeight: "700",
    flex: 1,
  },
  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 4,
  },
  verMasText: {
    fontSize: 14,
    color: "#0077cc",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
  },
  estadoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  estadoCardInfo: {
    flex: 1,
  },
  estadoCardLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  estadoCardText: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalSection: {
    gap: 16,
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalInfoContent: {
    flex: 1,
  },
  modalLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  modalValueDestacado: {
    fontSize: 20,
    color: "#0077cc",
    fontWeight: "700",
  },
  observacionesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
  },
  observacionesModal: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  modalActions: {
    marginTop: 20,
    gap: 12,
  },
  btnCambiarEstado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0077cc",
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  btnEliminar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalEstadoContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  estadosList: {
    padding: 20,
  },
  estadoOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#f9fafb",
    gap: 12,
  },
  estadoOptionActive: {
    backgroundColor: "#eff6ff",
    borderWidth: 2,
    borderColor: "#0077cc",
  },
  estadoOptionText: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  estadoOptionTextActive: {
    color: "#0077cc",
    fontWeight: "700",
  },
});