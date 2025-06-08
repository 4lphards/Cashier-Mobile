import type React from "react"
import { View, Text, Dimensions } from "react-native"
import { BarChart as GiftedBarChart, LineChart as GiftedLineChart } from "react-native-gifted-charts"
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

  // Convert data.chartData to the format expected by react-native-gifted-charts
  let giftedData: { value: number; label?: string }[] = []
  if (data.chartData?.labels && data.chartData?.datasets?.[0]?.data) {
    giftedData = data.chartData.datasets[0].data.map((value: number, idx: number) => ({
      value,
      label: data.chartData.labels[idx],
    }))
  }

  return (
    <View className="mb-6">
      <Text className="mb-3 text-lg font-bold text-gray-800">Grafik Penjualan</Text>
      <View className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
        {period === "week" || period === "month" ? (
          <GiftedLineChart
            data={giftedData}
            width={screenWidth - 32}
            height={220}
            areaChart
            yAxisColor="#e5e7eb"
            xAxisColor="#e5e7eb"
            color="#3b82f6"
            hideDataPoints={false}
            showVerticalLines={false}
            showXAxisIndices={false}
            xAxisLabelTextStyle={{ color: '#6b7280' }}
            yAxisTextStyle={{ color: '#6b7280' }}
          />
        ) : (
          <GiftedBarChart
            data={giftedData}
            width={screenWidth - 32}
            height={220}
            yAxisColor="#e5e7eb"
            xAxisColor="#e5e7eb"
            frontColor="#3b82f6"
            showValuesAsTopLabel={true}
            xAxisLabelTextStyle={{ color: '#6b7280' }}
            yAxisTextStyle={{ color: '#6b7280' }}
          />
        )}
      </View>
    </View>
  )
}
