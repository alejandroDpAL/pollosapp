import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  PixelRatio
} from "react-native";
import HeaderPrincipal from "../../components/layout/header";
import Menu from "../../components/common/bottom.navigation";
import {
  LineChart,
  BarChart,
  StackedBarChart,
  PieChart,
  ProgressChart,
} from "react-native-chart-kit";


const Estadisticas = () => {
  // Screen dimensions
  const screenData = Dimensions.get('window');
  const { width: screenWidth, height: screenHeight } = screenData;

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
    const baseHeight = screenHeight * 0.25;
    return Math.min(Math.max(baseHeight, 180), 280);
  };

  // Responsive padding
  const getResponsivePadding = (percentage) => {
    const calculated = screenWidth * percentage;
    return Math.max(calculated, 10);
  };

  // Sales by hour data
  const ventasHorariaData = {
    labels: ["9am", "11am", "1pm", "3pm", "5pm", "7pm"],
    datasets: [{
      data: [5, 8, 15, 12, 18, 22],
      color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
      strokeWidth: 3
    }],
  };

  // Sales by product data
  const ventasProductoData = {
    labels: screenWidth < 350 ? ["Entero", "1/2", "Alitas", "Pechuga", "Muslos"] : ["Pollo Entero", "Medio Pollo", "Alitas", "Pechuga", "Muslos"],
    datasets: [{
      data: [45, 38, 62, 28, 33]
    }],
  };

  // Revenue vs costs data
  const ingresosVsCostosData = {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    legend: ["Ingresos", "Costos", "Pérdidas"],
    data: [
      [1200, 800, 100],
      [1350, 850, 80],
      [1100, 780, 120],
      [1480, 900, 90],
      [1650, 950, 70],
      [1820, 1050, 110],
      [1400, 820, 95]
    ],
    barColors: ["#4CAF50", "#FF9800", "#F44336"]
  };

  // Sales distribution data
  const distribucionVentasData = [
    {
      name: screenWidth < 350 ? "Entero" : "Pollo Entero",
      population: 35,
      color: "#FF6B6B",
      legendFontColor: "#333",
      legendFontSize: scaleFont(11)
    },
    {
      name: screenWidth < 350 ? "Piezas" : "Piezas Individuales",
      population: 40,
      color: "#4ECDC4",
      legendFontColor: "#333",
      legendFontSize: scaleFont(11)
    },
    {
      name: screenWidth < 350 ? "Procesados" : "Productos Procesados",
      population: 25,
      color: "#45B7D1",
      legendFontColor: "#333",
      legendFontSize: scaleFont(11)
    },
  ];

  // Goals progress data
  const metasData = {
    labels: screenWidth < 350 ? ["Ventas", "Satisf.", "Pedidos"] : ["Ventas Diarias", "Satisfacción", "Pedidos Entregados"],
    data: [0.75, 0.92, 0.68]
  };

  // Orders data
  const pedidosData = {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    legend: ["Entregados", "Pendientes"],
    data: [
      [25, 3], [28, 2], [22, 5], [31, 4], [35, 1], [42, 6], [29, 3]
    ],
    barColors: ["#4CAF50", "#FFC107"]
  };

  // Monthly revenue data
  const ingresosMensualesData = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    datasets: [{
      data: [28500, 31200, 29800, 34500, 37200, 39800],
      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      strokeWidth: 3
    }],
  };

  // Chart configuration factory
  const createChartConfig = (primaryColor, bgFrom = "#ffffff", bgTo = "#ffffff") => ({
    backgroundGradientFrom: bgFrom,
    backgroundGradientTo: bgTo,
    decimalPlaces: 0,
    color: (opacity = 1) => primaryColor,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: { borderRadius: 16 },
    propsForLabels: {
      fontSize: Math.max(scaleFont(10), 9)
    },
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false
  });

  // Chart configurations
  const chartConfigs = {
    red: createChartConfig("rgba(255, 107, 107, 1)", "#fef7f7", "#fef7f7"),
    blue: createChartConfig("rgba(69, 183, 209, 1)", "#f0f9ff", "#f0f9ff"),
    green: createChartConfig("rgba(76, 175, 80, 1)", "#f0fdf4", "#f0fdf4"),
    multi: createChartConfig("rgba(134, 65, 244, 1)", "#fafafa", "#fafafa")
  };

  // Statistics calculator render function in the summary section
  const calcularEstadisticas = () => {
    const totalVentasHoy = ventasHorariaData.datasets[0].data.reduce((a, b) => a + b, 0);
    const ingresosTotalesSemana = ingresosVsCostosData.data.reduce((sum, day) => sum + day[0], 0);
    const costosTotalesSemana = ingresosVsCostosData.data.reduce((sum, day) => sum + day[1], 0);
    const perdidasTotalesSemana = ingresosVsCostosData.data.reduce((sum, day) => sum + day[2], 0);
    const gananciaSemana = ingresosTotalesSemana - costosTotalesSemana - perdidasTotalesSemana;
    const margenGanancia = ingresosTotalesSemana > 0 ? ((gananciaSemana / ingresosTotalesSemana) * 100).toFixed(1) : "0.0";

    const pedidosEntregados = pedidosData.data.reduce((sum, day) => sum + day[0], 0);
    const pedidosPendientes = pedidosData.data.reduce((sum, day) => sum + day[1], 0);
    const totalPedidos = pedidosEntregados + pedidosPendientes;
    const eficienciaEntrega = totalPedidos > 0 ? ((pedidosEntregados / totalPedidos) * 100).toFixed(1) : "0.0";

    return {
      totalVentasHoy,
      ingresosTotalesSemana,
      gananciaSemana,
      margenGanancia,
      eficienciaEntrega
    };
  };

  const stats = calcularEstadisticas();
  const chartWidth = getChartWidth();
  const chartHeight = getChartHeight();

  // Chart section component
  const ChartSection = ({ title, description, children, emoji = "" }) => (
    <View style={[styles.section, { padding: getResponsivePadding(0.04) }]}>
      <Text style={[styles.sectionTitle, { fontSize: scaleFont(18) }]}>
        {emoji} {title}
      </Text>
      <Text style={[styles.description, { fontSize: scaleFont(13) }]}>
        {description}
      </Text>
      {children}
    </View>
  );

  // Statistics card component. used in the summary section line 339
  const StatCard = ({ title, value, unit }) => (
    <View style={[styles.reportCard, { width: screenWidth < 350 ? '100%' : '48%' }]}>
      <Text style={[styles.reportCardTitle, { fontSize: scaleFont(12) }]}>{title}</Text>
      <Text style={[styles.reportCardValue, { fontSize: scaleFont(18) }]}>{value}</Text>
      <Text style={[styles.reportCardUnit, { fontSize: scaleFont(11) }]}>{unit}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderPrincipal title="Estadísticas de Ventas" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingHorizontal: getResponsivePadding(0.05) }
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hourly sales chart */}
        <ChartSection
          emoji=""
          title="Ventas por Hora del Día"
          description="Flujo de ventas durante las horas de operación para identificar horas pico."
        >
          <LineChart
            data={ventasHorariaData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfigs.red}
            bezier
            style={styles.chart}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withInnerLines={false}
            withOuterLines={false}
          />
        </ChartSection>

        {/* Product sales chart */}
        <ChartSection
          emoji=""
          title="Ventas por Producto"
          description="Comparación de demanda por producto para optimizar inventario."
        >
          <BarChart
            data={ventasProductoData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfigs.blue}
            style={styles.chart}
            showValuesOnTopOfBars={true}
            withInnerLines={false}
          />
        </ChartSection>

        {/* Goals progress chart */}
        <ChartSection
          emoji=""
          title="Progreso de Metas"
          description="Seguimiento de objetivos clave del negocio."
        >
          <ProgressChart
            data={metasData}
            width={chartWidth}
            height={chartHeight}
            strokeWidth={Math.max(screenWidth * 0.035, 10)}
            radius={Math.max(screenWidth * 0.08, 25)}
            chartConfig={chartConfigs.green}
            style={styles.chart}
            hideLegend={false}
          />
        </ChartSection>

        {/* Sales distribution pie chart */}
        <ChartSection
          emoji=""
          title="Distribución por Categoría"
          description="Proporción de ventas por categoría de producto."
        >
          <PieChart
            data={distribucionVentasData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfigs.multi}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft={getResponsivePadding(0.02).toString()}
            style={styles.chart}
            absolute
          />
        </ChartSection>

        {/* Order management chart */}
        {/* <ChartSection
          emoji="📦"
          title="Gestión de Pedidos"
          description="Comparación de pedidos entregados vs pendientes."
        >
          <StackedBarChart
            data={pedidosData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfigs.multi}
            style={styles.chart}
          />
        </ChartSection> */}

        {/* Revenue trend chart */}
        <ChartSection
          emoji=""
          title="Tendencia de Ingresos"
          description="Evolución de ingresos mensuales para proyecciones."
        >
          <LineChart
            data={ingresosMensualesData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfigs.green}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={false}
          />
        </ChartSection>

        {/* Executive summary */}
        <View style={[styles.reportSection, { padding: getResponsivePadding(0.04) }]}>
          <Text style={[styles.reportTitle, { fontSize: scaleFont(20) }]}>
            Resumen Ejecutivo
          </Text>

          <View style={styles.reportGrid}>
            <StatCard
              title="VENTAS HOY"
              value={stats.totalVentasHoy}
              unit="unidades"
            />

            <StatCard
              title="INGRESOS SEMANA"
              value={`$${stats.ingresosTotalesSemana.toLocaleString()}`}
              unit="pesos"
            />

            <StatCard
              title="MARGEN GANANCIA"
              value={`${stats.margenGanancia}%`}
              unit="rentabilidad"
            />

            <StatCard
              title="EFICIENCIA"
              value={`${stats.eficienciaEntrega}%`}
              unit="entregas"
            />
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: Math.max(screenHeight * 0.1, 60) }} />
      </ScrollView>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 15,
    flexGrow: 1,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#2c3e50",
  },
  description: {
    color: "#7f8c8d",
    marginBottom: 12,
    lineHeight: 18,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
    alignSelf: "center",
  },
  reportSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  reportTitle: {
    fontWeight: "800",
    color: "#34495e",
    marginBottom: 16,
    textAlign: "center",
  },
  reportGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  reportCard: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  reportCardTitle: {
    color: "#6c757d",
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  reportCardValue: {
    fontWeight: "800",
    color: "#343a40",
    textAlign: "center",
  },
  reportCardUnit: {
    color: "#6c757d",
    marginTop: 2,
    textAlign: "center",
  },
  reportSummary: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
  },
  reportSummaryTitle: {
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
  },
  reportSummaryText: {
    color: "#495057",
    marginBottom: 12,
  },
  reportRecommendation: {
    color: "#28a745",
    fontWeight: "600",
    fontStyle: "italic",
  },
});

export default Estadisticas;