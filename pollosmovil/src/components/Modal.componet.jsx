import React from "react";
import { Modal as RNModal, View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function Modal({ visible, title, content, onClose, actions }) {
    return (
        <RNModal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {title && <Text style={styles.title}>{title}</Text>}

                    <View style={styles.content}>
                        {typeof content === "string" ? <Text>{content}</Text> : content}
                    </View>

                    <View style={styles.actions}>
                        {actions ? actions : (
                            <TouchableOpacity onPress={onClose} style={styles.defaultButton}>
                                <Text style={styles.defaultButtonText}>Cerrar</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </RNModal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
        color: '#222',
    },
    content: {
        marginBottom: 20,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    defaultButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#ff6b6b',
        borderRadius: 10,
    },
    defaultButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});
