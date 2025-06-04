"use client"
import { useState, useEffect } from "react"
import { View, Text, ScrollView, RefreshControl } from "react-native"
import { PosService, type Transaction } from "~/services/POSService"
import { useToast } from "~/contexts/toastContext"

// Import components
import { PeriodSelector, type TimePeriod } from "~/components/period-selector"
import { DateSelector } from "~/components/date-selector"
import { SummaryCards, type ReportData } from "~/components/summary-cards"
import { ChartSection } from "~/components/chart-section"
import { TransactionList } from "~/components/transaction-list"

export default function Reports() {
  const { showToast } = useToast()
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("day")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalTransactions: 0,
    totalItemsSold: 0,
    transactions: [],
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const getDateRange = (date: Date, period: TimePeriod) => {
    const start = new Date(date)
    const end = new Date(date)

    switch (period) {
      case "day":
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
      case "week":
        start.setDate(date.getDate() - date.getDay())
        start.setHours(0, 0, 0, 0)
        end.setDate(start.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        break
      case "month":
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        end.setMonth(start.getMonth() + 1)
        end.setDate(0)
        end.setHours(23, 59, 59, 999)
        break
      case "year":
        start.setMonth(0, 1)
        start.setHours(0, 0, 0, 0)
        end.setMonth(11, 31)
        end.setHours(23, 59, 59, 999)
        break
      case "all-time":
        // For all-time, get all data from the beginning
        start.setFullYear(2020, 0, 1) // Start from 2020 or adjust as needed
        start.setHours(0, 0, 0, 0)
        end.setTime(Date.now()) // Until now
        end.setHours(23, 59, 59, 999)
        break
    }

    return { start, end }
  }

  const generateChartData = (transactions: Transaction[], period: TimePeriod) => {
    if (period === "day") return null

    const { start, end } = getDateRange(selectedDate, period)
    const labels: string[] = []
    const data: number[] = []

    if (period === "week") {
      // Generate 7 days
      for (let i = 0; i < 7; i++) {
        const day = new Date(start)
        day.setDate(start.getDate() + i)
        labels.push(day.toLocaleDateString("id-ID", { weekday: "short" }))

        const dayRevenue = transactions
          .filter((t) => {
            const tDate = new Date(t.created_at)
            return tDate.toDateString() === day.toDateString()
          })
          .reduce((sum, t) => sum + t.total, 0)

        data.push(dayRevenue)
      }
    } else if (period === "month") {
      // Generate days of the month (simplified to weeks)
      const weeksInMonth = Math.ceil((end.getDate() - start.getDate() + 1) / 7)
      for (let i = 0; i < weeksInMonth; i++) {
        const weekStart = new Date(start)
        weekStart.setDate(start.getDate() + i * 7)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)

        labels.push(`W${i + 1}`)

        const weekRevenue = transactions
          .filter((t) => {
            const tDate = new Date(t.created_at)
            return tDate >= weekStart && tDate <= weekEnd
          })
          .reduce((sum, t) => sum + t.total, 0)

        data.push(weekRevenue)
      }
    } else if (period === "year" || period === "all-time") {
      // Generate 12 months
      for (let i = 0; i < 12; i++) {
        const month = new Date(start.getFullYear(), i, 1)
        labels.push(month.toLocaleDateString("id-ID", { month: "short" }))

        const monthRevenue = transactions
          .filter((t) => {
            const tDate = new Date(t.created_at)
            return tDate.getMonth() === i && tDate.getFullYear() === start.getFullYear()
          })
          .reduce((sum, t) => sum + t.total, 0)

        data.push(monthRevenue)
      }
    }

    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    }
  }

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const { start, end } = getDateRange(selectedDate, selectedPeriod)

      // Get all transactions (we'll filter them)
      const allTransactions = await PosService.getTransactions(1000)

      // Filter transactions by date range
      const filteredTransactions = allTransactions.filter((transaction) => {
        const transactionDate = new Date(transaction.created_at)
        return transactionDate >= start && transactionDate <= end
      })

      // Calculate totals
      const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0)
      const totalTransactions = filteredTransactions.length
      const totalItemsSold = filteredTransactions.reduce(
        (sum, t) => sum + (t.transaction_items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0),
        0,
      )

      // Generate chart data
      const chartData = generateChartData(filteredTransactions, selectedPeriod)

      setReportData({
        totalRevenue,
        totalTransactions,
        totalItemsSold,
        transactions: filteredTransactions,
        chartData,
      })
    } catch (error) {
      console.error("Error fetching report data:", error)
      showToast("Gagal memuat data laporan", "error")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod, selectedDate])

  const onRefresh = () => {
    setRefreshing(true)
    fetchReportData()
  }

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 p-4 bg-white">
        <Text className="text-gray-600">Memuat laporan...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 p-4 bg-white"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />

      <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} period={selectedPeriod} />

      <SummaryCards data={reportData} />

      <ChartSection data={reportData} period={selectedPeriod} />

      <TransactionList transactions={reportData.transactions} period={selectedPeriod} />
    </ScrollView>
  )
}
