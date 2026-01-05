import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ModalAlert from '../../components/common/Modal.Alet.jsx';
import DraggableModal from "../../components/common/DraggableModal";
import { getNegociosByUsuario, crearNegocio } from '../../Hook/Api/negocioApi';
import { useAuth } from '../../Hook/context/AuthContext';
import { useNegocio } from '../../Hook/context/NegocioContext';

const SelectNegocio = ({ navigation }) => {
  const { user } = useAuth();
  const { selectNegocio } = useNegocio();
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccionando, setSeleccionando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formNegocio, setFormNegocio] = useState({
    nombre: '',
    descripcion: '',
    telefono: '',
    correo: '',
    logo: '',
  });
  const [errors, setErrors] = useState({});
  const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '', type: 'info', onConfirm: null });

  useEffect(() => {
    cargarNegocios();
  }, []);

  const abrirModalCrear = () => {
    setErrors({});
    setModalVisible(true);
  };

  const cargarNegocios = async () => {
    try {
      const data = await getNegociosByUsuario(user.id);
      setNegocios(data || []);
    } catch (error) {
      console.error('Error al cargar negocios:', error);
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'No se pudieron cargar los negocios',
        type: 'error',
        onConfirm: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormNegocio((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formNegocio.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formNegocio.telefono.trim()) newErrors.telefono = 'El telefono es obligatorio';
    if (!formNegocio.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formNegocio.correo.trim())) {
      newErrors.correo = 'Correo invalido';
    }
    if (!formNegocio.logo.trim()) newErrors.logo = 'El logo es obligatorio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCrearNegocio = async () => {
    if (creating) return;
    if (!validateForm()) return;

    setCreating(true);
    try {
      const payload = {
        ...formNegocio,
        activo: 1,
        usuario_id: user.id,
      };

      const response = await crearNegocio(payload);
      const nuevoNegocio = {
        ...formNegocio,
        id: response?.id || Date.now(),
        usuario_id: user.id,
        activo: 1,
      };

      setNegocios((prev) => [nuevoNegocio, ...prev]);
      setFormNegocio({ nombre: '', descripcion: '', telefono: '', correo: '', logo: '' });
      setModalVisible(false);
      setAlertModal({
        visible: true,
        title: 'Negocio creado',
        message: `Registraste: ${formNegocio.nombre}\nCorreo: ${formNegocio.correo}\nTel: ${formNegocio.telefono}`,
        type: 'success',
        onConfirm: null,
      });
    } catch (error) {
      console.error('Error al crear negocio:', error);
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'No se pudo crear el negocio. Intentalo de nuevo.',
        type: 'error',
        onConfirm: null,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleSeleccionarNegocio = async (negocio) => {
    setSeleccionando(true);
    try {
      await selectNegocio(negocio);
      // El RootNavigator detectará el cambio y navegará automáticamente
    } catch (error) {
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'No se pudo seleccionar el negocio',
        type: 'error',
        onConfirm: null
      });
    } finally {
      setSeleccionando(false);
    }
  };

  const renderNegocioCard = ({ item }) => (
    <TouchableOpacity
      style={styles.negocioCard}
      onPress={() => handleSeleccionarNegocio(item)}
      disabled={seleccionando}
    >
      <View style={styles.negocioIcon}>
        <Icon name="office-building" size={32} color="#0077cc" />
      </View>
      <View style={styles.negocioInfo}>
        <Text style={styles.negocioNombre}>{item.nombre}</Text>
        {item.descripcion && (
          <Text style={styles.negocioDescripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}
        <View style={styles.negocioMeta}>
          <Icon name="phone" size={14} color="#6b7280" />
          <Text style={styles.negocioMetaText}>{item.telefono}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color="#9ca3af" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0077cc" />
        <Text style={styles.loadingText}>Cargando negocios...</Text>
      </View>
    );
  }

  if (negocios.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="store-alert" size={80} color="#d1d5db" />
        <Text style={styles.emptyTitle}>No tienes negocios registrados</Text>
        <Text style={styles.emptyText}>
          Necesitas crear un negocio para empezar a trabajar
        </Text>
        <TouchableOpacity
          style={styles.btnCrear}
          onPress={abrirModalCrear}
        >
          <Icon name="plus-circle" size={20} color="#fff" />
          <Text style={styles.btnCrearText}>Crear mi primer negocio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="briefcase-check" size={40} color="#0077cc" />
        <Text style={styles.title}>Selecciona tu negocio</Text>
        <Text style={styles.subtitle}>
          ¿En qué negocio estás trabajando hoy?
        </Text>
      </View>

      <FlatList
        data={negocios}
        renderItem={renderNegocioCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Botón flotante para agregar otro negocio */}
      <TouchableOpacity
        style={styles.fab}
        onPress={abrirModalCrear}
        disabled={seleccionando}
        activeOpacity={0.85}
      >
        <Icon name="plus" size={26} color="#fff" />
        <Text style={styles.fabText}>Nuevo negocio</Text>
      </TouchableOpacity>

      {seleccionando && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.overlayText}>Seleccionando negocio...</Text>
        </View>
      )}

      <ModalAlert
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ visible: false, title: '', message: '', type: 'info', onConfirm: null })}
        onConfirm={alertModal.onConfirm}
      />

      {/* Modal para crear un nuevo negocio */}
      <DraggableModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Crear nuevo negocio"
        initialHeight={0.85}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Registrar negocio</Text>
          <Text style={styles.modalSubtitle}>
            Completa el formulario para agregar un negocio y seleccionarlo despues.
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={[styles.input, errors.nombre && styles.inputError]}
              placeholder="Ej: Pollos La Granja"
              value={formNegocio.nombre}
              onChangeText={(text) => handleChange('nombre', text)}
            />
            {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Descripcion</Text>
            <TextInput
              style={styles.input}
              placeholder="Opcional"
              value={formNegocio.descripcion}
              onChangeText={(text) => handleChange('descripcion', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Telefono *</Text>
            <TextInput
              style={[styles.input, errors.telefono && styles.inputError]}
              placeholder="Ej: 3001234567"
              keyboardType="phone-pad"
              value={formNegocio.telefono}
              onChangeText={(text) => handleChange('telefono', text)}
            />
            {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Correo *</Text>
            <TextInput
              style={[styles.input, errors.correo && styles.inputError]}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formNegocio.correo}
              onChangeText={(text) => handleChange('correo', text)}
            />
            {errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Logo (URL) *</Text>
            <TextInput
              style={[styles.input, errors.logo && styles.inputError]}
              placeholder="https://..."
              autoCapitalize="none"
              value={formNegocio.logo}
              onChangeText={(text) => handleChange('logo', text)}
            />
            {errors.logo && <Text style={styles.errorText}>{errors.logo}</Text>}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancel]}
              onPress={() => setModalVisible(false)}
              disabled={creating}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalPrimary]}
              onPress={handleCrearNegocio}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalPrimaryText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </DraggableModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  btnCrear: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    paddingHorizontal: 26,
    borderRadius: 14,
    marginTop: 24,
    gap: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  btnCrearText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  negocioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  negocioIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  negocioInfo: {
    flex: 1,
  },
  negocioNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  negocioDescripcion: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },
  negocioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  negocioMetaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    marginTop: 12,
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },

  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: '#0077cc',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  modalContent: {
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: -2,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancel: {
    backgroundColor: '#f3f4f6',
  },
  modalCancelText: {
    color: '#4b5563',
    fontSize: 15,
    fontWeight: '600',
  },
  modalPrimary: {
    backgroundColor: '#0077cc',
  },
  modalPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default SelectNegocio;
