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
import { LineChart, BarChart } from "react-native-chart-kit";
import { GetReporteLoteId_Usario } from "../../Hook/Api/Estadisticas";
import { useAuth } from "../../Hook/context/AuthContext";

const Estadisticas = ({ navigation }) => {
  const { user } = useAuth();

  // Screen dimensions
  const screenData = Dimensions.get('window');
  const { width: screenWidth, height: screenHeight } = screenData;

  const [reporteData, setReporteData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const fetchReporteLoteGeneral = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await GetReporteLoteId_Usario(user.id);
      setReporteData(data);
    } catch (error) {
      console.log("Error fetching reporte lote general:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user?.id) {
      fetchReporteLoteGeneral();
    }
  }, [user?.id]);

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

  // Chart width calculation
  const getChartWidth = () => {
    const padding = screenWidth * 0.1;
    return screenWidth - padding;
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

  // Generar datos simulados para ventas de últimos 7 días
  const getVentasSemanalesData = () => {
    if (!reporteData?.resumen) {
      return {
        labels: ["L", "M", "M", "J", "V", "S", "D"],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
      };
    }

    // Simular distribución de ventas en la semana
    const totalVentas = parseFloat(reporteData.resumen.total_ventas);
    const ventaPromedio = totalVentas / 7;
    
    return {
      labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      datasets: [{
        data: [
          ventaPromedio * 0.8,
          ventaPromedio * 0.9,
          ventaPromedio * 1.1,
          ventaPromedio * 1.0,
          ventaPromedio * 1.3,
          ventaPromedio * 1.4,
          ventaPromedio * 0.9
        ].map(v => Math.round(v)),
        color: (opacity = 1) => `rgba(0, 119, 204, ${opacity})`,
        strokeWidth: 3
      }]
    };
  };

  // Generar datos para top 3 productos
  const getTop3ProductosData = () => {
    if (!reporteData?.productos_mas_vendidos?.length) {
      return {
        labels: ["Sin datos"],
        datasets: [{ data: [0] }]
      };
    }

    const top3 = reporteData.productos_mas_vendidos.slice(0, 3);
    return {
      labels: top3.map(p =>
        screenWidth < 350
          ? p.nombre.substring(0, 8)
          : p.nombre.length > 12
            ? p.nombre.substring(0, 12)
            : p.nombre
      ),
      datasets: [{
        data: top3.map(p => parseInt(p.cantidad_vendida))
      }]
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

  // Statistics card component
  const StatCard = ({ icon, title, value, unit, color = "#0077cc", onPress }) => (
    <TouchableOpacity 
      style={[styles.statCard, { width: screenWidth < 350 ? '100%' : '48%' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Icon name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.statTitle, { fontSize: scaleFont(11) }]}>{title}</Text>
      <Text style={[styles.statValue, { fontSize: scaleFont(22), color }]}>{value}</Text>
      <Text style={[styles.statUnit, { fontSize: scaleFont(10) }]}>{unit}</Text>
    </TouchableOpacity>
  );

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
  if (!reporteData) {
    return (
      <View style={styles.container}>
        <HeaderPrincipal title="Estadísticas" />
        <View style={styles.loadingContainer}>
          <Icon name="chart-box-outline" size={64} color="#cbd5e1" />
          <Text style={[styles.emptyText, { fontSize: scaleFont(15) }]}>
            No hay datos disponibles
          </Text>
        </View>
      </View>
    );
  }

  const ventasSemanalesData = getVentasSemanalesData();
  const top3ProductosData = getTop3ProductosData();

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
        {/* Resumen Principal */}
        <View style={[styles.summarySection, { padding: getResponsivePadding(0.04) }]}>
          <Text style={[styles.sectionTitle, { fontSize: scaleFont(18) }]}>
            Resumen General
          </Text>

          <View style={styles.statsGrid}>
            <StatCard
              icon="cash-multiple"
              title="VENTAS TOTALES"
              value={formatCurrency(reporteData.resumen.total_ventas)}
              unit="Ingresos generados"
              color="#10b981"
              onPress={() => {/* Navegar a detalle ventas */}}
            />

            <StatCard
              icon="chart-line"
              title="GANANCIA NETA"
              value={formatCurrency(reporteData.resumen.ganancia_neta)}
              unit="Utilidad obtenida"
              color="#0077cc"
              onPress={() => {/* Navegar a detalle ganancias */}}
            />

            <StatCard
              icon="receipt"
              title="COSTOS TOTALES"
              value={formatCurrency(reporteData.resumen.total_costos)}
              unit="Gastos operacionales"
              color="#f59e0b"
              onPress={() => {/* Navegar a detalle costos */}}
            />

            <StatCard
              icon="alert-circle"
              title="PÉRDIDAS"
              value={reporteData.resumen.total_perdidas}
              unit="Unidades perdidas"
              color="#ef4444"
              onPress={() => {/* Navegar a detalle pérdidas */}}
            />
          </View>
        </View>

        {/* Ventas de la Semana */}
        <ChartCard 
          title="Ventas de los Últimos 7 Días"
          onViewMore={() => {/* Navegar a detalle ventas semanales */}}
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

        {/* Top 3 Productos */}
        {reporteData.productos_mas_vendidos?.length > 0 && (
          <ChartCard 
            title="Top 3 Productos Más Vendidos"
            onViewMore={() => {/* Navegar a detalle todos los productos */}}
          >
            <BarChart
              data={top3ProductosData}
              width={chartWidth}
              height={chartHeight}
              chartConfig={createChartConfig("rgba(16, 185, 129, 1)")}
              style={styles.chart}
              showValuesOnTopOfBars={true}
              withInnerLines={false}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero={true}
            />
            
            {/* Lista de top 3 */}
            <View style={styles.productList}>
              {reporteData.productos_mas_vendidos.slice(0, 3).map((producto, index) => (
                <View key={producto.id} style={styles.productItem}>
                  <View style={styles.productRank}>
                    <Text style={[styles.rankNumber, { fontSize: scaleFont(14) }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { fontSize: scaleFont(14) }]}>
                      {producto.nombre}
                    </Text>
                    <Text style={[styles.productStats, { fontSize: scaleFont(12) }]}>
                      {producto.cantidad_vendida} unidades · {formatCurrency(producto.ingresos_generados)}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#cbd5e1" />
                </View>
              ))}
            </View>
          </ChartCard>
        )}

        {/* Clientes Destacados */}
        {reporteData.clientes_mas_frecuentes?.length > 0 && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { fontSize: scaleFont(16) }]}>
                Clientes Más Frecuentes
              </Text>
              <TouchableOpacity 
                onPress={() => {/* Navegar a detalle clientes */}}
                style={styles.viewMoreBtn}
              >
                <Text style={[styles.viewMoreText, { fontSize: scaleFont(13) }]}>Ver más</Text>
                <Icon name="chevron-right" size={18} color="#0077cc" />
              </TouchableOpacity>
            </View>

            <View style={styles.clientList}>
              {reporteData.clientes_mas_frecuentes.slice(0, 3).map((cliente, index) => (
                <TouchableOpacity 
                  key={cliente.id} 
                  style={styles.clientItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.clientRank}>
                    <Text style={[styles.rankNumber, { fontSize: scaleFont(14) }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.clientInfo}>
                    <Text style={[styles.clientName, { fontSize: scaleFont(14) }]}>
                      {cliente.nombre}
                    </Text>
                    <Text style={[styles.clientStats, { fontSize: scaleFont(12) }]}>
                      {cliente.cantidad_compras} compras · {formatCurrency(cliente.total_gastado)}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              ))}
            </View>
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
  sectionTitle: {
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statTitle: {
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  statValue: {
    fontWeight: "800",
    marginBottom: 4,
    textAlign: "center",
  },
  statUnit: {
    color: "#94a3b8",
    fontWeight: "500",
    textAlign: "center",
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
  },
  productList: {
    marginTop: 16,
    gap: 8,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#0077cc15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankNumber: {
    color: "#0077cc",
    fontWeight: "700",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  productStats: {
    color: "#64748b",
    fontWeight: "500",
  },
  clientList: {
    gap: 8,
  },
  clientItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  clientRank: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#10b98115",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  clientStats: {
    color: "#64748b",
    fontWeight: "500",
  },
});

export default Estadisticas;