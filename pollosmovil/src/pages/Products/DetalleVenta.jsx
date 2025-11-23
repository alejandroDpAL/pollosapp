import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const estadosDisponibles = ["pendiente", "realizada", "pagado", "parcial", "anulado"];

const DetalleVenta = ({ route, navigation }) => {
  const { venta } = route.params;
  const [estadoActual, setEstadoActual] = useState(venta.estado);
  const [modalVisible, setModalVisible] = useState(false);

  const getEstadoIcon = (estado) => {
    switch(estado) {
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
    switch(estado) {
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

  const handleCambiarEstado = async (nuevoEstado) => {
    try {
      // Aquí llamarías a tu API para actualizar el estado
      // await actualizarEstadoVenta(venta.id, nuevoEstado);
      
      setEstadoActual(nuevoEstado);
      setModalVisible(false);
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
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // Aquí llamarías a tu API para eliminar
              // await eliminarVenta(venta.id);
              
              Alert.alert("Éxito", "Venta eliminada correctamente", [
                { text: "OK", onPress: () => navigation.goBack() }
              ]);
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
      {/* Header personalizado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Venta</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Card principal */}
        <View style={styles.mainCard}>
          {/* Estado actual */}
          <View style={[styles.estadoBanner, { backgroundColor: getEstadoBackground(estadoActual) }]}>
            <Icon 
              name={getEstadoIcon(estadoActual).name} 
              size={32} 
              color={getEstadoIcon(estadoActual).color} 
            />
            <View style={styles.estadoInfo}>
              <Text style={styles.estadoLabel}>Estado</Text>
              <Text style={[styles.estadoText, { color: getEstadoIcon(estadoActual).color }]}>
                {estadoActual.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Información del cliente */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <View style={styles.infoBox}>
              <Icon name="account" size={24} color="#0077cc" />
              <Text style={styles.infoBoxText}>{venta.cliente}</Text>
            </View>
          </View>

          {/* Información del producto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Producto</Text>
            <View style={styles.infoRow}>
              <Icon name="package-variant" size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nombre</Text>
                <Text style={styles.infoValue}>{venta.producto}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon name="numeric" size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Cantidad</Text>
                <Text style={styles.infoValue}>{venta.cantidad}</Text>
              </View>
            </View>
          </View>

          {/* Información financiera */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Financiera</Text>
            <View style={styles.valorCard}>
              <Icon name="cash-multiple" size={28} color="#0077cc" />
              <View style={styles.valorInfo}>
                <Text style={styles.valorLabel}>Valor Total</Text>
                <Text style={styles.valorText}>$ {venta.valor.toLocaleString('es-CO')}</Text>
              </View>
            </View>
          </View>

          {/* Fecha */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fecha de Venta</Text>
            <View style={styles.infoBox}>
              <Icon name="calendar" size={24} color="#6b7280" />
              <Text style={styles.infoBoxText}>{venta.fecha}</Text>
            </View>
          </View>

          {/* Observaciones */}
          {venta.observaciones && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Observaciones</Text>
              <View style={styles.observacionesBox}>
                <Icon name="note-text" size={20} color="#6b7280" />
                <Text style={styles.observacionesText}>{venta.observaciones}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.btnCambiarEstado}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="swap-horizontal" size={20} color="#fff" />
            <Text style={styles.btnText}>Cambiar Estado</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnEliminar}
            onPress={handleEliminar}
          >
            <Icon name="delete" size={20} color="#fff" />
            <Text style={styles.btnText}>Eliminar Venta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal para cambiar estado */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambiar Estado</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.estadosList}>
              {estadosDisponibles.map((estado) => (
                <TouchableOpacity
                  key={estado}
                  style={[
                    styles.estadoOption,
                    estadoActual === estado && styles.estadoOptionActive
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
                    estadoActual === estado && styles.estadoOptionTextActive
                  ]}>
                    {estado}
                  </Text>
                  {estadoActual === estado && (
                    <Icon name="check" size={20} color="#0077cc" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DetalleVenta;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  placeholder: {
    width: 40,
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  estadoBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  estadoInfo: {
    flex: 1,
  },
  estadoLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  estadoText: {
    fontSize: 20,
    fontWeight: "700",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoBoxText: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  valorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    padding: 20,
    borderRadius: 12,
    gap: 16,
  },
  valorInfo: {
    flex: 1,
  },
  valorLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  valorText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0077cc",
  },
  observacionesBox: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  observacionesText: {
    flex: 1,
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  btnCambiarEstado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0077cc",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
  },
  btnEliminar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
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
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
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
    padding: 16,
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