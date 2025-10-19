import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import HeaderPrincipal from "../components/header";
import Modal from "../components/Modal.componet";
import { getProducts } from "../Hook/Api/productApi";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    cantidad: "",
    costo: "",
    fecha_compra: "",
    fecha_venta: "",
  });

  // () GET /producto/listar)
  useEffect(() => {
    const fetchProduc = async () => {
      try {
        const data = await getProducts();
        setProductos(data);
        console.log(data);
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };
    fetchProduc();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      cantidad: "",
      costo: "",
      fecha_compra: "",
      fecha_venta: "",
    });
    setIsEditing(false);
    setSelectedProducto(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsEditing(false);
    setModalVisible(true);
  };

  const handleSaveProducto = () => {
    if (!formData.nombre || !formData.costo) {
      Alert.alert("Campos incompletos", "Por favor completa el nombre y costo.");
      return;
    }

    if (isEditing && selectedProducto) {
      setProductos((prev) =>
        prev.map((p) =>
          p.id === selectedProducto.id ? { ...p, ...formData } : p
        )
      );
    } else {
      setProductos((prev) => [
        ...prev,
        { id: Date.now(), negocio_id: 1, ...formData },
      ]);
    }

    setModalVisible(false);
    resetForm();
  };

  const handleEditProducto = (producto) => {
    setFormData(producto);
    setSelectedProducto(producto);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleDeleteProducto = (producto) => {
    Alert.alert(
      "Eliminar producto",
      `¿Deseas eliminar ${producto.nombre}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () =>
            setProductos((prev) => prev.filter((p) => p.id !== producto.id)),
        },
      ]
    );
  };

  return (
    <>
      <HeaderPrincipal title="Gestión de Productos" />

      <ScrollView style={styles.container}
        contentContainerStyle={{ paddingBottom: 10 }}>
        {productos.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/3081/3081826.png",
              }}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.nombre}</Text>
              <Text style={styles.field}>Cantidad: {item.cantidad}</Text>
              <Text style={styles.field}>Costo: ${item.costo}</Text>
              <Text style={styles.field}>F. Compra: {item.fecha_compra}</Text>
              <Text style={styles.field}>F. Venta: {item.fecha_venta}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEditProducto(item)}>
                <Icon name="pencil" size={22} color="#007bff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteProducto(item)}>
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
        title={isEditing ? "Editar producto" : "Agregar producto"}
        content={
          <ScrollView>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Nombre del producto"
                value={formData.nombre}
                onChangeText={(text) => handleInputChange("nombre", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Cantidad"
                value={formData.cantidad}
                onChangeText={(text) => handleInputChange("cantidad", text)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Costo"
                value={formData.costo}
                onChangeText={(text) => handleInputChange("costo", text)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Fecha de compra"
                value={formData.fecha_compra}
                onChangeText={(text) =>
                  handleInputChange("fecha_compra", text)
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Fecha de venta"
                value={formData.fecha_venta}
                onChangeText={(text) => handleInputChange("fecha_venta", text)}
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
        onSave={handleSaveProducto}
      />
    </>
  );
};

export default Productos;

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
    // borderLeftColor: "#00b894",
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 8,
    marginRight: 14,
    backgroundColor: "#e9eef2",
  },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: "700", color: "#1f2937" },
  field: { fontSize: 13, color: "#4b5563", marginTop: 2 },
  actions: { flexDirection: "row", alignItems: "center", gap: 15 },
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
  form: { marginTop: 10 },
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
