import React from "react";
import { Modal as RNModal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function Modal({ visible, title, content, onClose, onSave, onCancel }) {
    return (
        <RNModal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>


                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Icon name="close" size={22} color="#555" />
                    </TouchableOpacity>


                    {title && <Text style={styles.title}>{title}</Text>}

                    {/* Contenido */}
                    <View style={styles.content}>
                        {typeof content === "string" ? <Text>{content}</Text> : content}
                    </View>


                    <View style={styles.actions}>
                        <TouchableOpacity
                            onPress={onCancel}
                            style={[styles.actionButton, styles.cancelButton]}
                        >
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onSave}
                            style={[styles.actionButton, styles.saveButton]}
                        >
                            <Text style={styles.saveText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </RNModal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '88%',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 10,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        padding: 6,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        color: '#222',
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    content: {
        marginBottom: 30,
        alignItems: 'stretch',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e2e2',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 14,
        backgroundColor: '#fafafa',
        fontSize: 15,
        color: '#333',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 1,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginLeft: 10,
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    saveButton: {
        backgroundColor: '#2ecc71',
    },
    cancelText: {
        color: '#555',
        fontWeight: '600',
        fontSize: 15,
    },
    saveText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
});

