import React from "react";
import { View, Dimensions, Text, StyleSheet } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";

export default function GraphVentasDia({ data = null, type = "line", title = "Ingresos por Día" }) {
  // Datos por defecto si no se proporcionan
  const defaultData = [
    { label: "Lun", value: 450000 },
    { label: "Mar", value: 320000 },
    { label: "Mié", value: 550000 },
    { label: "Jue", value: 480000 },
    { label: "Vie", value: 620000 },
    { label: "Sab", value: 750000 },
  ];

  const chartData = data || defaultData;
  
  // Limitar a 7 elementos para mejor visualización
  const displayData = chartData.slice(0, 7);
  const labels = displayData.map(d => d.label);
  const values = displayData.map(d => d.value);

  // Encontrar min y max para mejor escala
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;

  // Normalizar valores a escala 0-100 para mejor visualización
  const normalizedValues = values.map(v => {
    return ((v - minValue) / range) * 100 || 50;
  });

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#f8fafc",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 119, 204, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#0077cc"
    },
    propsForBackgroundLines: {
      strokeDasharray: "8",
      stroke: "#e5e7eb",
      strokeWidth: 1,
    }
  };

  const screenWidth = Dimensions.get("window").width - 32;

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        {type === "line" ? (
          <LineChart
            data={{
              labels: labels,
              datasets: [{ data: normalizedValues, color: () => "#0077cc" }]
            }}
            width={screenWidth}
            height={220}
            yAxisLabel="$"
            yAxisSuffix="K"
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            withHorizontalLines={true}
          />
        ) : (
          <BarChart
            data={{
              labels: labels,
              datasets: [{ data: normalizedValues, color: () => "#10b981" }]
            }}
            width={screenWidth}
            height={220}
            yAxisLabel="$"
            yAxisSuffix="K"
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            }}
            style={styles.chart}
            withHorizontalLabels={true}
            withVerticalLabels={true}
          />
        )}
      </View>

      {/* Leyenda de valores */}
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>Máx: ${(maxValue / 1000).toFixed(0)}K</Text>
        <Text style={styles.legendLabel}>Mín: ${(minValue / 1000).toFixed(0)}K</Text>
        <Text style={styles.legendLabel}>
          Prom: ${((values.reduce((a, b) => a + b, 0) / values.length) / 1000).toFixed(0)}K
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  legendLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
});
