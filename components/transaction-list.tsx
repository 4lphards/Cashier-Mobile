import type React from "react"
import { View, Text, ScrollView } from "react-native"
import { TransactionItem } from "./transaction-item"
import type { Transaction } from "~/services/POSService"
import type { TimePeriod } from "./period-selector"

interface TransactionListProps {
  transactions: Transaction[]
  period: TimePeriod
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, period }) => {
  if (transactions.length === 0) {
    return (
      <View className="p-8 bg-white border border-gray-200 shadow-sm rounded-xl">
        <Text className="text-center text-gray-500">Tidak ada transaksi untuk periode ini</Text>
      </View>
    )
  }

  return (
    <View className="mb-6">
      <Text className="mb-4 text-lg font-bold text-gray-800">Detail Transaksi ({transactions.length})</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </ScrollView>
    </View>
  )
}
