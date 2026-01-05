import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNegocio } from '../../Hook/context/NegocioContext';
import { useAuth } from '../../Hook/context/AuthContext';
import { getProductosByNegocio, createProduct, updateProduct, deleteProduct } from '../../Hook/Api/productApi';
import HeaderPrincipal from '../../components/layout/header';
import ModalAlert from '../../components/common/Modal.Alet';
import DraggableModal from '../../components/common/DraggableModal';

const ProductosView = () => {
  const { negocioActivo } = useNegocio();
  const { usuario } = useAuth();

  // Estado de productos
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    cantidad: '',
  });

  // Modal de alerta
  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  // Cargar productos al montar o cambiar negocio
  useEffect(() => {
    if (negocioActivo?.id) {
      cargarProductos();
    }
  }, [negocioActivo?.id]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await getProductosByNegocio(negocioActivo.id);
      setProductos(data || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
      showAlert('Error', 'No se pudo cargar los productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', precio: '', cantidad: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleEditProducto = (producto) => {
    setFormData({
      nombre: producto.nombre,
      precio: producto.precio?.toString() || '',
      cantidad: producto.cantidad?.toString() || '',
    });
    setEditingId(producto.id);
    setIsEditing(true);
    setModalVisible(true);
  };

  const showAlert = (title, message, type = 'info') => {
    setAlertModal({ visible: true, title, message, type });
  };

  const handleSave = async () => {
    // Validaciones
    if (!formData.nombre?.trim()) {
      showAlert('Campo incompleto', 'Por favor ingresa el nombre del producto', 'warning');
      return;
    }

    if (!formData.precio || isNaN(parseFloat(formData.precio)) || parseFloat(formData.precio) <= 0) {
      showAlert('Precio inválido', 'Ingresa un precio válido mayor a 0', 'warning');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        nombre: formData.nombre.trim(),
        negocio_id: negocioActivo.id,
        precio: parseFloat(formData.precio),
        cantidad: formData.cantidad ? parseInt(formData.cantidad) : 0,
      };

      if (isEditing) {
        // Actualizar
        await updateProduct(editingId, payload);
        showAlert('Éxito', `Producto "${formData.nombre}" actualizado correctamente`, 'success');
      } else {
        // Crear
        await createProduct(payload);
        showAlert('Éxito', `Producto "${formData.nombre}" registrado correctamente`, 'success');
      }

      setModalVisible(false);
      resetForm();
      await cargarProductos();
    } catch (error) {
      console.error('Error guardando producto:', error);
      showAlert('Error', error.message || 'No se pudo guardar el producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProducto = (producto) => {
    Alert.alert(
      'Eliminar producto',
      `¿Estás seguro que deseas eliminar "${producto.nombre}"?\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteProduct(producto.id);
              showAlert('Éxito', `Producto "${producto.nombre}" eliminado`, 'success');
              await cargarProductos();
            } catch (error) {
              console.error('Error eliminando producto:', error);
              showAlert('Error', 'No se pudo eliminar el producto', 'error');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Renderizar producto
  const renderProducto = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.cardIcon}>
        <Icon name="package" size={32} color="#0077cc" />
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.productName}>{item.nombre}</Text>
        <Text style={styles.cardField}>
          Precio: ${item.precio ? parseFloat(item.precio).toFixed(2) : '0.00'}
        </Text>
        {item.cantidad > 0 && (
          <Text style={styles.cardField}>
            Stock: {item.cantidad}
          </Text>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleEditProducto(item)}
        >
          <Icon name="pencil" size={20} color="#0077cc" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { marginRight: 0 }]}
          onPress={() => handleDeleteProducto(item)}
        >
          <Icon name="trash-can" size={20} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    
        <View style={styles.container}>
     
    
      {/* Lista de productos */}
      {productos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="package-open" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>Sin productos</Text>
          <Text style={styles.emptySubtext}>
            Crea tu primer producto para comenzar a registrar lotes
          </Text>
        </View>
      ) : (
        <FlatList
          data={productos}
          renderItem={renderProducto}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          scrollEnabled
        />
      )}

      {/* Botón flotante agregar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleOpenModal}
      >
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal de formulario */}
      <DraggableModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={isEditing ? 'Editar Producto' : 'Crear Producto'}
        initialHeight={0.7}
        maxHeight={0.9}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Nombre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Producto</Text>
            <View style={styles.inputContainer}>
              <Icon name="tag" size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
                placeholder="Ej: Pollo Broiler"
                value={formData.nombre}
                onChangeText={(value) =>
                  setFormData({ ...formData, nombre: value })
                }
                editable={!loading}
              />
            </View>
          </View>

          {/* Precio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Precio Unitario</Text>
            <View style={styles.inputContainer}>
              <Text style={{ color: '#9ca3af', fontSize: 18 }}>$</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.precio}
                onChangeText={(value) =>
                  setFormData({ ...formData, precio: value })
                }
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>
          </View>

          {/* Stock inicial (opcional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Stock Inicial (Opcional)</Text>
            <View style={styles.inputContainer}>
              <Icon name="package" size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.cantidad}
                onChangeText={(value) =>
                  setFormData({ ...formData, cantidad: value })
                }
                keyboardType="number-pad"
                editable={!loading}
              />
            </View>
          </View>

          <Text style={styles.helperText}>
            Los productos son independientes de los lotes. Crea productos primero, luego registra lotes para ellos.
          </Text>

          {/* Botones */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={() => setModalVisible(false)}
              disabled={loading}
            >
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnSave}
              onPress={handleSave}
              disabled={loading}
            >
              <Icon name="check" size={20} color="#fff" />
              <Text style={styles.btnSaveText}>
                {isEditing ? 'Actualizar' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </DraggableModal>

      {/* Modal de alerta */}
      <ModalAlert
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ ...alertModal, visible: false })}
      />
    </View>

 
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0077cc',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardField: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0077cc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    height: 48,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  helperText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0077cc',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  btnSave: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0077cc',
    gap: 6,
  },
  btnSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});

export default ProductosView;
