import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DraggableModal from '../../components/common/DraggableModal';
import { getClientById } from '../../Hook/Api/clientApi';
import { getLotesByUsuario } from '../../Hook/Api/lotesApi';
import { registrarVenta } from '../../Hook/Api/VentasApi';
import { useAuth } from '../../Hook/context/AuthContext';

const NuevaVenta = ({ visible, onClose, onVentaRegistrada }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    lote_id: '',
    cliente_id: '',
    cantidad: '',
    precio_unitario: '',
    observaciones: '',
  });

  const [clientes, setClientes] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (visible && user?.id) {
      cargarDatos();
    }
  }, [visible, user?.id]);

  const cargarDatos = async () => {
    setLoadingData(true);
    try {
      const [clientesData, lotesData] = await Promise.all([
        getClientById(user.id),
        getLotesByUsuario(user.id),
      ]);
      setClientes(clientesData || []);

      const lotesActivos = (lotesData || []).filter(
        lote => lote.activo === 1 && lote.cantidad_actual > 0
      );
      setLotes(lotesActivos);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      lote_id: '',
      cliente_id: '',
      cantidad: '',
      precio_unitario: '',
      observaciones: '',
    });
  };

  const validarFormulario = () => {
    if (!formData.lote_id) {
      Alert.alert('Campo requerido', 'Debes seleccionar un lote');
      return false;
    }
    if (!formData.cliente_id) {
      Alert.alert('Campo requerido', 'Debes seleccionar un cliente');
      return false;
    }
    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
      Alert.alert('Cantidad inválida', 'La cantidad debe ser mayor a 0');
      return false;
    }
    if (!formData.precio_unitario || parseFloat(formData.precio_unitario) <= 0) {
      Alert.alert('Precio inválido', 'El precio unitario debe ser mayor a 0');
      return false;
    }

    const loteSeleccionado = lotes.find(
      l => l.id === parseInt(formData.lote_id)
    );
    if (
      loteSeleccionado &&
      parseFloat(formData.cantidad) > loteSeleccionado.cantidad_actual
    ) {
      Alert.alert(
        'Stock insuficiente',
        `Solo hay ${loteSeleccionado.cantidad_actual} unidades disponibles en este lote`
      );
      return false;
    }

    return true;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    try {
      const cantidad = parseFloat(formData.cantidad);
      const precioUnitario = parseFloat(formData.precio_unitario);
      const valorTotal = cantidad * precioUnitario;

      const ventaData = {
        lote_id: parseInt(formData.lote_id),
        cliente_id: parseInt(formData.cliente_id),
        usuario_id: user.id,
        cantidad: cantidad,
        precio_unitario: precioUnitario,
        valor_total: valorTotal,
        fecha: new Date().toISOString().split('T')[0],
        observaciones: formData.observaciones || null,
      };

      await registrarVenta(ventaData);

      Alert.alert('Éxito', 'Venta registrada correctamente');
      resetForm();
      if (onVentaRegistrada) {
        onVentaRegistrada();
      }
      onClose();
    } catch (error) {
      const mensaje =
        error.response?.data?.message || 'No se pudo registrar la venta';
      Alert.alert('Error', mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    resetForm();
    onClose();
  };

  const calcularTotal = () => {
    if (formData.cantidad && formData.precio_unitario) {
      return (
        parseFloat(formData.cantidad) * parseFloat(formData.precio_unitario)
      ).toLocaleString('es-CO');
    }
    return '0';
  };

  return (
    <DraggableModal
      visible={visible}
      onClose={handleCerrar}
      title="Nueva Venta"
      initialHeight={0.75}
      maxHeight={0.95}
    >
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {loadingData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0077cc" />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        ) : (
          <>
            {/* Cliente */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cliente *</Text>
              <View style={styles.pickerContainer}>
                <Icon name="account" size={20} color="#6b7280" style={styles.pickerIcon} />
                <Picker
                  selectedValue={formData.cliente_id}
                  style={styles.picker}
                  onValueChange={value => handleInputChange('cliente_id', value)}
                  enabled={clientes.length > 0}
                >
                  <Picker.Item label="Selecciona un cliente" value="" />
                  {clientes.map(cliente => (
                    <Picker.Item
                      key={cliente.id}
                      label={cliente.nombre}
                      value={cliente.id}
                    />
                  ))}
                </Picker>
              </View>
              {clientes.length === 0 && (
                <Text style={styles.warningText}>No tienes clientes registrados</Text>
              )}
            </View>

            {/* Lote */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lote / Producto *</Text>
              <View style={styles.pickerContainer}>
                <Icon
                  name="package-variant"
                  size={20}
                  color="#6b7280"
                  style={styles.pickerIcon}
                />
                <Picker
                  selectedValue={formData.lote_id}
                  style={styles.picker}
                  onValueChange={value => handleInputChange('lote_id', value)}
                  enabled={lotes.length > 0}
                >
                  <Picker.Item label="Selecciona un lote" value="" />
                  {lotes.map(lote => (
                    <Picker.Item
                      key={lote.id}
                      label={`${lote.nombre} (Stock: ${lote.cantidad_actual})`}
                      value={lote.id}
                    />
                  ))}
                </Picker>
              </View>
              {lotes.length === 0 && (
                <Text style={styles.warningText}>
                  No tienes lotes activos con stock
                </Text>
              )}
            </View>

            {/* Cantidad y Precio */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Cantidad *</Text>
                <View style={styles.inputContainer}>
                  <Icon name="numeric" size={20} color="#6b7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={formData.cantidad}
                    onChangeText={text => {
                      const numericValue = text.replace(/[^0-9.]/g, '');
                      handleInputChange('cantidad', numericValue);
                    }}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Precio Unit. *</Text>
                <View style={styles.inputContainer}>
                  <Icon name="currency-usd" size={20} color="#6b7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    value={formData.precio_unitario}
                    onChangeText={text => {
                      const numericValue = text.replace(/[^0-9.]/g, '');
                      handleInputChange('precio_unitario', numericValue);
                    }}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {/* Valor Total */}
            {formData.cantidad && formData.precio_unitario && (
              <View style={styles.totalContainer}>
                <Icon name="calculator" size={24} color="#0077cc" />
                <View style={styles.totalInfo}>
                  <Text style={styles.totalLabel}>Valor Total</Text>
                  <Text style={styles.totalValue}>$ {calcularTotal()}</Text>
                </View>
              </View>
            )}

            {/* Observaciones */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Observaciones</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Icon
                  name="note-text"
                  size={20}
                  color="#6b7280"
                  style={styles.textAreaIcon}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Detalles adicionales de la venta..."
                  value={formData.observaciones}
                  onChangeText={text => handleInputChange('observaciones', text)}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Botones */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={handleCerrar}
                disabled={loading}
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnSave, (loading || loadingData) && styles.btnDisabled]}
                onPress={handleGuardar}
                disabled={loading || loadingData}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="check-circle" size={20} color="#fff" />
                    <Text style={styles.btnSaveText}>Registrar Venta</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </DraggableModal>
  );
};

export default NuevaVenta;

const styles = StyleSheet.create({
  formContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  inputGroup: {
    marginBottom: 16,
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
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#374151',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingLeft: 14,
    backgroundColor: '#ffffff',
  },
  pickerIcon: {
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  warningText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  totalInfo: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0077cc',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 20,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  btnCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  btnSave: {
    flex: 1.2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0077cc',
    gap: 8,
  },
  btnSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  btnDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
});
