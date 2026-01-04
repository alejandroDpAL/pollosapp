import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import HeaderPrincipal from "../../components/layout/header";
import Modal from "../../components/common/Modal.componet";
import DraggableModal from "../../components/common/DraggableModal";
import ModalAlert from "../../components/common/Modal.Alet.jsx";
import { getProductosByNegocio, createProduct, updateProduct, deleteProduct } from "../../Hook/Api/productApi";
import { useNegocio } from "../../Hook/context/NegocioContext";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const { negocioActivo } = useNegocio();
  const [modalFormVisible, setModalFormVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '', type: 'info', onConfirm: null });

  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    cantidad: "",
  });

  useEffect(() => {
    const fetchProduc = async () => {
      if (!negocioActivo?.id) return;
      try {
        const data = await getProductosByNegocio(negocioActivo.id);
        setProductos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setAlertModal({
          visible: true,
          title: "Error",
          message: "No se pudieron cargar los productos del negocio.",
          type: "error",
          onConfirm: null,
        });
      }
    };
    fetchProduc();
  }, [negocioActivo]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ nombre: "", precio: "", cantidad: "" });
    setIsEditing(false);
    setSelectedProducto(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsEditing(false);
    setModalFormVisible(true);
  };

  const handleSaveProducto = () => {
    if (!formData.nombre?.trim()) {
      setAlertModal({
        visible: true,
        title: 'Campos incompletos',
        message: 'El nombre es obligatorio.',
        type: 'error',
        onConfirm: null
      });
      return;
    }

    if (!negocioActivo?.id) {
      setAlertModal({
        visible: true,
        title: 'Negocio requerido',
        message: 'Selecciona un negocio antes de agregar productos.',
        type: 'error',
        onConfirm: null
      });
      return;
    }

    const nombre = formData.nombre.trim();
    const precio = formData.precio !== "" && !isNaN(Number(formData.precio)) ? Number(formData.precio) : 0;
    const cantidad = formData.cantidad !== "" && !isNaN(Number(formData.cantidad)) ? Number(formData.cantidad) : 0;

    if (isEditing && selectedProducto) {
      updateProduct(selectedProducto.id, { nombre, negocio_id: negocioActivo.id, precio, cantidad })
        .then(() => {
          setProductos((prev) => prev.map((p) => p.id === selectedProducto.id ? { ...p, nombre, negocio_id: negocioActivo.id, precio, cantidad } : p));
          setAlertModal({
            visible: true,
            title: 'Éxito',
            message: 'Producto actualizado correctamente',
            type: 'success',
            onConfirm: null
          });
          setModalFormVisible(false);
          resetForm();
        })
        .catch((err) => {
          console.error('Error al actualizar producto:', err);
          setAlertModal({
            visible: true,
            title: 'Error',
            message: 'No se pudo actualizar el producto.',
            type: 'error',
            onConfirm: null
          });
        });
    } else {
      createProduct({ nombre, negocio_id: negocioActivo.id, precio, cantidad })
        .then((response) => {
          const nuevo = { id: response?.id || Date.now(), nombre, negocio_id: negocioActivo.id, precio, cantidad };
          setProductos((prev) => [nuevo, ...prev]);
          setAlertModal({
            visible: true,
            title: 'Éxito',
            message: 'Producto agregado correctamente',
            type: 'success',
            onConfirm: null
          });
          setModalFormVisible(false);
          resetForm();
        })
        .catch((err) => {
          console.error('Error al crear producto:', err);
          setAlertModal({
            visible: true,
            title: 'Error',
            message: 'No se pudo crear el producto.',
            type: 'error',
            onConfirm: null
          });
        });
    }
  };

  const handleEditProducto = (producto) => {
    setFormData({
      nombre: producto.nombre,
      precio: producto.precio ? String(producto.precio) : "",
      cantidad: producto.cantidad ? String(producto.cantidad) : "",
    });
    setSelectedProducto(producto);
    setIsEditing(true);
    setModalFormVisible(true);
  };

  const handleOpenDeleteModal = (producto) => {
    setSelectedProducto(producto);
    setModalDeleteVisible(true);
  };

  const handleConfirmDelete = () => {
    if (selectedProducto) {
      deleteProduct(selectedProducto.id)
        .then(() => {
          setProductos((prev) => prev.filter((p) => p.id !== selectedProducto.id));
          setModalDeleteVisible(false);
          setAlertModal({
            visible: true,
            title: 'Éxito',
            message: 'Producto eliminado correctamente',
            type: 'success',
            onConfirm: null
          });
          setSelectedProducto(null);
        })
        .catch((err) => {
          console.error('Error al eliminar producto:', err);
          setAlertModal({
            visible: true,
            title: 'Error',
            message: 'No se pudo eliminar el producto.',
            type: 'error',
            onConfirm: null
          });
        });
    }
  };

  return (
    <>
      <HeaderPrincipal title="Gestión de Productos" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        {productos.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image
              source={{ uri: "https://cdn-icons-png.flaticon.com/512/3081/3081826.png" }}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.nombre}</Text>
              {item.negocio_id && (
                <Text style={styles.field}>Negocio: {item.negocio_id}</Text>
              )}
              {item.precio !== undefined && item.precio !== null && (
                <Text style={styles.field}>Precio: ${Number(item.precio || 0).toFixed(2)}</Text>
              )}
              {item.cantidad !== undefined && item.cantidad !== null && (
                <Text style={styles.field}>Cantidad: {item.cantidad}</Text>
              )}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEditProducto(item)}>
                <Icon name="pencil" size={22} color="#007bff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleOpenDeleteModal(item)}>
                <Icon name="delete" size={22} color="#d9534f" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal para crear/editar - DraggableModal */}
      <DraggableModal
        visible={modalFormVisible}
        onClose={() => {
          setModalFormVisible(false);
          resetForm();
        }}
        title={isEditing ? "Editar Producto" : "Nuevo Producto"}
        initialHeight={0.45}
        maxHeight={0.7}
      >
        <View style={styles.formContainer}>
          {/* Formulario: nombre, precio, cantidad */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del producto *</Text>
              <View style={styles.inputContainer}>
                <Icon name="package-variant" size={20} color="#6b7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Pollo entero"
                  value={formData.nombre}
                  onChangeText={(text) => handleInputChange("nombre", text)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Precio</Text>
              <View style={styles.inputContainer}>
                <Icon name="currency-usd" size={20} color="#6b7280" />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={formData.precio}
                  onChangeText={(text) => handleInputChange("precio", text)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cantidad</Text>
              <View style={styles.inputContainer}>
                <Icon name="numeric" size={20} color="#6b7280" />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="number-pad"
                  value={formData.cantidad}
                  onChangeText={(text) => handleInputChange("cantidad", text)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Negocio</Text>
              <View style={styles.inputContainer}>
                <Icon name="office-building" size={20} color="#6b7280" />
                <Text style={styles.input}>
                  {negocioActivo?.nombre || "Selecciona un negocio"}
                </Text>
              </View>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={() => {
                setModalFormVisible(false);
                resetForm();
              }}
            >
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSave} onPress={handleSaveProducto}>
              <Icon name="check" size={20} color="#fff" />
              <Text style={styles.btnSaveText}>
                {isEditing ? "Actualizar" : "Guardar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </DraggableModal>

      {/* Modal simple para eliminar - Modal antiguo */}
      <Modal
        visible={modalDeleteVisible}
        title="Eliminar producto"
        content={
          <View style={styles.deleteContent}>
            <Icon name="alert-circle-outline" size={64} color="#ef4444" />
            <Text style={styles.deleteText}>
              ¿Estás seguro de que deseas eliminar el producto{" "}
              <Text style={styles.deleteName}>"{selectedProducto?.nombre}"</Text>?
            </Text>
            <Text style={styles.deleteWarning}>
              Esta acción no se puede deshacer.
            </Text>
          </View>
        }
        onClose={() => {
          setModalDeleteVisible(false);
          setSelectedProducto(null);
        }}
        onCancel={() => {
          setModalDeleteVisible(false);
          setSelectedProducto(null);
        }}
        onSave={handleConfirmDelete}
      />

      <ModalAlert
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ visible: false, title: '', message: '', type: 'info', onConfirm: null })}
        onConfirm={alertModal.onConfirm}
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

  // Estilos del DraggableModal - Formulario
  formContainer: {
    paddingBottom: 20,
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    marginBottom: 12,
  },
  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  changeImageText: {
    color: "#0077cc",
    fontSize: 14,
    fontWeight: "600",
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#ffffff",
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#374151",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
    marginBottom: 20,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  btnCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  btnSave: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0077cc",
    gap: 8,
  },
  btnSaveText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  // Estilos del Modal antiguo - Eliminar
  deleteContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  deleteText: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
  },
  deleteName: {
    fontWeight: "700",
    color: "#1f2937",
  },
  deleteWarning: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 8,
  },
});