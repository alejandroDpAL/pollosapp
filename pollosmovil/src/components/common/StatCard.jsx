import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;
// const isMediumDevice = width >= 375 && width < 768;
const isLargeDevice = width >= 768;

const StatCard = ({
    icon,
    iconColor,
    bgColor,
    title,
    value,
    subtitle,
    size = 'normal',
    customWidth = null
}) => {
    const isLarge = size === 'large';

    // Calcular ancho automáticamente o usar el personalizado
    const cardWidth = customWidth || (isLarge ? '100%' : isLargeDevice ? '31%' : '48%');

    return (
        <View style={[
            styles.card,
            isLarge && styles.cardLarge,
            { width: cardWidth }
        ]}>
            {/* Contenedor del ícono */}
            <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                <Icon
                    name={icon}
                    size={isLarge ? 36 : isSmallDevice ? 24 : 28}
                    color={iconColor}
                />
            </View>

            {/* Contenedor del contenido */}
            <View style={styles.content}>
                {/* Título */}
                <Text style={styles.label}>{title}</Text>

                {/* Valor principal */}
                <Text style={[
                    styles.value,
                    isLarge && styles.valueLarge,
                    isSmallDevice && styles.valueSmall
                ]}>
                    {value}
                </Text>

                {/* Subtítulo opcional */}
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: isSmallDevice ? 12 : 16,
        padding: isSmallDevice ? 12 : 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmallDevice ? 8 : 12,
    },
    cardLarge: {
        paddingVertical: isSmallDevice ? 16 : 20,
    },
    iconContainer: {
        width: isSmallDevice ? 48 : 56,
        height: isSmallDevice ? 48 : 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: isSmallDevice ? 11 : 13,
        color: '#9ca3af',
        marginBottom: 4,
        fontWeight: '500',
    },
    value: {
        fontSize: isSmallDevice ? 16 : 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    valueLarge: {
        fontSize: isSmallDevice ? 20 : 24,
    },
    valueSmall: {
        fontSize: 14,
    },
    subtitle: {
        fontSize: isSmallDevice ? 10 : 12,
        color: '#d1d5db',
        marginTop: 2,
        fontWeight: '400',
    },
});

export default StatCard;
