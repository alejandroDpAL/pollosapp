import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNegocio } from '../../Hook/context/NegocioContext';
import { useAuth } from '../../Hook/context/AuthContext';
import { getProductosByNegocio } from '../../Hook/Api/productApi';
import { getLotesByNegocio, createLote, updateLote, deleteLote } from '../../Hook/Api/loteApi';
import HeaderPrincipal from '../../components/layout/header';
import ModalAlert from '../../components/common/Modal.Alet';
import DraggableModal from '../../components/common/DraggableModal';

/**
 * ============================================
 * VISTA: LOTES
 * ============================================
 * Gestionar lotes de productos
 * Flujo: Selecciona Negocio → Elige Producto → Registra Lotes
 * Solo se puede registrar lotes si hay productos
 */
const LotesView = () => {
  const { negocioActivo } = useNegocio();
  const { usuario } = useAuth();

  // Estados principales
  const [lotes, setLotes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    producto_id: '',
    cantidad_inicial: '',
    cantidad_actual: '',
    precio: '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
  });

  // Modal de alerta
  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  // Cargar datos al montar o cambiar negocio
  useEffect(() => {
    if (negocioActivo?.id) {
      cargarDatos();
    }
  }, [negocioActivo?.id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Cargar productos
      const productosData = await getProductosByNegocio(negocioActivo.id);
      setProductos(productosData || []);

      // Cargar lotes
      const lotesData = await getLotesByNegocio(negocioActivo.id);
      setLotes(lotesData.data || lotesData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      showAlert('Error', 'No se pudo cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      producto_id: '',
      cantidad_inicial: '',
      cantidad_actual: '',
      precio: '',
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleOpenModal = () => {
    if (productos.length === 0) {
      showAlert(
        'Sin productos',
        'Debes crear productos antes de registrar lotes. Ve a la sección de Productos.',
        'warning'
      );
      return;
    }
    resetForm();
    setModalVisible(true);
  };

  const showAlert = (title, message, type = 'info') => {
    setAlertModal({ visible: true, title, message, type });
  };

  const handleSelectProducto = (productoId) => {
    setFormData({ ...formData, producto_id: productoId });
  };

  const handleEditLote = (lote) => {
    setFormData({
      nombre: lote.nombre,
      producto_id: lote.producto_id,
      cantidad_inicial: lote.cantidad_inicial.toString(),
      cantidad_actual: lote.cantidad_actual.toString(),
      precio: lote.precio.toString(),
      fecha: lote.fecha,
      descripcion: lote.descripcion || '',
    });
    setEditingId(lote.id);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    // 1️⃣ Validar nombre
    if (!formData.nombre?.trim()) {
      showAlert('Nombre requerido', 'Por favor ingresa un nombre para el lote', 'warning');
      return;
    }

    // 2️⃣ Validar producto
    if (!formData.producto_id) {
      showAlert('Producto requerido', 'Por favor selecciona un producto', 'warning');
      return;
    }

    // 3️⃣ Validar cantidades
    const cantInicial = parseInt(formData.cantidad_inicial) || 0;
    const cantActual = parseInt(formData.cantidad_actual) || 0;

    if (cantInicial <= 0 || cantActual <= 0) {
      showAlert(
        'Cantidades inválidas',
        'Las cantidades deben ser mayores a 0',
        'warning'
      );
      return;
    }

    if (cantActual > cantInicial) {
      showAlert(
        'Cantidad actual inválida',
        `La cantidad actual (${cantActual}) no puede ser mayor a la inicial (${cantInicial})`,
        'warning'
      );
      return;
    }

    // 4️⃣ Validar precio
    if (!formData.precio || isNaN(parseFloat(formData.precio)) || parseFloat(formData.precio) <= 0) {
      showAlert('Precio inválido', 'Ingresa un precio válido mayor a 0', 'warning');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        nombre: formData.nombre.trim(),
        producto_id: parseInt(formData.producto_id),
        cantidad_inicial: cantInicial,
        cantidad_actual: cantActual,
        precio: parseFloat(formData.precio),
        fecha: formData.fecha,
        descripcion: formData.descripcion?.trim() || null,
      };

      // Obtener nombre del producto para mensaje
      const productoSeleccionado = productos.find(
        (p) => p.id === parseInt(formData.producto_id)
      );

      if (isEditing) {
        // Actualizar
        await updateLote(editingId, payload);
        showAlert(
          'Éxito',
          `Lote "${formData.nombre}" actualizado correctamente`,
          'success'
        );
      } else {
        // Crear
        await createLote(payload);
        showAlert(
          'Éxito',
          `Lote "${formData.nombre}" de ${productoSeleccionado?.nombre} registrado correctamente`,
          'success'
        );
      }

      setModalVisible(false);
      resetForm();
      await cargarDatos();
    } catch (error) {
      console.error('Error guardando lote:', error);
      showAlert('Error', error.message || 'No se pudo guardar el lote', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLote = (lote) => {
    Alert.alert(
      'Eliminar lote',
      `¿Estás seguro que deseas eliminar el lote "${lote.nombre}"?\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteLote(lote.id);
              showAlert('Éxito', `Lote "${lote.nombre}" eliminado`, 'success');
              await cargarDatos();
            } catch (error) {
              console.error('Error eliminando lote:', error);
              showAlert('Error', 'No se pudo eliminar el lote', 'error');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Obtener nombre del producto
  const getNombreProducto = (productoId) => {
    const producto = productos.find((p) => p.id === productoId);
    return producto?.nombre || 'Producto desconocido';
  };

  // Renderizar lote
  const renderLote = ({ item }) => (
    <View style={styles.loteCard}>
      <View style={styles.cardIcon}>
        <Icon name="package-variant" size={32} color="#ff6b6b" />
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.loteName}>{item.nombre}</Text>
        <Text style={styles.cardField}>Producto: {getNombreProducto(item.producto_id)}</Text>
        <Text style={styles.cardField}>
          Stock: {item.cantidad_actual} / {item.cantidad_inicial}
        </Text>
        <Text style={styles.cardField}>Precio: ${item.precio ? parseFloat(item.precio).toFixed(2) : "0.00"}</Text>
        <Text style={styles.cardField}>Fecha: {item.fecha}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleEditLote(item)}
        >
          <Icon name="pencil" size={20} color="#0077cc" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { marginRight: 0 }]}
          onPress={() => handleDeleteLote(item)}
        >
          <Icon name="trash-can" size={20} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Contenido principal */}
      {productos.length === 0 ? (
        /* Vista cuando no hay productos */
        <View style={styles.emptyContainer}>
          <Icon name="package-open" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>Sin productos</Text>
          <Text style={styles.emptySubtext}>
            Debes crear productos antes de registrar lotes.
          </Text>
          <Text style={styles.emptySubtext}>
            Ve a la sección de Productos para crear tu primer producto.
          </Text>
        </View>
      ) : lotes.length === 0 ? (
        /* Vista cuando hay productos pero sin lotes */
        <View style={styles.emptyContainer}>
          <Icon name="package-variant" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>Sin lotes</Text>
          <Text style={styles.emptySubtext}>
            Registra un lote para comenzar a hacer seguimiento
          </Text>
          <TouchableOpacity
            style={styles.createFirstBtn}
            onPress={handleOpenModal}
          >
            <Icon name="plus" size={20} color="#fff" />
            <Text style={styles.createFirstBtnText}>Registra un lote</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Lista de lotes */
        <FlatList
          data={lotes}
          renderItem={renderLote}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          scrollEnabled
        />
      )}

      {/* Botón flotante agregar (solo visible si hay productos) */}
      {productos.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleOpenModal}
        >
          <Icon name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Modal de formulario */}
      <DraggableModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={isEditing ? 'Editar Lote' : 'Crear Lote'}
        initialHeight={0.85}
        maxHeight={0.95}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Nombre del lote */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Lote</Text>
            <View style={styles.inputContainer}>
              <Icon name="tag" size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
                placeholder="Ej: Lote Enero"
                value={formData.nombre}
                onChangeText={(value) =>
                  setFormData({ ...formData, nombre: value })
                }
                editable={!loading}
              />
            </View>
          </View>

          {/* Seleccionar producto */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Selecciona un Producto</Text>
            {productos.length === 0 ? (
              <Text style={styles.errorText}>No hay productos disponibles</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.productosScroll}
              >
                {productos.map((producto) => (
                  <TouchableOpacity
                    key={producto.id}
                    style={[
                      styles.productoTag,
                      formData.producto_id === producto.id.toString() &&
                        styles.productoTagSelected,
                    ]}
                    onPress={() => handleSelectProducto(producto.id.toString())}
                  >
                    <Text
                      style={[
                        styles.productoTagText,
                        formData.producto_id === producto.id.toString() &&
                          styles.productoTagTextSelected,
                      ]}
                    >
                      {producto.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Cantidad inicial */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Cantidad Inicial</Text>
              <View style={styles.inputContainer}>
                <Icon name="package" size={20} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={formData.cantidad_inicial}
                  onChangeText={(value) =>
                    setFormData({ ...formData, cantidad_inicial: value })
                  }
                  keyboardType="number-pad"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Cantidad actual */}
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Cantidad Actual</Text>
              <View style={styles.inputContainer}>
                <Icon name="chart-box" size={20} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={formData.cantidad_actual}
                  onChangeText={(value) =>
                    setFormData({ ...formData, cantidad_actual: value })
                  }
                  keyboardType="number-pad"
                  editable={!loading}
                />
              </View>
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

          {/* Fecha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha del Lote</Text>
            <View style={styles.inputContainer}>
              <Icon name="calendar" size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.fecha}
                onChangeText={(value) =>
                  setFormData({ ...formData, fecha: value })
                }
                editable={!loading}
              />
            </View>
          </View>

          {/* Descripción */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción (Opcional)</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Icon name="note-text" size={20} color="#9ca3af" />
              <TextInput
                style={styles.textArea}
                placeholder="Notas adicionales..."
                value={formData.descripcion}
                onChangeText={(value) =>
                  setFormData({ ...formData, descripcion: value })
                }
                multiline
                editable={!loading}
              />
            </View>
          </View>

          <Text style={styles.helperText}>
            Los lotes son instancias de un producto. Puedes crear múltiples lotes del mismo producto con diferentes fechas y cantidades.
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
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="check" size={20} color="#fff" />
                  <Text style={styles.btnSaveText}>
                    {isEditing ? 'Actualizar' : 'Guardar'}
                  </Text>
                </>
              )}
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
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#ffe0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  loteName: {
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
    backgroundColor: '#ff6b6b',
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
  createFirstBtn: {
    flexDirection: 'row',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    alignItems: 'center',
    gap: 8,
  },
  createFirstBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
    minHeight: 48,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#374151',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  productosScroll: {
    flexGrow: 0,
  },
  productoTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  productoTagSelected: {
    borderColor: '#ff6b6b',
    backgroundColor: '#ffe0e0',
  },
  productoTagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  productoTagTextSelected: {
    color: '#ff6b6b',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
    color: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 10,
    minHeight: 80,
  },
  textArea: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 8,
    fontSize: 15,
    color: '#374151',
    maxHeight: 100,
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
    backgroundColor: '#ff6b6b',
    gap: 6,
  },
  btnSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff6b6b',
  },
});

export default LotesView;
