import type React from "react"
import { View, Text } from "react-native"
import { AlertTriangle, XCircle } from "lucide-react-native"

interface StockIndicatorProps {
  stock: number
  threshold: number
}

export const StockIndicator: React.FC<StockIndicatorProps> = ({ stock, threshold }) => {
  if (stock === 0) {
    return (
      <View className="flex-row items-center">
        <XCircle size={14} color="#EF4444" />
        <Text className="ml-1 font-medium text-red-600">Habis</Text>
      </View>
    )
  }

  if (stock <= threshold) {
    return (
      <View className="flex-row items-center">
        <AlertTriangle size={14} color="#F59E0B" />
        <Text className="ml-1 font-medium text-amber-600">Menipis</Text>
      </View>
    )
  }

  return <Text className="text-gray-600">{stock} pcs</Text>
}
