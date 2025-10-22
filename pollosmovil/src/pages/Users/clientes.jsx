import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import HeaderPrincipal from "../../components/layout/header";
import Modal from "../../components/common/Modal.componet";
import { getClients, createClient, updateClient, deleteClient, } from "../../Hook/Api/clientApi";

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

  // Load clients from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
        console.log(data);
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };
    fetchClients();
  }, []);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({ nombre: "", correo: "", telefono: "", direccion: "" });
    setIsEditing(false);
    setSelectedClient(null);
  };

  // Open modal for new client
  const handleOpenAddModal = () => {
    resetForm();
    setIsEditing(false);
    setModalVisible(true);
  };

  // Save or update client
  const handleSaveClient = async () => {
    if (!formData.nombre || !formData.telefono) {
      Alert.alert("Campos incompletos", "Por favor completa los campos requeridos.");
      return;
    }

    try {
      if (isEditing && selectedClient) {
        await updateClient(selectedClient.id, formData);
      } else {
        await createClient(formData);
      }

      const updatedClients = await getClients();
      setClients(updatedClients);
      setModalVisible(false);
      resetForm();
    } catch (err) {
      console.error("Error saving client:", err);
    }
  };

  // Edit client
  const handleEditClient = (client) => {
    setFormData(client);
    setSelectedClient(client);
    setIsEditing(true);
    setModalVisible(true);
  };

  // Delete client
  const handleDeleteClient = (client) => {
    Alert.alert("Eliminar cliente", `¿Deseas eliminar a ${client.nombre}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteClient(client.id);
            const updatedClients = await getClients();
            setClients(updatedClients);
          } catch (err) {
            console.error("Error deleting client:", err);
          }
        },
      },
    ]);
  };

  return (
    <>
      <HeaderPrincipal title="Gestión de Clientes" />

      <ScrollView style={styles.container}>
        {clients.map((client) => (
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
        ))}
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
