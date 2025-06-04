import type React from "react"
import { View, Text, Dimensions } from "react-native"
import { LineChart, BarChart } from "react-native-chart-kit"
import type { TimePeriod } from "./period-selector"
import type { ReportData } from "./summary-cards"

interface ChartSectionProps {
  data: ReportData
  period: TimePeriod
}

export const ChartSection: React.FC<ChartSectionProps> = ({ data, period }) => {
  const screenWidth = Dimensions.get("window").width - 32 // Account for padding

  if (period === "day" || !data.chartData) {
    return null
  }

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#3b82f6",
    },
  }

  return (
    <View className="mb-6">
      <Text className="mb-3 text-lg font-bold text-gray-800">Grafik Penjualan</Text>
      <View className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
        {period === "week" || period === "month" ? (
          <LineChart
            data={data.chartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        ) : (
          <BarChart
            data={data.chartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            style={{
                marginVertical: 8,
                borderRadius: 16,
            }}
            showValuesOnTopOfBars yAxisLabel={""} yAxisSuffix={""}          />
        )}
      </View>
    </View>
  )
}
