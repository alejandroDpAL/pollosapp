import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import HeaderPrincipal from '../../components/layout/header.jsx';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import GraphTest from "../../components/common/Graficas.componet.jsx";
import StatCard from "../../components/common/StatCard.jsx";
import { useDashboard } from '../../Hook/hooks/useDashboard.js';
import { useNegocio } from '../../Hook/context/NegocioContext.jsx';
import { useAuth } from '../../Hook/context/AuthContext.jsx';

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 768;
const isLargeDevice = width >= 768;

const Dashboard = ({ navigation }) => {
    const { negocioActivo } = useNegocio();
    const { forceLogoutWithMessage } = useAuth();
    const { stats, chartData, ultimasVentas, loading, error, cargarDatos, procesarDatosEstados, procesarDatosProductos } = useDashboard(negocioActivo?.id, forceLogoutWithMessage);

    const [viewEstadisticas, setViewEstadisticas] = useState(false);
    const [limiteVentas, setLimiteVentas] = useState(5);

    const formatearMoneda = (valor) => {
        return parseFloat(valor).toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <HeaderPrincipal title={negocioActivo?.nombre || "Dashboard"} />
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#0077cc" />
                    <Text style={styles.loaderText}>Cargando estadísticas...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <HeaderPrincipal title={negocioActivo?.nombre || "Dashboard"} />
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={48} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={cargarDatos}>
                        <Icon name="refresh" size={20} color="#fff" />
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const kpis = stats?.kpis || {};
    const inventario = stats?.inventario || {};
    const perdidas = stats?.perdidas || {};

    const resumen = {
        ingresoTotal: kpis.ingresoTotal || 0,
        totalVentas: kpis.totalVentas || 0,
        costoTotal: kpis.costoTotal || 0,
        gananciaNeta: kpis.gananciaNeta || 0,
        totalClientes: kpis.totalClientes || 0,
        totalProductos: 0,
        ventasPendientes: kpis.ventasPendientes || 0,
        ventasCompletadas: kpis.ventasCompletadas || 0
    };

    const lotes = {
        totalLotesActivos: inventario.totalLotes || 0,
        cantidadTotalProducto: inventario.stockTotal || 0
    };

    return (
        <View style={styles.container}>
            <HeaderPrincipal title={negocioActivo?.nombre || "Dashboard"} />

            <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Resumen Principal */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resumen General</Text>

                    <View style={styles.cardRow}>
                        <StatCard
                            icon="cash-multiple"
                            iconColor="#10b981"
                            bgColor="#d1fae5"
                            title="Ingresos"
                            value={formatearMoneda(resumen.ingresoTotal)}
                            subtitle={`${resumen.totalVentas} ventas`}
                        />
                        <StatCard
                            icon="wallet"
                            iconColor="#ef4444"
                            bgColor="#fee2e2"
                            title="Costos"
                            value={formatearMoneda(resumen.costoTotal)}
                            subtitle="Total de egresos"
                        />
                    </View>

                    <StatCard
                        icon="trending-up"
                        iconColor={parseFloat(resumen.gananciaNeta) >= 0 ? "#0077cc" : "#ef4444"}
                        bgColor={parseFloat(resumen.gananciaNeta) >= 0 ? "#eff6ff" : "#fef2f2"}
                        title="Ganancia Neta"
                        value={formatearMoneda(resumen.gananciaNeta)}
                        subtitle="Ingresos - Costos"
                        size="large"
                    />
                </View>

                {/* Gestión de Negocio */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Gestión del Negocio</Text>

                    <View style={styles.cardRow}>
                        <StatCard
                            icon="account-group"
                            iconColor="#1a73e8"
                            bgColor="#d0e8ff"
                            title="Clientes"
                            value={resumen.totalClientes}
                            subtitle="Activos"
                        />
                        <StatCard
                            icon="package-variant-closed"
                            iconColor="#6a1b9a"
                            bgColor="#e6ddff"
                            title="Productos"
                            value={resumen.totalProductos}
                            subtitle="En catálogo"
                        />
                        {isLargeDevice && (
                            <StatCard
                                icon="inbox-multiple"
                                iconColor="#fbbc04"
                                bgColor="#fff3d6"
                                title="Lotes Activos"
                                value={lotes.totalLotesActivos}
                                subtitle={`${lotes.cantidadTotalProducto} unidades`}
                            />
                        )}
                    </View>

                    {!isLargeDevice && (
                        <View style={styles.cardRow}>
                            <StatCard
                                icon="inbox-multiple"
                                iconColor="#fbbc04"
                                bgColor="#fff3d6"
                                title="Lotes Activos"
                                value={lotes.totalLotesActivos}
                                subtitle={`${lotes.cantidadTotalProducto} unidades`}
                            />
                            <StatCard
                                icon="alert-circle"
                                iconColor="#f97316"
                                bgColor="#fed7aa"
                                title="Pérdidas"
                                value={perdidas.cantidadPerdida || 0}
                                subtitle={`${perdidas.totalEventos || 0} eventos`}
                            />
                        </View>
                    )}

                    {isLargeDevice && (
                        <View style={styles.cardRow}>
                            <StatCard
                                icon="alert-circle"
                                iconColor="#f97316"
                                bgColor="#fed7aa"
                                title="Pérdidas"
                                value={perdidas.cantidadPerdida || 0}
                                subtitle={`${perdidas.totalEventos || 0} eventos`}
                            />
                        </View>
                    )}
                </View>

                {/* Estado de Ventas */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Estado de Ventas</Text>

                    <View style={styles.statusContainer}>
                        <View style={styles.statusItem}>
                            <View style={[styles.statusDot, { backgroundColor: '#f59e0b' }]} />
                            <View style={styles.statusTextContainer}>
                                <Text style={styles.statusLabel}>Pendientes</Text>
                                <Text style={styles.statusValue}>{kpis.ventasPendientes || 0}</Text>
                            </View>
                        </View>
                        <View style={styles.statusDivider} />
                        <View style={styles.statusItem}>
                            <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                            <View style={styles.statusTextContainer}>
                                <Text style={styles.statusLabel}>Completadas</Text>
                                <Text style={styles.statusValue}>{kpis.ventasCompletadas || 0}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Gráfico de Ingresos */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ingresos Últimos 7 Días</Text>
                    {chartData?.length > 0 ? (
                        <GraphTest
                            data={chartData}
                            type="line"
                            title="Ingresos por Día"
                        />
                    ) : (
                        <View style={styles.noMovementsContainer}>
                            <Icon name="trending-down" size={isSmallDevice ? 40 : 48} color="#d1d5db" />
                            <Text style={styles.noMovementsText}>
                                No se han hecho movimientos estos últimos 7 días
                            </Text>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => navigation.navigate('estadisticas')}
                            >
                                <Icon name="chart-box" size={20} color="#fff" />
                                <Text style={styles.actionButtonText}>Ver más estadísticas</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Estadísticas adicionales */}
                    {viewEstadisticas && ultimasVentas?.length > 0 && (
                        <View style={styles.additionalStats}>
                            <View style={styles.graphContainer}>
                                <Text style={styles.graphTitle}>Estado de Ventas (Últimas 5)</Text>
                                <GraphTest
                                    data={procesarDatosEstados()}
                                    type="bar"
                                    title="Distribución de Estados"
                                />
                            </View>

                            <View style={styles.graphContainer}>
                                <Text style={styles.graphTitle}>Productos Más Vendidos</Text>
                                <GraphTest
                                    data={procesarDatosProductos()}
                                    type="bar"
                                    title="Cantidad por Producto"
                                />
                            </View>
                        </View>
                    )}

                    {ultimasVentas?.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setViewEstadisticas(!viewEstadisticas)}
                            style={styles.toggleButton}
                        >
                            <Text style={styles.toggleButtonText}>
                                {viewEstadisticas ? 'Ocultar' : 'Ver'} estadísticas detalladas
                            </Text>
                            <Icon
                                name={viewEstadisticas ? "chevron-up" : "chevron-down"}
                                size={20}
                                color="#0077cc"
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Últimas Ventas */}
                {ultimasVentas?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Últimas Ventas</Text>
                        {ultimasVentas.slice(0, limiteVentas).map((venta, index) => (
                            <View key={index} style={styles.ventaItem}>
                                <View style={styles.ventaInfo}>
                                    <Text style={styles.ventaCliente} numberOfLines={1}>
                                        {venta.cliente_nombre}
                                    </Text>
                                    <Text style={styles.ventaProducto} numberOfLines={1}>
                                        {venta.producto_nombre || 'Producto'} • {venta.cantidad} unidades
                                    </Text>
                                </View>
                                <View style={styles.ventaMonto}>
                                    <Text style={styles.ventaValor}>
                                        {formatearMoneda(venta.valor_total)}
                                    </Text>
                                    <Text style={[
                                        styles.ventaEstado,
                                        {
                                            color: venta.estado === 'pagado' ? '#10b981' :
                                                venta.estado === 'pendiente' ? '#f59e0b' : '#ef4444'
                                        }
                                    ]}>
                                        {venta.estado}
                                    </Text>
                                </View>
                            </View>
                        ))}

                        {limiteVentas < ultimasVentas.length && (
                            <TouchableOpacity
                                style={styles.verMasButton}
                                onPress={() => setLimiteVentas(prev => prev + 5)}
                            >
                                <Icon name="chevron-down" size={20} color="#0077cc" />
                                <Text style={styles.verMasButtonText}>
                                    Ver más ({ultimasVentas.length - limiteVentas} restantes)
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingHorizontal: isSmallDevice ? 12 : isMediumDevice ? 16 : 24,
        paddingTop: isSmallDevice ? 12 : 16,
        paddingBottom: 100,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 12,
        fontSize: isSmallDevice ? 14 : 16,
        color: '#6b7280',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    errorText: {
        marginTop: 16,
        fontSize: isSmallDevice ? 14 : 16,
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        flexDirection: 'row',
        backgroundColor: '#0077cc',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        gap: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        marginBottom: isSmallDevice ? 20 : 24,
    },
    sectionTitle: {
        fontSize: isSmallDevice ? 16 : isLargeDevice ? 20 : 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: isSmallDevice ? 12 : 16,
    },
    cardRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: isSmallDevice ? 8 : 12,
    },
    statusContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: isSmallDevice ? 12 : 16,
        padding: isSmallDevice ? 12 : 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    statusItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmallDevice ? 8 : 12,
    },
    statusTextContainer: {
        flex: 1,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    statusLabel: {
        fontSize: isSmallDevice ? 11 : 13,
        color: '#9ca3af',
    },
    statusValue: {
        fontSize: isSmallDevice ? 16 : 18,
        fontWeight: '700',
        color: '#1f2937',
        marginTop: 4,
    },
    statusDivider: {
        width: 1,
        backgroundColor: '#e5e7eb',
        marginHorizontal: isSmallDevice ? 12 : 16,
    },
    noMovementsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: isSmallDevice ? 40 : 50,
        gap: isSmallDevice ? 12 : 16,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        paddingHorizontal: isSmallDevice ? 16 : 20,
    },
    noMovementsText: {
        fontSize: isSmallDevice ? 14 : 16,
        color: '#6b7280',
        textAlign: 'center',
        fontWeight: '500',
        marginBottom: 8,
    },
    actionButton: {
        flexDirection: 'row',
        backgroundColor: '#0077cc',
        paddingHorizontal: isSmallDevice ? 16 : 20,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: isSmallDevice ? 14 : 16,
        fontWeight: '600',
    },
    additionalStats: {
        marginTop: 16,
        gap: 16,
    },
    graphContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: isSmallDevice ? 12 : 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    graphTitle: {
        fontSize: isSmallDevice ? 14 : 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 12,
    },
    toggleButton: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
    },
    toggleButtonText: {
        color: '#0077cc',
        fontSize: isSmallDevice ? 12 : 13,
        fontWeight: '500',
    },
    ventaItem: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: isSmallDevice ? 12 : 14,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    ventaInfo: {
        flex: 1,
        marginRight: 12,
    },
    ventaCliente: {
        fontSize: isSmallDevice ? 13 : 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 2,
    },
    ventaProducto: {
        fontSize: isSmallDevice ? 11 : 12,
        color: '#9ca3af',
    },
    ventaMonto: {
        alignItems: 'flex-end',
        gap: 4,
    },
    ventaValor: {
        fontSize: isSmallDevice ? 13 : 14,
        fontWeight: '700',
        color: '#0077cc',
    },
    ventaEstado: {
        fontSize: isSmallDevice ? 10 : 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    verMasButton: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#0077cc',
    },
    verMasButtonText: {
        color: '#0077cc',
        fontSize: isSmallDevice ? 12 : 14,
        fontWeight: '600',
    },
});

export default Dashboard;