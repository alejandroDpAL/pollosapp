import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  PixelRatio,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderPrincipal from "../../components/layout/header";
import { LineChart, BarChart, PieChart, ProgressChart } from "react-native-chart-kit";
import { getEstadisticasNegocio, getVentasPorDia, getUltimasVentas } from "../../Hook/Api/DashboardApi";
import { useAuth } from "../../Hook/context/AuthContext.jsx";
import { useNegocio } from "../../Hook/context/NegocioContext.jsx";

const Estadisticas = ({ navigation }) => {
  const { user, forceLogoutWithMessage } = useAuth();
  const { negocioActivo } = useNegocio();

  // Screen dimensions
  const screenData = Dimensions.get('window');
  const { width: screenWidth, height: screenHeight } = screenData;

  const [estadisticas, setEstadisticas] = React.useState(null);
  const [chartData, setChartData] = React.useState([]);
  const [ultimasVentas, setUltimasVentas] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const cargarEstadisticas = async () => {
   
    
    if (!negocioActivo?.id) {
      setError('No hay negocio activo seleccionado');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Cargar estadísticas generales
      const statsResponse = await getEstadisticasNegocio(negocioActivo.id);
      
      if (statsResponse.data) {
        setEstadisticas(statsResponse.data);
      } else {
        setError('No se recibieron datos del servidor');
      }
      
      // Cargar datos para gráfico de ventas (últimos 7 días)
      const chartResponse = await getVentasPorDia(negocioActivo.id, 7);
      
      if (chartResponse && Array.isArray(chartResponse)) {
        setChartData(chartResponse);
      }

      // Cargar últimas ventas
      const ventasResponse = await getUltimasVentas(negocioActivo.id, 10);
      
      if (ventasResponse && Array.isArray(ventasResponse)) {
        setUltimasVentas(ventasResponse);
      }
    } catch (error) {
      
      setError(`Error: ${error.message}`);
      
      if (error.response?.status === 401) {
        forceLogoutWithMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (negocioActivo?.id) {
      cargarEstadisticas();
    }
  }, [negocioActivo?.id]);

  // Responsive font scaling
  const scaleFont = (size) => {
    const scale = screenWidth / 375;
    const newSize = size * scale;
    const fontScale = PixelRatio.getFontScale();
    if (fontScale > 1.2) {
      return Math.max(newSize / fontScale, size * 0.85);
    }
    return Math.min(Math.max(newSize, size * 0.8), size * 1.3);
  };

  // Chart width calculation (considerando padding del ScrollView)
  const getChartWidth = () => {
    return screenWidth - 48; // 16px padding left + 16px padding right + 16px margin
  };

  // Chart height calculation
  const getChartHeight = () => {
    const baseHeight = screenHeight * 0.22;
    return Math.min(Math.max(baseHeight, 160), 240);
  };

  // Responsive padding
  const getResponsivePadding = (percentage) => {
    const calculated = screenWidth * percentage;
    return Math.max(calculated, 10);
  };

  // Formatear moneda
  const formatCurrency = (value) => {
    return `$${parseFloat(value || 0).toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  // Generar datos para ventas de últimos 7 días desde el backend
  const getVentasSemanalesData = () => {
    if (!chartData || chartData.length === 0) {
      return {
        labels: ["L", "M", "M", "J", "V", "S", "D"],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
      };
    }

    return {
      labels: chartData.map(item => item.label),
      datasets: [{
        data: chartData.map(item => item.value),
        color: (opacity = 1) => `rgba(0, 119, 204, ${opacity})`,
        strokeWidth: 3
      }]
    };
  };

  // Generar datos para gráfica de distribución por estado
  const getDistribucionEstadosData = () => {
    if (!estadisticas?.distribucionEstados || estadisticas.distribucionEstados.length === 0) {
      return [];
    }

    const colores = {
      'realizada': '#10b981',
      'pagado': '#22c55e',
      'pendiente': '#f59e0b',
      'parcial': '#3b82f6',
      'anulado': '#ef4444'
    };

    return estadisticas.distribucionEstados.map(item => ({
      name: item.estado.charAt(0).toUpperCase() + item.estado.slice(1),
      population: parseFloat(item.porcentaje) || 0,
      color: colores[item.estado] || '#64748b',
      legendFontColor: '#0f172a',
      legendFontSize: scaleFont(12)
    }));
  };

  // Generar datos para gráfica de tendencia mensual
  const getTendenciaMensualData = () => {
    if (!estadisticas?.tendenciaMensual || estadisticas.tendenciaMensual.length === 0) {
      return {
        labels: ["Sin datos"],
        datasets: [{ data: [0] }]
      };
    }

    const ultimos7 = estadisticas.tendenciaMensual.slice(-7);
    return {
      labels: ultimos7.map(item => {
        const fecha = new Date(item.fecha);
        return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
      }),
      datasets: [{
        data: ultimos7.map(item => parseFloat(item.ingresos)),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  // Generar datos para indicadores de progreso
  const getIndicadoresProgreso = () => {
    if (!estadisticas?.kpis) return { labels: [], data: [] };

    // Normalizar valores entre 0 y 1
    const margen = Math.min(Math.max(parseFloat(estadisticas.kpis.margenGanancia) / 100, 0), 1);
    const conversionClientes = Math.min(Math.max(parseFloat(estadisticas.kpis.tasaConversion) / 100, 0), 1);
    const eficienciaVentas = estadisticas.kpis.totalVentas > 0 
      ? Math.min(parseFloat(estadisticas.kpis.ventasCompletadas) / parseFloat(estadisticas.kpis.totalVentas), 1)
      : 0;

    return {
      labels: ["Margen", "Conversión", "Eficiencia"],
      data: [margen, conversionClientes, eficienciaVentas]
    };
  };

  // Chart configuration
  const createChartConfig = (color) => ({
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => color,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: { borderRadius: 12 },
    propsForLabels: {
      fontSize: Math.max(scaleFont(10), 9)
    },
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false
  });

  const chartWidth = getChartWidth();
  const chartHeight = getChartHeight();

  // Componente KPI visual
  const KPICard = ({ icon, title, value, subtitle, color = "#0077cc", trend }) => {
    const trendValue = trend !== undefined && trend !== null ? parseFloat(trend) : null;
    const showTrend = trendValue !== null && !isNaN(trendValue);
    
    return (
      <View style={[styles.kpiCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
        <View style={styles.kpiHeader}>
          <View style={[styles.kpiIcon, { backgroundColor: color + '15' }]}>
            <Icon name={icon} size={24} color={color} />
          </View>
          {showTrend && (
            <View style={styles.kpiTrend}>
              <Icon 
                name={trendValue > 0 ? "trending-up" : "trending-down"} 
                size={16} 
                color={trendValue > 0 ? "#10b981" : "#ef4444"} 
              />
              <Text style={[styles.kpiTrendText, { color: trendValue > 0 ? "#10b981" : "#ef4444" }]}>
                {Math.abs(trendValue).toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.kpiValue, { fontSize: scaleFont(24), color }]}>{value}</Text>
        <Text style={[styles.kpiTitle, { fontSize: scaleFont(11) }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.kpiSubtitle, { fontSize: scaleFont(10) }]}>{subtitle}</Text>
        )}
      </View>
    );
  };

  // Chart section component
  const ChartCard = ({ title, children, onViewMore }) => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { fontSize: scaleFont(16) }]}>{title}</Text>
        {onViewMore && (
          <TouchableOpacity onPress={onViewMore} style={styles.viewMoreBtn}>
            <Text style={[styles.viewMoreText, { fontSize: scaleFont(13) }]}>Ver más</Text>
            <Icon name="chevron-right" size={18} color="#0077cc" />
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <HeaderPrincipal title="Estadísticas" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0077cc" />
          <Text style={[styles.loadingText, { fontSize: scaleFont(15) }]}>
            Cargando estadísticas...
          </Text>
        </View>
      </View>
    );
  }

  // No data state
  if (!estadisticas) {
    return (
      <View style={styles.container}>
        <HeaderPrincipal title="Estadísticas" />
        <View style={styles.loadingContainer}>
          <Icon name="chart-box-outline" size={64} color="#cbd5e1" />
          <Text style={[styles.emptyText, { fontSize: scaleFont(15) }]}>
            {error || 'No hay datos disponibles'}
          </Text>
          <Text style={[styles.errorDetails, { fontSize: scaleFont(13) }]}>
            {!negocioActivo?.id 
              ? 'Por favor selecciona un negocio' 
              : error 
                ? 'Revisa la consola para más detalles'
                : 'Necesitas crear productos, lotes y ventas primero'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={cargarEstadisticas}
          >
            <Icon name="refresh" size={20} color="#ffffff" />
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const ventasSemanalesData = getVentasSemanalesData();
  const distribucionEstadosData = getDistribucionEstadosData();
  const tendenciaMensualData = getTendenciaMensualData();
  const indicadoresProgreso = getIndicadoresProgreso();

  return (
    <View style={styles.container}>
      <HeaderPrincipal title="Estadísticas" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingHorizontal: getResponsivePadding(0.04) }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* KPIs Principales */}
        <View style={styles.kpisSection}>
          <Text style={[styles.sectionTitle, { fontSize: scaleFont(18) }]}>
            Indicadores Clave
          </Text>
          
          <View style={styles.kpisGrid}>
            <KPICard
              icon="cash-multiple"
              title="INGRESOS TOTALES"
              value={formatCurrency(estadisticas.kpis.ingresoTotal)}
              subtitle={`Ticket promedio: ${formatCurrency(estadisticas.kpis.ticketPromedio)}`}
              color="#10b981"
            />
            
            <KPICard
              icon="chart-line"
              title="GANANCIA NETA"
              value={formatCurrency(estadisticas.kpis.gananciaNeta)}
              subtitle={`Margen: ${estadisticas.kpis.margenGanancia}%`}
              color="#0077cc"
            />
            
            <KPICard
              icon="receipt"
              title="COSTOS"
              value={formatCurrency(estadisticas.kpis.costoTotal)}
              subtitle="Últimos 30 días"
              color="#f59e0b"
            />
            
            <KPICard
              icon="account-check"
              title="CLIENTES ACTIVOS"
              value={estadisticas.kpis.clientesActivos}
              subtitle={`De ${estadisticas.kpis.totalClientes} totales`}
              color="#8b5cf6"
            />
            
            {estadisticas.crecimiento && (
              <KPICard
                icon="trending-up"
                title="CRECIMIENTO VENTAS"
                value={`${estadisticas.crecimiento.crecimientoVentas > 0 ? '+' : ''}${estadisticas.crecimiento.crecimientoVentas}%`}
                subtitle="vs mes anterior"
                color={estadisticas.crecimiento.crecimientoVentas >= 0 ? "#10b981" : "#ef4444"}
                trend={estadisticas.crecimiento.crecimientoVentas}
              />
            )}
            
            {estadisticas.inventario && (
              <KPICard
                icon="sync"
                title="ROTACIÓN INVENTARIO"
                value={estadisticas.inventario.rotacionInventario}
                subtitle={`${estadisticas.inventario.diasPromedioInventario} días promedio`}
                color="#3b82f6"
              />
            )}
          </View>
        </View>

        {/* Indicadores de Rendimiento */}
        <ChartCard title="Indicadores de Rendimiento">
          {indicadoresProgreso.data.length > 0 ? (
            <>
              <ProgressChart
                data={indicadoresProgreso}
                width={chartWidth}
                height={220}
                strokeWidth={16}
                radius={32}
                chartConfig={{
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  color: (opacity = 1, index) => {
                    const colors = ["rgba(16, 185, 129, 1)", "rgba(139, 92, 246, 1)", "rgba(0, 119, 204, 1)"];
                    return colors[index] || `rgba(0, 119, 204, ${opacity})`;
                  },
                  labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                  style: { borderRadius: 12 }
                }}
                hideLegend={false}
                style={styles.chart}
              />
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.legendText}>Margen de Ganancia: {estadisticas.kpis.margenGanancia}%</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#8b5cf6' }]} />
                  <Text style={styles.legendText}>Conversión Clientes: {estadisticas.kpis.tasaConversion}%</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#0077cc' }]} />
                  <Text style={styles.legendText}>Eficiencia Ventas: {((estadisticas.kpis.ventasCompletadas / Math.max(estadisticas.kpis.totalVentas, 1)) * 100).toFixed(1)}%</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Icon name="chart-box-outline" size={48} color="#cbd5e1" />
              <Text style={styles.noDataText}>Sin datos suficientes para mostrar indicadores</Text>
            </View>
          )}
        </ChartCard>

        {/* Tendencia de Ingresos */}
        <ChartCard 
          title="Tendencia de Ingresos (Últimos 7 Días)"
          onViewMore={() => {/* Ver análisis completo */}}
        >
          {tendenciaMensualData.datasets[0].data.length > 0 && 
           tendenciaMensualData.datasets[0].data.some(v => v > 0) ? (
            <LineChart
              data={tendenciaMensualData}
              width={chartWidth}
              height={chartHeight}
              chartConfig={createChartConfig("rgba(16, 185, 129, 1)")}
              bezier
              style={styles.chart}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              withInnerLines={true}
              withOuterLines={false}
              withDots={true}
              withShadow={false}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Icon name="chart-line" size={48} color="#cbd5e1" />
              <Text style={styles.noDataText}>No hay ventas en los últimos 7 días</Text>
            </View>
          )}
        </ChartCard>

        {/* Distribución de Ventas por Estado */}
        {distribucionEstadosData.length > 0 && (
          <ChartCard title="Distribución por Estado de Ventas">
            <PieChart
              data={distribucionEstadosData}
              width={chartWidth}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute={false}
              hasLegend={true}
              style={styles.chart}
            />
          </ChartCard>
        )}

        {/* Ventas Semanales */}
        <ChartCard 
          title="Ventas de los Últimos 7 Días"
          onViewMore={() => {/* Ver más detalles */}}
        >
          <LineChart
            data={ventasSemanalesData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={createChartConfig("rgba(0, 119, 204, 1)")}
            bezier
            style={styles.chart}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withInnerLines={false}
            withOuterLines={false}
            withDots={true}
            withShadow={false}
          />
        </ChartCard>

        {/* Métricas de Inventario */}
        {estadisticas.inventario && (
          <View style={styles.inventarioCard}>
            <Text style={[styles.chartTitle, { fontSize: scaleFont(16), marginBottom: 16 }]}>
              Estado del Inventario
            </Text>
            <View style={styles.inventarioGrid}>
              <View style={styles.inventarioItem}>
                <Icon name="archive-outline" size={32} color="#3b82f6" />
                <Text style={[styles.inventarioValue, { color: '#3b82f6' }]}>
                  {estadisticas.inventario.stockTotal}
                </Text>
                <Text style={styles.inventarioLabel}>En Stock</Text>
              </View>
              <View style={styles.inventarioItem}>
                <Icon name="archive-check" size={32} color="#10b981" />
                <Text style={[styles.inventarioValue, { color: '#10b981' }]}>
                  {estadisticas.inventario.vendidoTotal}
                </Text>
                <Text style={styles.inventarioLabel}>Vendidos</Text>
              </View>
              <View style={styles.inventarioItem}>
                <Icon name="sync" size={32} color="#0077cc" />
                <Text style={[styles.inventarioValue, { color: '#0077cc' }]}>
                  {estadisticas.inventario.rotacionInventario}x
                </Text>
                <Text style={styles.inventarioLabel}>Rotación</Text>
              </View>
              <View style={styles.inventarioItem}>
                <Icon name="calendar-clock" size={32} color="#8b5cf6" />
                <Text style={[styles.inventarioValue, { color: '#8b5cf6' }]}>
                  {estadisticas.inventario.diasPromedioInventario}
                </Text>
                <Text style={styles.inventarioLabel}>Días Promedio</Text>
              </View>
              {estadisticas.perdidas.cantidadPerdida > 0 && (
                <>
                  <View style={styles.inventarioItem}>
                    <Icon name="alert-circle" size={32} color="#ef4444" />
                    <Text style={[styles.inventarioValue, { color: '#ef4444' }]}>
                      {estadisticas.perdidas.cantidadPerdida}
                    </Text>
                    <Text style={styles.inventarioLabel}>Pérdidas</Text>
                  </View>
                  <View style={styles.inventarioItem}>
                    <Icon name="percent" size={32} color="#f59e0b" />
                    <Text style={[styles.inventarioValue, { color: '#f59e0b' }]}>
                      {estadisticas.inventario.tasaMortalidad}%
                    </Text>
                    <Text style={styles.inventarioLabel}>Mortalidad</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Últimas Ventas - Nueva Sección */}
        {ultimasVentas && ultimasVentas.length > 0 && (
          <View style={styles.ultimasVentasCard}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { fontSize: scaleFont(16) }]}>
                Últimas Ventas Realizadas
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('VentasTab')}
                style={styles.viewMoreBtn}
              >
                <Text style={[styles.viewMoreText, { fontSize: scaleFont(13) }]}>Ver todas</Text>
                <Icon name="chevron-right" size={18} color="#0077cc" />
              </TouchableOpacity>
            </View>
            
            {ultimasVentas.map((venta, index) => {
              const fecha = new Date(venta.fecha);
              const estadoColors = {
                'realizada': '#10b981',
                'pagado': '#22c55e',
                'pendiente': '#f59e0b',
                'parcial': '#3b82f6',
                'anulado': '#ef4444'
              };
              const estadoColor = estadoColors[venta.estado] || '#64748b';

              return (
                <View key={venta.id || index} style={styles.ventaItem}>
                  <View style={styles.ventaHeader}>
                    <View style={styles.ventaLeft}>
                      <Icon name="receipt-text" size={20} color="#0077cc" />
                      <View style={styles.ventaInfo}>
                        <Text style={styles.ventaProducto}>{venta.producto_nombre}</Text>
                        <Text style={styles.ventaDetalle}>
                          {venta.lote_nombre ? `Lote: ${venta.lote_nombre}` : `Lote ID: ${venta.lote_id}`} • {venta.cantidad} unidades
                        </Text>
                      </View>
                    </View>
                    <View style={styles.ventaRight}>
                      <Text style={styles.ventaMonto}>
                        ${parseFloat(venta.valor_total).toLocaleString('es-CO')}
                      </Text>
                      <View style={[styles.estadoBadge, { backgroundColor: estadoColor + '20' }]}>
                        <Text style={[styles.estadoText, { color: estadoColor }]}>
                          {venta.estado}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.ventaFooter}>
                    <View style={styles.ventaCliente}>
                      <Icon name="account" size={14} color="#64748b" />
                      <Text style={styles.ventaClienteText}>
                        {venta.cliente_nombre || 'Sin cliente'}
                      </Text>
                    </View>
                    <View style={styles.ventaFecha}>
                      <Icon name="calendar" size={14} color="#64748b" />
                      <Text style={styles.ventaFechaText}>
                        {fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: Math.max(screenHeight * 0.08, 50) }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  emptyText: {
    marginTop: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  errorDetails: {
    marginTop: 8,
    color: "#94a3b8",
    fontWeight: "400",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0077cc",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
  },
  kpisSection: {
    marginBottom: 16,
  },
  kpisGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  kpiIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  kpiTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  kpiTrendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  kpiValue: {
    fontWeight: "800",
    marginBottom: 4,
  },
  kpiTitle: {
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  kpiSubtitle: {
    color: "#94a3b8",
    fontWeight: "400",
  },
  summarySection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden', // Evitar que el contenido se salga
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },
  viewMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewMoreText: {
    color: "#0077cc",
    fontWeight: "600",
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
    marginLeft: -8, // Ajuste para compensar padding interno del chart
  },
  legendContainer: {
    marginTop: 16,
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  inventarioCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inventarioGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  inventarioItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inventarioValue: {
    fontSize: 24,
    fontWeight: "800",
    marginVertical: 8,
  },
  inventarioLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    textAlign: "center",
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  noDataText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
    textAlign: "center",
  },
  // Estilos para últimas ventas
  ultimasVentasCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  ventaItem: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  ventaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  ventaLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 10,
  },
  ventaInfo: {
    flex: 1,
  },
  ventaProducto: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  ventaDetalle: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  ventaRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  ventaMonto: {
    fontSize: 16,
    fontWeight: "800",
    color: "#10b981",
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  ventaFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  ventaCliente: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  ventaClienteText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  ventaFecha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ventaFechaText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
});

export default Estadisticas;