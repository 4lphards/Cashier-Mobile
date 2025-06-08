"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { Receipt, Package, ChevronDown, ChevronUp } from "lucide-react-native"
import { formatToIDR } from "~/utils/formatting"
import type { Transaction } from "~/services/POSService"

interface TransactionItemProps {
  transaction: Transaction
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const totalItems = transaction.transaction_items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <View className="mb-3 bg-white border border-gray-100 shadow-sm rounded-xl">
      {/* Transaction Header */}
      <TouchableOpacity
        className="flex-row items-center justify-between p-4"
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Receipt size={16} color="#6B7280" />
            <Text className="ml-2 font-semibold text-gray-800">Transaksi #{transaction.id}</Text>
          </View>
          <Text className="mb-1 text-sm text-gray-500">
            {new Date(transaction.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <View className="flex-row items-center">
            <Package size={14} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-600">{totalItems} item</Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="mb-1 text-lg font-bold text-green-600">{formatToIDR(transaction.total)}</Text>
          <View className="flex-row items-center">
            <Text className="mr-1 text-xs text-gray-500">{isExpanded ? "Tutup" : "Detail"}</Text>
            {isExpanded ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
          </View>
        </View>
      </TouchableOpacity>

      {/* Transaction Details */}
      {isExpanded && (
        <View className="px-4 pb-4">
          <View className="h-px mb-3 bg-gray-200" />

          {/* Payment Information */}
          <View className="p-3 mb-4 rounded-lg bg-gray-50">
            <Text className="mb-2 text-sm font-medium text-gray-700">Informasi Pembayaran</Text>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-600">Subtotal:</Text>
              <Text className="text-sm font-medium text-gray-800">{formatToIDR(transaction.total)}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-600">Dibayar:</Text>
              <Text className="text-sm font-medium text-gray-800">{formatToIDR(transaction.payment)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Kembalian:</Text>
              <Text className="text-sm font-medium text-green-600">{formatToIDR(transaction.change)}</Text>
            </View>
          </View>

          {/* Items List */}
          <View>
            <Text className="mb-3 text-sm font-medium text-gray-700">Detail Barang ({totalItems} item)</Text>
            {transaction.transaction_items && transaction.transaction_items.length > 0 ? (
              <View className="space-y-2">
                {transaction.transaction_items.map((item, index) => {
                  // Try different ways to get the item name
                  const itemName =
                    item.item?.name || item.items?.name || (item as any).name || `Item ID: ${item.item_id}`

                  const itemStock = item.item?.stock ?? item.items?.stock ?? (item as any).stock

                  return (
                    <View key={index} className="flex-row items-center justify-between p-3 rounded-lg bg-gray-50">
                      <View className="flex-1">
                        <Text className="mb-1 font-medium text-gray-800">{itemName}</Text>
                        <View className="flex-row items-center">
                          <Text className="text-sm text-gray-600">
                            {formatToIDR(item.price_at_time)} × {item.quantity}
                          </Text>
                          {itemStock !== undefined && (
                            <Text className="ml-2 text-xs text-gray-500">(Stok saat ini: {itemStock})</Text>
                          )}
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="font-semibold text-gray-800">
                          {formatToIDR(item.price_at_time * item.quantity)}
                        </Text>
                        <Text className="text-xs text-gray-500">{item.quantity}x</Text>
                      </View>
                    </View>
                  )
                })}
              </View>
            ) : (
              <Text className="text-sm italic text-gray-500">Tidak ada detail barang</Text>
            )}
          </View>
        </View>
      )}
    </View>
  )
}
