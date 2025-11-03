import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const ModalAlert = ({
    visible = false,
    title = "Alerta",
    message = "",
    type = "info",
    onClose,
    onConfirm,
}) => {
    const getTypeConfig = () => {
        switch (type) {
            case "error":
                return { color: "#EF4444", icon: "alert-circle-outline" };
            case "success":
                return { color: "#10B981", icon: "check-circle-outline" };
            case "warning":
                return { color: "#F59E0B", icon: "alert-outline" };
            default:
                return { color: "#3B82F6", icon: "information-outline" };
        }
    };

    const { color, icon } = getTypeConfig();

    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, styles.shadow]}>
                    {/* Ícono + título */}
                    <View style={styles.header}>
                        <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
                            <Icon name={icon} size={30} color={color} />
                        </View>
                        <Text style={[styles.title, { color }]}>{title}</Text>
                    </View>

                    {/* Mensaje */}
                    <Text style={styles.message}>{message}</Text>

                    {/* Botones */}
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={[styles.button, styles.cancelButton]}
                        >
                            <Text style={styles.cancelText}>Cerrar</Text>
                        </TouchableOpacity>

                        {onConfirm && (
                            <TouchableOpacity
                                onPress={onConfirm}
                                style={[
                                    styles.button,
                                    { backgroundColor: color },
                                ]}
                            >
                                <Text style={styles.confirmText}>Aceptar</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    container: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        paddingVertical: 24,
        paddingHorizontal: 22,
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
    },
    message: {
        fontSize: 15,
        lineHeight: 22,
        color: "#374151",
        marginBottom: 24,
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    button: {
        minWidth: 90,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#F3F4F6",
        marginRight: 8,
    },
    cancelText: {
        color: "#374151",
        fontWeight: "600",
    },
    confirmText: {
        color: "#fff",
        fontWeight: "600",
    },
});

export default ModalAlert;
