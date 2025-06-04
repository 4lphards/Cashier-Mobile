import React from "react"
import { View, Text } from "react-native"
import Feather from "@expo/vector-icons/Feather"
import { formatToIDR } from "~/utils/formatting"

interface ReportData {
  totalRevenue: number
  totalTransactions: number
  totalItemsSold: number
  transactions: any[]
  chartData?: any
}

interface SummaryCardsProps {
  data: ReportData
}

export const SummaryCards: React.FC<SummaryCardsProps> = React.memo(({ data }) => {
  return (
    <View className="mb-6">
      {/* Revenue Card - Full Width */}
      <View className="relative p-4 mb-3 bg-white border border-gray-200 shadow-sm rounded-xl">
        <Text className="text-base font-medium text-gray-500">Total Pendapatan</Text>
        <Text className="mt-1 text-2xl font-bold text-green-600">{formatToIDR(data.totalRevenue)}</Text>
        <View className="absolute p-2 rounded-full top-4 right-4 bg-green-50">
          <Feather name="trending-up" color="#22c55e" size={20} />
        </View>
      </View>

      {/* Transactions and Items Sold */}
      <View className="flex-row">
        <View className="relative flex-1 p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
          <Text className="text-base font-medium text-gray-500">Transaksi</Text>
          <Text className="mt-1 text-xl font-bold text-blue-600">{data.totalTransactions}</Text>
          <View className="absolute p-2 rounded-full top-4 right-4 bg-blue-50">
            <Feather name="shopping-cart" color="#3b82f6" size={20} />
          </View>
        </View>
        <View className="w-3" />
        <View className="relative flex-1 p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
          <Text className="text-base font-medium text-gray-500">Barang Terjual</Text>
          <Text className="mt-1 text-xl font-bold text-amber-600">{data.totalItemsSold}</Text>
          <View className="absolute p-2 rounded-full top-4 right-4 bg-amber-50">
            <Feather name="package" color="#f59e0b" size={20} />
          </View>
        </View>
      </View>
    </View>
  )
})

export type { ReportData }
