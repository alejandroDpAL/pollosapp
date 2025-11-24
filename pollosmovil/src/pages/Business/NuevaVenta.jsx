import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DraggableModal from '../../components/common/DraggableModal';

const NuevaVenta = ({ visible, onClose }) => {
    const [formData, setFormData] = useState({
        cliente: '',
        producto: '',
        cantidad: '',
        precio_unitario: '',
        observaciones: '',
    });

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };  

    const resetForm = () => {
        setFormData({
            cliente: '',
            producto: '',
            cantidad: '',
            precio_unitario: '',
            observaciones: '',
        });
    };

    const handleGuardar = async () => {
        // Validación
        if (!formData.cliente || !formData.producto || !formData.cantidad || !formData.precio_unitario) {
            Alert.alert("Campos incompletos", "Por favor completa todos los campos obligatorios.");
            return;
        }

        try {

            const valorTotal = parseFloat(formData.cantidad) * parseFloat(formData.precio_unitario);


            const ventaData = {
                ...formData,
                valor_total: valorTotal,
            };

            console.log('Guardar venta:', ventaData);
            // await crearVenta(ventaData);

            Alert.alert("Éxito", "Venta registrada correctamente");
            resetForm();
            onClose();
        } catch (error) {
            Alert.alert("Error", "No se pudo registrar la venta");
            console.error(error);
        }
    };

    const handleCerrar = () => {
        resetForm();
        onClose();
    };

    const calcularTotal = () => {
        if (formData.cantidad && formData.precio_unitario) {
            return (parseFloat(formData.cantidad) * parseFloat(formData.precio_unitario)).toLocaleString('es-CO');
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
            <View style={styles.formContainer}>
                {/* Cliente */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Cliente *</Text>
                    <View style={styles.inputContainer}>
                        <Icon name="account" size={20} color="#6b7280" />
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre del cliente"
                            value={formData.cliente}
                            onChangeText={(text) => handleInputChange('cliente', text)}
                        />
                    </View>
                </View>

                {/* Producto */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Producto / Lote *</Text>
                    <View style={styles.inputContainer}>
                        <Icon name="package-variant" size={20} color="#6b7280" />
                        <TextInput
                            style={styles.input}
                            placeholder="Seleccionar producto"
                            value={formData.producto}
                            onChangeText={(text) => handleInputChange('producto', text)}
                        />
                    </View>
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
                                onChangeText={(text) => handleInputChange('cantidad', text)}
                                keyboardType="numeric"
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
                                onChangeText={(text) => handleInputChange('precio_unitario', text)}
                                keyboardType="numeric"
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
                        <Icon name="note-text" size={20} color="#6b7280" style={styles.textAreaIcon} />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Detalles adicionales de la venta..."
                            value={formData.observaciones}
                            onChangeText={(text) => handleInputChange('observaciones', text)}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>

                {/* Botones */}
                <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.btnCancel} onPress={handleCerrar}>
                        <Text style={styles.btnCancelText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btnSave} onPress={handleGuardar}>
                        <Icon name="check-circle" size={20} color="#fff" />
                        <Text style={styles.btnSaveText}>Registrar Venta</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </DraggableModal>
    );
};

export default NuevaVenta;

const styles = StyleSheet.create({
    formContainer: {
        paddingBottom: 20,
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
});