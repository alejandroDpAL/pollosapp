import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import HeaderPrincipal from "../../components/layout/header";
import DraggableModal from "../../components/common/DraggableModal";
import ClientFormFields from "../../components/clients/ClientFormFields";
import ModalAlert from "../../components/common/Modal.Alet.jsx";
import { getClientById, deleteClient } from "../../Hook/Api/clientApi";
import { useAuth } from "../../Hook/context/AuthContext.jsx";
import { useNegocio } from "../../Hook/context/NegocioContext.jsx";
import { useNavigation } from "@react-navigation/native";
import { useClientForm } from "../../Hook/hooks/useClientForm.js";

const Clients = () => {
  const { user } = useAuth();
  const { negocioActivo } = useNegocio();
  const navigation = useNavigation();
  
  const [clients, setClients] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [alertModal, setAlertModal] = useState({ 
    visible: false, 
    title: '', 
    message: '', 
    type: 'info', 
    onConfirm: null 
  });
  const [loading, setLoading] = useState(false);

  // Usar el hook personalizado para el formulario
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
      // Callback de éxito: recargar clientes y cerrar modal
      await fetchClients();
      setModalVisible(false);
      setIsEditing(false);
      setSelectedClient(null);
      setAlertModal({
        visible: true,
        title: 'Éxito',
        message: isEditing ? 'Cliente actualizado con éxito.' : 'Cliente registrado con éxito.',
        type: 'success',
        onConfirm: null
      });
    },
    (error) => {
      // Callback de error
      setAlertModal({
        visible: true,
        title: 'Error',
        message: error || 'Ocurrió un error al guardar el cliente.',
        type: 'error',
        onConfirm: null
      });
    }
  );

  // Obtener clientes del usuario y negocio activo
  const fetchClients = async () => {
    if (!user || !user.id || !negocioActivo || !negocioActivo.id) {
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'Debes seleccionar un negocio primero.',
        type: 'error',
        onConfirm: null
      });
      return;
    }

    try {
      setLoading(true);
      const data = await getClientById(user.id, negocioActivo.id);
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener los clientes:", err);
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'No se pudieron cargar los clientes. Intenta nuevamente.',
        type: 'error',
        onConfirm: null
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user, negocioActivo]);

  // Abrir modal para nuevo cliente
  const handleOpenAddModal = () => {
    resetForm();
    setIsEditing(false);
    setSelectedClient(null);
    setModalVisible(true);
  };

  // Abrir modal para editar cliente
  const handleOpenEditModal = (client) => {
    setSelectedClient(client);
    setIsEditing(true);
    loadClientData(client);
    setModalVisible(true);
  };

  // Guardar cliente (crear o actualizar)
  const handleSaveClient = async () => {
    const clientId = isEditing && selectedClient ? selectedClient.id : null;
    await saveClient(clientId);
  };

  // Eliminar cliente con confirmación
  const handleDeleteClient = (client) => {
    setAlertModal({
      visible: true,
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar a ${client.nombre}?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await deleteClient(client.id);
          await fetchClients();
          setAlertModal({
            visible: true,
            title: 'Éxito',
            message: 'Cliente eliminado correctamente.',
            type: 'success',
            onConfirm: null
          });
        } catch (error) {
          console.error("Error al eliminar cliente:", error);
          setAlertModal({
            visible: true,
            title: 'Error',
            message: 'No se pudo eliminar el cliente. Intenta nuevamente.',
            type: 'error',
            onConfirm: null
          });
        }
      }
    });
  };

  // Navegar a los detalles del cliente
  const handleClientPress = (client) => {
    navigation.navigate("InfoClient", { client });
  };

  return (
    <>
      <HeaderPrincipal title="Gestión de Clientes" />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {clients.length === 0 ? (
          <Text style={styles.emptyText}>No hay clientes registrados para este usuario.</Text>
        ) : (
          clients.map((client) => (
            <View key={client.id} style={styles.card}>
              <TouchableOpacity onPress={() => navigation.navigate("infoclient", {client})}>              
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                  }}
                  style={styles.avatar}
                />
              </TouchableOpacity>

              <View style={styles.info}>
                <Text style={styles.name}>{client.nombre}</Text>
                <Text style={styles.email}>{client.correo || "Sin correo"}</Text>
                <Text style={styles.phone}>{client.telefono}</Text>
                <Text style={styles.address}>
                  {client.direccion || "Sin dirección"}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleOpenEditModal(client)}>
                  <Icon name="pencil" size={22} color="#007bff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteClient(client)}>
                  <Icon name="delete" size={22} color="#ff0f07ff" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal para agregar/editar cliente */}
      <DraggableModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          resetForm();
          setIsEditing(false);
          setSelectedClient(null);
        }}
        title={isEditing ? "Editar Cliente" : "Nuevo Cliente"}
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
              setModalVisible(false);
              resetForm();
              setIsEditing(false);
              setSelectedClient(null);
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
              <Text style={styles.saveButtonText}>
                {isEditing ? "Actualizar" : "Guardar"}
              </Text>
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

export default Clients;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    padding: 18,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 4, 
    borderLeftColor: "#0077cc",
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginRight: 14,
    backgroundColor: "#e9eef2",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1f2937",
  },
  email: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 2,
  },
  phone: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  address: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#ff6b6b",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
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
