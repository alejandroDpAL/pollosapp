import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * Componente reutilizable con los campos del formulario de cliente
 * @param {Object} formData - Datos del formulario
 * @param {Function} onInputChange - Callback para cambios en inputs
 * @param {boolean} disabled - Deshabilitar inputs
 */
const ClientFormFields = ({ formData, onInputChange, disabled = false }) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        {/* Nombre */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre *</Text>
          <View style={styles.inputContainer}>
            <Icon name="account" size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="Nombre del cliente"
              value={formData.nombre}
              onChangeText={(text) => onInputChange('nombre', text)}
              editable={!disabled}
            />
          </View>
        </View>

        {/* Teléfono */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono *</Text>
          <View style={styles.inputContainer}>
            <Icon name="phone" size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="Número de teléfono"
              value={formData.telefono}
              onChangeText={(text) => onInputChange('telefono', text)}
              keyboardType="phone-pad"
              editable={!disabled}
            />
          </View>
        </View>

        {/* Correo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={styles.inputContainer}>
            <Icon name="email" size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              value={formData.correo}
              onChangeText={(text) => onInputChange('correo', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!disabled}
            />
          </View>
        </View>

        {/* Dirección */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dirección</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <Icon name="map-marker" size={20} color="#6b7280" style={styles.textAreaIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Dirección completa"
              value={formData.direccion}
              onChangeText={(text) => onInputChange('direccion', text)}
              multiline
              numberOfLines={3}
              editable={!disabled}
            />
          </View>
        </View>

        <Text style={styles.requiredNote}>* Campos obligatorios</Text>
      </View>
    </ScrollView>
  );
};

export default ClientFormFields;

const styles = StyleSheet.create({
  form: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
  requiredNote: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
