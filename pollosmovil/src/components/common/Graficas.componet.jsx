import React from "react";
import { View, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

export default function GraphVentasDia() {
  const data = {
    ventasDia: [
      { hora: "09:00", pollos: 2 },
      { hora: "12:00", pollos: 4 },
      { hora: "15:00", pollos: 7 },
      { hora: "18:00", pollos: 10 }
    ]
  };

  const labels = data.ventasDia.map(v => v.hora);
  const values = data.ventasDia.map(v => v.pollos);

  return (
    <View>
      <LineChart
        data={{
          labels: labels,
          datasets: [{ data: values }]
        }}
        width={Dimensions.get("window").width - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix="🐔"
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#f9f9f9",
          backgroundGradientTo: "#f9f9f9",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: "#ff6b6b"
          }
        }}
        bezier
        style={{ marginVertical: 8, borderRadius: 12 }}
      />
    </View>
  );
}
