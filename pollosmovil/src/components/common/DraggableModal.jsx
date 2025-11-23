import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    PanResponder,
    Dimensions,
    ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { height } = Dimensions.get('window');

/**
 * DraggableModal - Modal reutilizable con drag handle
 * 
 * @param {boolean} visible - Controla si el modal está visible
 * @param {function} onClose - Función que se ejecuta al cerrar el modal
 * @param {string} title - Título del modal (opcional)
 * @param {boolean} showHeader - Mostrar header con título y botón cerrar (default: true)
 * @param {React.Node} children - Contenido del modal
 * @param {number} initialHeight - Altura inicial como porcentaje (default: 0.6 = 60%)
 * @param {number} minHeight - Altura mínima como porcentaje (default: 0.3 = 30%)
 * @param {number} maxHeight - Altura máxima como porcentaje (default: 0.95 = 95%)
 * @param {boolean} enableDrag - Habilitar drag handle (default: true)
 * @param {number} closeThreshold - Distancia en px para cerrar al arrastrar (default: 100)
 * @param {object} headerStyle - Estilos personalizados para el header
 * @param {object} contentStyle - Estilos personalizados para el contenido
 */
const DraggableModal = ({
    visible,
    onClose,
    title = '',
    showHeader = true,
    children,
    initialHeight = 0.6,
    minHeight = 0.3,
    maxHeight = 0.95,
    enableDrag = true,
    closeThreshold = 100,
    headerStyle = {},
    contentStyle = {},
}) => {
    const modalHeight = useRef(new Animated.Value(height * initialHeight)).current;
    const [isDragging, setIsDragging] = useState(false);

    // Reiniciar altura cuando se abre el modal
    useEffect(() => {
        if (visible) {
            Animated.spring(modalHeight, {
                toValue: height * initialHeight,
                useNativeDriver: false,
                tension: 50,
                friction: 7,
            }).start();
        }
    }, [visible]);

    // PanResponder para manejar el drag
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => enableDrag,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return enableDrag && Math.abs(gestureState.dy) > 5;
            },
            onPanResponderGrant: () => {
                setIsDragging(true);
            },
            onPanResponderMove: (_, gestureState) => {
                const newHeight = height * initialHeight - gestureState.dy;
                if (newHeight >= height * minHeight && newHeight <= height * maxHeight) {
                    modalHeight.setValue(newHeight);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                setIsDragging(false);

                // Si arrastra hacia abajo más del threshold, cerrar modal
                if (gestureState.dy > closeThreshold) {
                    Animated.timing(modalHeight, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: false,
                    }).start(() => {
                        onClose();
                    });
                } else {
                    // Snap a altura más cercana
                    const currentHeight = height * initialHeight - gestureState.dy;
                    const midPoint = (height * minHeight + height * maxHeight) / 2;
                    const targetHeight = currentHeight > midPoint ? height * maxHeight : height * initialHeight;

                    Animated.spring(modalHeight, {
                        toValue: targetHeight,
                        useNativeDriver: false,
                        tension: 50,
                        friction: 7,
                    }).start();
                }
            },
        })
    ).current;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View style={[styles.modalContainer, { height: modalHeight }, contentStyle]}>
                    {/* Drag Handle */}
                    {enableDrag && (
                        <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
                            <View style={styles.dragHandle} />
                        </View>
                    )}

                    {/* Header opcional */}
                    {showHeader && (
                        <View style={[styles.header, headerStyle]}>
                            <Text style={styles.title}>{title}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Contenido del modal */}
                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={!isDragging}
                    >
                        {children}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default DraggableModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    dragHandleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#d1d5db',
        borderRadius: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    contentContainer: {
        paddingBottom: 40,
    },
});