"use client"

import { useEffect, useState } from "react"
import { ScrollView, Text, View, RefreshControl } from "react-native"
import { TrendingUp, Receipt, Box } from "lucide-react-native"
import { formatToIDR } from "~/utils/formatting"
import { PosService, type Transaction } from "~/services/POSService"
import { useToast } from "~/contexts/toastContext"
import { useRefresh } from "~/contexts/refreshContext"

interface DashboardData {
  totalTransactions: number
  totalItemsSold: number
  totalRevenue: number
  todaysTransactions: Transaction[]
}

export default function Dashboard() {
  const { showToast } = useToast()
  const { refreshKey } = useRefresh()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalTransactions: 0,
    totalItemsSold: 0,
    totalRevenue: 0,
    todaysTransactions: [],
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  const fetchDashboardData = async () => {
    try {
      const data = await PosService.getDashboardData()
      setDashboardData(data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      showToast("Gagal memuat data dashboard", "error")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await PosService.getDashboardData()
        setDashboardData(data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        showToast("Gagal memuat data dashboard", "error")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }
    fetchData()
  }, [showToast])

  useEffect(() => {
    fetchDashboardData()
  }, [refreshKey, fetchDashboardData])

  const onRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 p-4 bg-white">
        <Text className="text-gray-600">Memuat data...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 p-4 bg-white"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text className="text-lg font-bold text-gray-800">Ringkasan Terbaru</Text>
      <Text className="text-gray-800 text-md">{today}</Text>

      <View className="mt-4 bg-white">
        {/* First Row: Total Penjualan */}
        <View className="flex-row">
          <View className="flex-1 m-2 p-4 bg-white border border-gray-200 shadow-sm rounded-xl min-w-[150px] relative">
            <Text className="text-base font-medium text-gray-500">Total Penjualan</Text>
            <Text className="mt-1 text-2xl font-bold text-green-600">{formatToIDR(dashboardData.totalRevenue)}</Text>
            <View className="absolute p-2 rounded-full top-2 right-4 bg-green-50">
              <TrendingUp color="#22c55e" size={20} />
            </View>
          </View>
        </View>

        {/* Second Row: Transaksi and Barang Terjual */}
        <View className="flex-row">
          {/* Transaksi */}
          <View className="flex-1 m-2 p-4 bg-white border border-gray-200 shadow-sm rounded-xl min-w-[150px] relative">
            <Text className="text-base font-medium text-gray-500">Transaksi</Text>
            <Text className="mt-1 text-2xl font-bold text-blue-600">{dashboardData.totalTransactions}</Text>
            <View className="absolute p-2 rounded-full top-2 right-4 bg-blue-50">
              <Receipt color="#3b82f6" size={20} />
            </View>
          </View>

          {/* Barang Terjual */}
          <View className="flex-1 m-2 p-4 bg-white border border-gray-200 shadow-sm rounded-xl min-w-[150px] relative">
            <Text className="text-base font-medium text-gray-500">Terjual</Text>
            <View className="flex-row items-center">
              <Text className="mt-1 text-2xl font-bold text-orange-600">{dashboardData.totalItemsSold}</Text>
              <Text className="mt-1 text-base font-bold text-gray-500"> barang</Text>
            </View>
            <View className="absolute p-2 rounded-full top-2 right-4 bg-orange-50">
              <Box color="#fb923c" size={20} />
            </View>
          </View>
        </View>
      </View>

      <View className="flex-1">
        <Text className="mt-6 text-lg font-bold text-gray-800">Transaksi Hari ini</Text>
        <View className="flex-1 mt-2">
          {dashboardData.todaysTransactions.length === 0 ? (
            <View className="items-center justify-center flex-1 p-8">
              <Text className="text-center text-gray-500">Belum ada transaksi hari ini</Text>
            </View>
          ) : (
            <ScrollView className="flex-1 p-1" showsVerticalScrollIndicator={false}>
              {dashboardData.todaysTransactions.map((trx) => {
                const totalItems = trx.transaction_items?.reduce((sum, item) => sum + item.quantity, 0) || 0

                // Show items until total name length exceeds 30 chars
                const charLimit = 30
                let runningLength = 0
                const showItems: any[] = []
                let hasMore = false

                if (trx.transaction_items) {
                  for (let i = 0; i < trx.transaction_items.length; i++) {
                    const item = trx.transaction_items[i]
                    const itemName = item.item?.name || `Item ${item.item_id}`
                    const nextLength = runningLength + itemName.length + (showItems.length > 0 ? 2 : 0)

                    if (nextLength > charLimit) {
                      hasMore = true
                      break
                    }

                    showItems.push({ ...item, name: itemName })
                    runningLength = nextLength
                  }

                  if (showItems.length < trx.transaction_items.length) hasMore = true
                }

                return (
                  <View
                    key={trx.id}
                    className="flex-row items-center justify-between p-3 mb-2 bg-white border border-gray-100 rounded-xl"
                  >
                    <View>
                      <Text className="font-medium text-gray-800">{`Transaksi #${trx.id}`}</Text>
                      <Text className="text-xs text-gray-500">
                        {new Date(trx.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}{" "}
                        • {totalItems} item
                      </Text>
                      <View className="flex-row flex-wrap mt-1">
                        {showItems.map((item, i) => (
                          <Text key={i} className="mr-2 text-xs text-gray-600">
                            - {item.name} ({item.quantity}){i < showItems.length - 1 || hasMore ? "," : ""}
                          </Text>
                        ))}
                        {hasMore && <Text className="text-xs text-gray-600">...</Text>}
                      </View>
                    </View>
                    <Text className="font-bold text-green-600">{formatToIDR(trx.total)}</Text>
                  </View>
                )
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </ScrollView>
  )
}
