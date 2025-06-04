import type React from "react"
import { ScrollView, View, TouchableOpacity, Text } from "react-native"

type TimePeriod = "day" | "week" | "month" | "year" | "all-time"

interface PeriodSelectorProps {
  selectedPeriod: TimePeriod
  onPeriodChange: (period: TimePeriod) => void
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriod, onPeriodChange }) => {
  const periods: { key: TimePeriod; label: string }[] = [
    { key: "day", label: "Hari" },
    { key: "week", label: "Minggu" },
    { key: "month", label: "Bulan" },
    { key: "year", label: "Tahun" },
    { key: "all-time", label: "Selama Ini" },
  ]

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
      <View className="flex-row">
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            className={`px-4 py-2 rounded-[8px] border mx-1 ${
              selectedPeriod === period.key ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"
            }`}
            onPress={() => onPeriodChange(period.key)}
          >
            <Text className={`font-medium ${selectedPeriod === period.key ? "text-white" : "text-gray-700"}`}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

export type { TimePeriod }
