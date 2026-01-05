import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderPrincipal from "../../components/layout/header";
import DraggableModal from "../../components/common/DraggableModal";
import ClientFormFields from "../../components/clients/ClientFormFields";
import ModalAlert from "../../components/common/Modal.Alet.jsx";
import { getComprasByCliente } from "../../Hook/Api/clientApi";
import { useAuth } from "../../Hook/context/AuthContext.jsx";
import { useNegocio } from "../../Hook/context/NegocioContext.jsx";
import { useClientForm } from "../../Hook/hooks/useClientForm.js";
import Loader from "../../components/common/Loader";

const InfoClient = ({ route }) => {
  const { client } = route.params;
  const { user } = useAuth();
  const { negocioActivo } = useNegocio();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [alertModal, setAlertModal] = useState({ 
    visible: false, 
    title: '', 
    message: '', 
    type: 'info', 
    onConfirm: null 
  });

  // Hook de formulario para editar cliente
  const {
    formData,
    loading: formLoading,
    handleInputChange,
    resetForm,
    loadClientData,
    saveClient,
  } = useClientForm(
    user,
    negocioActivo,
    async () => {
      // Callback de éxito
      await fetchCompras();
      setEditModalVisible(false);
      setAlertModal({
        visible: true,
        title: 'Éxito',
        message: 'Cliente actualizado con éxito.',
        type: 'success',
        onConfirm: null
      });
    },
    (error) => {
      // Callback de error
      setAlertModal({
        visible: true,
        title: 'Error',
        message: error || 'Ocurrió un error al actualizar el cliente.',
        type: 'error',
        onConfirm: null
      });
    }
  );

  const fetchCompras = async () => {
    try {
      // Validar que client existe
      if (!client || !client.id) {
        throw new Error("Cliente no válido: ID faltante");
      }

      console.log("Obteniendo compras para cliente ID:", client.id);
      const result = await getComprasByCliente(client.id);
      
      // Validar la estructura de datos recibida
      if (!result || typeof result !== 'object') {
        throw new Error("Formato de datos inválido: respuesta no es un objeto");
      }

      setData(result);
      setError(null);
    } catch (err) {
      const errorMsg = err.message || "No se pudieron cargar las compras";
      console.error("Error al cargar las compras del cliente:", {
        error: errorMsg,
        clientId: client?.id,
        fullError: err
      });
      setError(errorMsg);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompras();
  }, [client?.id]);

  // Abrir modal de edición
  const handleOpenEditModal = () => {
    loadClientData(client);
    setEditModalVisible(true);
  };

  // Guardar cambios del cliente
  const handleSaveClient = async () => {
    await saveClient(client.id);
  };

  /**
   * Renderiza cada fila de compra con validaciones defensivas
   * Espera estructura: { producto_nombre, fecha, valor_total, lote_nombre, cantidad, precio_unitario }
   */
  const renderVenta = ({ item }) => {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const productoNombre = item.producto_nombre || item.producto?.nombre || "Producto sin especificar";
    const loteName = item.lote_nombre || item.lote?.nombre || "Lote sin especificar";
    const fecha = item.fecha ? new Date(item.fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }) : "Fecha no disponible";
    const valorTotal = item.valor_total ? parseFloat(item.valor_total).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "0";
    const cantidad = item.cantidad || 0;
    const precioUnitario = item.precio_unitario ? parseFloat(item.precio_unitario).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "0";

    return (
      <View style={styles.ventaCard}>
        <View style={styles.ventaHeader}>
          <View style={styles.ventaMainInfo}>
            <Text style={styles.productoNombre} numberOfLines={2}>
              {productoNombre}
            </Text>
            <Text style={styles.fechaText}>
              {fecha}
            </Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${valorTotal}</Text>
          </View>
        </View>

        <View style={styles.ventaBody}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Lote</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{loteName}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Cantidad</Text>
              <Text style={styles.detailValue}>{cantidad} uds</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Unitario</Text>
              <Text style={styles.detailValue}>${precioUnitario}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return <Loader text="Cargando información del cliente..." />;
  }

  if (error) {
    return (
      <View style={styles.loaderContainer}>
        <Icon name="alert-circle-outline" size={48} color="#d32f2f" />
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loaderContainer}>
        <Icon name="alert-circle-outline" size={48} color="#5A6C7D" />
        <Text style={styles.errorText}>No se pudo cargar la información</Text>
      </View>
    );
  }

  // Desestructurar según la estructura correcta de la API
  // La API retorna: { message, total_gastado, cantidad_compras, compras }
  const compras = Array.isArray(data.compras) ? data.compras : [];
  const totalGastado = data.total_gastado || 0;
  const cantidadCompras = data.cantidad_compras || 0;
  
  // Obtener info del cliente del primer item o del parámetro route
  const clienteInfo = client || { nombre: "Cliente", correo: "", telefono: "", direccion: "" };

  const totalMonetario = compras.reduce(
    (sum, compra) => sum + (parseFloat(compra.valor_total) || 0),
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
              <Text style={styles.clientName}>{clienteInfo.nombre || "Cliente"}</Text>
            </View>

            {/* Botón de editar */}
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleOpenEditModal}
            >
              <Icon name="pencil" size={20} color="#0077cc" />
            </TouchableOpacity>
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
                  {clienteInfo.correo || "No registrado"}
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
                  {clienteInfo.telefono || "No registrado"}
                </Text>
              </View>
            </View>

            {clienteInfo.direccion && (
              <>
                <View style={styles.contactDivider} />
                <View style={styles.contactRow}>
                  <View style={styles.contactIconContainer}>
                    <Icon name="map-marker-outline" size={18} color="#1E3A5F" />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Dirección</Text>
                    <Text style={styles.contactValue}>{clienteInfo.direccion}</Text>
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
              <Text style={styles.statValue}>{cantidadCompras}</Text>
              <Text style={styles.statLabel}>Compras Registradas</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Icon name="currency-usd" size={22} color="#2D5F3F" />
              </View>
              <Text style={styles.statValue}>
                ${totalMonetario.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Text>
              <Text style={styles.statLabel}>Total Gastado</Text>
            </View>
          </View>
        </View>

        {/* Sales History */}
        <View style={styles.sectionContainer}>
          <View style={styles.ventasHeader}>
            <Text style={styles.sectionTitle}>Historial de Compras</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{compras.length}</Text>
            </View>
          </View>

          {compras.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="clipboard-text-outline" size={48} color="#B0BEC5" />
              <Text style={styles.emptyStateTitle}>Sin registros</Text>
              <Text style={styles.emptyStateText}>
                No hay compras registradas para este cliente
              </Text>
            </View>
          ) : (
            <FlatList
              data={compras}
              keyExtractor={(item, index) => item.venta_id?.toString() || index.toString()}
              renderItem={renderVenta}
              scrollEnabled={false}
              contentContainerStyle={styles.ventasList}
            />
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal de edición de cliente */}
      <DraggableModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          resetForm();
        }}
        title="Editar Cliente"
      >
        <ClientFormFields
          formData={formData}
          onInputChange={handleInputChange}
          disabled={formLoading}
        />

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => {
              setEditModalVisible(false);
              resetForm();
            }}
            disabled={formLoading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalButton, styles.saveButton, formLoading && styles.disabledButton]}
            onPress={handleSaveClient}
            disabled={formLoading}
          >
            {formLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>
      </DraggableModal>

      {/* Modal de alertas */}
      <ModalAlert
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ ...alertModal, visible: false })}
        onConfirm={alertModal.onConfirm}
      />
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

  editButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginLeft: 10,
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

  // Modal styles
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButton: {
    backgroundColor: "#f0f0f0",
  },

  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },

  saveButton: {
    backgroundColor: "#0077cc",
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.6,
  },
});

export default InfoClient;