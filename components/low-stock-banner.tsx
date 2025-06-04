import type React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { AlertTriangle } from "lucide-react-native"
import type { Items } from "~/services/POSService"

interface LowStockBannerProps {
  items: Items[]
  threshold: number
  onShowLowStock: () => void
}

export const LowStockBanner: React.FC<LowStockBannerProps> = ({ items, threshold, onShowLowStock }) => {
  const lowStockItems = items.filter((item) => item.stock <= threshold && item.stock > 0)
  const outOfStockItems = items.filter((item) => item.stock === 0)

  const totalWarnings = lowStockItems.length + outOfStockItems.length

  if (totalWarnings === 0) {
    return null
  }

  return (
    <TouchableOpacity
      className="flex-row items-center p-3 mb-4 border border-red-200 rounded-[8px] bg-red-50"
      onPress={onShowLowStock}
    >
      <View className="p-1 bg-red-100 rounded-full">
        <AlertTriangle size={18} color="#EF4444" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="font-medium text-red-700">
          {outOfStockItems.length > 0 ? "Stok Habis & Menipis!" : "Peringatan Stok Menipis!"}
        </Text>
        <Text className="mt-1 text-xs text-red-600">
          {outOfStockItems.length > 0 && `${outOfStockItems.length} barang habis, `}
          {lowStockItems.length > 0 && `${lowStockItems.length} barang stok menipis`}
        </Text>
      </View>
      <Text className="text-xs font-medium text-red-600">Lihat</Text>
    </TouchableOpacity>
  )
}
