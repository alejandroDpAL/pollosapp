import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Alert, } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import HeaderPrincipal from "../../components/layout/header";
import Modal from "../../components/common/Modal.componet";
import {
  createClient,
  updateClient,
  deleteClient,
  getClientById,
} from "../../Hook/Api/clientApi";
import { useAuth } from "../../Hook/context/AuthContext";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
  });

  const { user } = useAuth();

  useEffect(() => {
    const fetchClients = async () => {
      if (!user || !user.id) return;

      try {
        const data = await getClientById(user.id);
        setClients(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al obtener los clientes:", err);
        Alert.alert("Error", "No se pudieron cargar los clientes del usuario.");
      }
    };

    fetchClients();
  }, [user]);

  // Manejar cambios de input
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({ nombre: "", correo: "", telefono: "", direccion: "" });
    setIsEditing(false);
    setSelectedClient(null);
  };

  // Abrir modal para nuevo cliente
  const handleOpenAddModal = () => {
    resetForm();
    setIsEditing(false);
    setModalVisible(true);
  };

  // Guardar o actualizar cliente
  const handleSaveClient = async () => {
    if (!formData.nombre || !formData.telefono) {
      Alert.alert("Campos incompletos", "Por favor completa los campos requeridos.");
      return;
    }

    try {
      if (isEditing && selectedClient) {
        await updateClient(selectedClient.id, formData);
      } else {
        await createClient({ ...formData, usuarioId: user.id });
      }

      // Recargar la lista actualizada
      const updatedClients = await getClientById(user.id);
      setClients(Array.isArray(updatedClients) ? updatedClients : []);

      setModalVisible(false);
      resetForm();
    } catch (err) {
      console.error("Error al guardar el cliente:", err);
      Alert.alert("Error", "No se pudo guardar el cliente. Intenta nuevamente.");
    }
  };

  // Editar cliente
  const handleEditClient = (client) => {
    setFormData(client);
    setSelectedClient(client);
    setIsEditing(true);
    setModalVisible(true);
  };

  // Eliminar cliente
  const handleDeleteClient = (client) => {
    Alert.alert("Eliminar cliente", `¿Deseas eliminar a ${client.nombre}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteClient(client.id);
            const updatedClients = await getClientById(user.id);
            setClients(Array.isArray(updatedClients) ? updatedClients : []);
          } catch (err) {
            console.error("Error al eliminar cliente:", err);
            Alert.alert("Error", "No se pudo eliminar el cliente.");
          }
        },
      },
    ]);
  };

  return (
    <>
      <HeaderPrincipal title="Gestión de Clientes" />

      <ScrollView style={styles.container}>
        {clients.length === 0 ? (
          <Text style={styles.emptyText}>No hay clientes registrados.</Text>
        ) : (
          clients.map((client) => (
            <View key={client.id} style={styles.card}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }}
                style={styles.avatar}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{client.nombre}</Text>
                <Text style={styles.email}>{client.correo || "Sin correo"}</Text>
                <Text style={styles.phone}>{client.telefono}</Text>
                <Text style={styles.address}>
                  {client.direccion || "Sin dirección"}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleEditClient(client)}>
                  <Icon name="pencil" size={22} color="#007bff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteClient(client)}>
                  <Icon name="delete" size={22} color="#d9534f" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        title={isEditing ? "Editar cliente" : "Agregar nuevo cliente"}
        content={
          <ScrollView>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={formData.nombre}
                onChangeText={(text) => handleInputChange("nombre", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={formData.correo}
                onChangeText={(text) => handleInputChange("correo", text)}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                value={formData.telefono}
                onChangeText={(text) => handleInputChange("telefono", text)}
                keyboardType="phone-pad"
              />
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Dirección"
                value={formData.direccion}
                onChangeText={(text) => handleInputChange("direccion", text)}
                multiline
              />
            </View>
          </ScrollView>
        }
        onClose={() => {
          setModalVisible(false);
          resetForm();
        }}
        onCancel={() => {
          setModalVisible(false);
          resetForm();
        }}
        onSave={handleSaveClient}
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
    // backgroundColor: "#0077cc",
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
  form: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    backgroundColor: "#ffffff",
    fontSize: 15,
    color: "#374151",
  },
});
