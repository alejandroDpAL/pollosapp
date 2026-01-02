import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import HeaderPrincipal from '../../components/layout/header.jsx';
import Menu from '../../components/common/bottom.navigation.jsx';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import GraphTest from "../../components/common/Graficas.componet.jsx";
import { getEstadisticasNegocio, getVentasPorDia, getUltimasVentas } from '../../Hook/Api/DashboardApi.js';
import { useNegocio } from '../../Hook/context/NegocioContext.jsx';
import { useAuth } from '../../Hook/context/AuthContext.jsx';

const { width } = Dimensions.get("window");

const Dashboard = ({ navigation }) => {
    const { negocioActivo } = useNegocio();
    const { forceLogoutWithMessage } = useAuth();
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [ultimasVentas, setUltimasVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (negocioActivo?.id) {
            cargarDatos();
        }
    }, [negocioActivo]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Cargar stats primero (obligatorio)
            const statsData = await getEstadisticasNegocio(negocioActivo.id);
            setStats(statsData?.data || statsData);
            
            // Cargar gráfico sin bloquear (no es obligatorio)
            const chartDataResult = await getVentasPorDia(negocioActivo.id, 7);
            setChartData(chartDataResult || []);
            
            // Cargar últimas ventas
            const ventasData = await getUltimasVentas(negocioActivo.id, 5);
            setUltimasVentas(ventasData || []);
            
        } catch (error) {
            console.error('Error al cargar datos:', error);
            if (error?.response?.status === 401) {
                await forceLogoutWithMessage('Tu sesión ha sido cerrada. Vuelve a iniciar sesión.');
            } else {
                setError('No se pudieron cargar los datos del dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatearMoneda = (valor) => {
        return parseFloat(valor).toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    const StatCard = ({ icon, iconColor, bgColor, title, value, subtitle, size = 'normal' }) => {
        const isLarge = size === 'large';
        return (
            <View style={[styles.statCard, isLarge && styles.statCardLarge, { width: isLarge ? '100%' : '48%' }]}>
                <View style={[styles.statIconContainer, { backgroundColor: bgColor }]}>
                    <Icon name={icon} size={isLarge ? 36 : 28} color={iconColor} />
                </View>
                <View style={styles.statContent}>
                    <Text style={styles.statLabel}>{title}</Text>
                    <Text style={[styles.statValue, isLarge && styles.statValueLarge]}>
                        {value}
                    </Text>
                    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
                </View>
            </View>
        );
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

    // Adaptar estructura del backend a la esperada por el componente
    const kpis = stats?.kpis || {};
    const inventario = stats?.inventario || {};
    const perdidas = stats?.perdidas || {};
    
    // Crear objeto resumen compatible
    const resumen = {
        ingresoTotal: kpis.ingresoTotal || 0,
        totalVentas: kpis.totalVentas || 0,
        costoTotal: kpis.costoTotal || 0,
        gananciaNeta: kpis.gananciaNeta || 0,
        totalClientes: kpis.totalClientes || 0,
        totalProductos: 0, // No disponible en el backend actual
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
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Resumen Principal */}
                <View style={styles.summarySection}>
                    <Text style={styles.sectionTitle}>Resumen General</Text>
                    
                    {/* Fila 1: Ingresos y Costos */}
                    <View style={styles.cardRow}>
                        <StatCard
                            icon="cash-multiple"
                            iconColor="#10b981"
                            bgColor="#d1fae5"
                            title="Ingresos"
                            value={formatearMoneda(resumen.ingresoTotal || 0)}
                            subtitle={`${resumen.totalVentas || 0} ventas`}
                            size="normal"
                        />
                        <StatCard
                            icon="wallet"
                            iconColor="#ef4444"
                            bgColor="#fee2e2"
                            title="Costos"
                            value={formatearMoneda(resumen.costoTotal || 0)}
                            subtitle={`Total de egresos`}
                            size="normal"
                        />
                    </View>

                    {/* Fila 2: Ganancia Neta (Grande) */}
                    <StatCard
                        icon="trending-up"
                        iconColor={parseFloat(resumen.gananciaNeta) >= 0 ? "#0077cc" : "#ef4444"}
                        bgColor={parseFloat(resumen.gananciaNeta) >= 0 ? "#eff6ff" : "#fef2f2"}
                        title="Ganancia Neta"
                        value={formatearMoneda(resumen.gananciaNeta || 0)}
                        subtitle={`Ingresos - Costos`}
                        size="large"
                    />
                </View>

                {/* Gestión de Negocio */}
                <View style={styles.summarySection}>
                    <Text style={styles.sectionTitle}>Gestión del Negocio</Text>
                    
                    <View style={styles.cardRow}>
                        <StatCard
                            icon="account-group"
                            iconColor="#1a73e8"
                            bgColor="#d0e8ff"
                            title="Clientes"
                            value={resumen.totalClientes || 0}
                            subtitle="Activos"
                            size="normal"
                        />
                        <StatCard
                            icon="package-variant-closed"
                            iconColor="#6a1b9a"
                            bgColor="#e6ddff"
                            title="Productos"
                            value={resumen.totalProductos || 0}
                            subtitle="En catálogo"
                            size="normal"
                        />
                    </View>

                    <View style={styles.cardRow}>
                        <StatCard
                            icon="inbox-multiple"
                            iconColor="#fbbc04"
                            bgColor="#fff3d6"
                            title="Lotes Activos"
                            value={lotes.totalLotesActivos || 0}
                            subtitle={`${lotes.cantidadTotalProducto || 0} unidades`}
                            size="normal"
                        />
                        <StatCard
                            icon="alert-circle"
                            iconColor="#f97316"
                            bgColor="#fed7aa"
                            title="Pérdidas"
                            value={perdidas.cantidadPerdida || 0}
                            subtitle={`${perdidas.totalEventos || 0} eventos`}
                            size="normal"
                        />
                    </View>
                </View>

                {/* Estado de Ventas */}
                <View style={styles.summarySection}>
                    <Text style={styles.sectionTitle}>Estado de Ventas</Text>
                    
                    <View style={styles.statusContainer}>
                        <View style={styles.statusItem}>
                            <View style={[styles.statusDot, { backgroundColor: '#f59e0b' }]} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.statusLabel}>Pendientes</Text>
                                <Text style={styles.statusValue}>{kpis.ventasPendientes || 0}</Text>
                            </View>
                        </View>
                        <View style={styles.statusDivider} />
                        <View style={styles.statusItem}>
                            <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.statusLabel}>Completadas</Text>
                                <Text style={styles.statusValue}>{kpis.ventasCompletadas || 0}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Gráfico */}
                <View style={styles.graphSection}>
                    <Text style={styles.sectionTitle}>Ingresos Últimos 7 Días</Text>
                    {chartData && chartData.length > 0 ? (
                        <GraphTest 
                            data={chartData} 
                            type="line"
                            title="Ingresos por Día"
                        />
                    ) : (
                        <View style={styles.noMovementsContainer}>
                            <Icon name="trending-down" size={48} color="#d1d5db" />
                            <Text style={styles.noMovementsText}>No se ha hecho movimientos estos últimos 7 días</Text>
                            <TouchableOpacity 
                                style={styles.statsButton}
                                onPress={() => navigation.navigate('estadisticas')}
                            >
                                <Icon name="chart-box" size={20} color="#fff" />
                                <Text style={styles.statsButtonText}>Ver más estadísticas</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Últimas Ventas */}
                {ultimasVentas && ultimasVentas.length > 0 && (
                    <View style={styles.summarySection}>
                        <Text style={styles.sectionTitle}>Últimas Ventas</Text>
                        {ultimasVentas.slice(0, 5).map((venta, index) => (
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
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default Dashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 12,
        fontSize: 16,
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
        fontSize: 16,
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 16,
    },
    summarySection: {
        marginBottom: 24,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 12,
    },
    statCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statCardLarge: {
        flexDirection: 'row',
        paddingVertical: 20,
    },
    statIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        fontSize: 13,
        color: '#9ca3af',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    statValueLarge: {
        fontSize: 24,
    },
    statSubtitle: {
        fontSize: 12,
        color: '#d1d5db',
        marginTop: 2,
    },
    graphSection: {
        marginBottom: 24,
    },
    statusContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
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
        gap: 12,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    statusLabel: {
        fontSize: 13,
        color: '#9ca3af',
    },
    statusValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginTop: 4,
    },
    statusDivider: {
        width: 1,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 16,
    },
    ventaItem: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 14,
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
    },
    ventaCliente: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 2,
    },
    ventaProducto: {
        fontSize: 12,
        color: '#9ca3af',
    },
    ventaMonto: {
        alignItems: 'flex-end',
        gap: 4,
    },
    ventaValor: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0077cc',
    },
    ventaEstado: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    noDataContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        gap: 8,
    },
    noDataText: {
        fontSize: 14,
        color: '#9ca3af',
    },
    noMovementsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
        gap: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        paddingHorizontal: 20,
    },
    noMovementsText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        fontWeight: '500',
        marginBottom: 8,
    },
    statsButton: {
        flexDirection: 'row',
        backgroundColor: '#0077cc',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    statsButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
