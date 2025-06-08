import { useRef } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { captureRef } from "react-native-view-shot"
import * as Sharing from "expo-sharing"
import { formatToIDR } from "../utils/formatting"

interface ReceiptItem {
  name: string
  quantity: number
  price: number
  subtotal: number
}

interface ReceiptShareViewProps {
  items: ReceiptItem[]
  total: number
  payment: number
  change: number
  paymentMethod: string
  transactionId: string | number
  date: string
  onShare?: () => void
}

const alfamartLine = "================================"

export default function ReceiptShareView({
  items,
  total,
  payment,
  change,
  paymentMethod,
  transactionId,
  date,
  onShare,
}: ReceiptShareViewProps) {
  const viewRef = useRef<View>(null)

  const handleShare = async () => {
    if (viewRef.current) {
      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
      })
      await Sharing.shareAsync(uri, { dialogTitle: "Bagikan Struk" })
      if (onShare) onShare()
    }
  }

  return (
    <View ref={viewRef} collapsable={false} className="items-center self-center p-4 my-4 bg-white rounded-[8px] shadow w-80">
      <Text className="mb-1 text-lg font-bold tracking-wider">PIPITI</Text>
      <Text className="text-xs text-gray-600 mb-0.5">Jl. Contoh No. 123, Jakarta</Text>
      <Text className="text-xs text-gray-600 mb-0.5">Tanggal: {date}</Text>
      <Text className="text-xs text-gray-600 mb-0.5">No. Transaksi: {transactionId}</Text>
      <Text className="w-full my-1 text-xs text-center text-gray-400">{alfamartLine}</Text>
      {items.map((item, idx) => (
        <View key={idx} className="flex-row justify-between items-center w-full mb-0.5">
          <Text className="text-xs text-gray-800 flex-2">{item.name}</Text>
          <Text className="flex-1 text-xs text-center text-gray-800">{item.quantity} x {formatToIDR(item.price)}</Text>
          <Text className="flex-1 text-xs text-right text-gray-800">{formatToIDR(item.subtotal)}</Text>
        </View>
      ))}
      <Text className="w-full my-1 text-xs text-center text-gray-400">{alfamartLine}</Text>
      <View className="flex-row justify-between w-full my-0.5">
        <Text className="text-xs font-bold text-gray-800">Total</Text>
        <Text className="text-xs font-bold text-gray-800">{formatToIDR(total)}</Text>
      </View>
      <View className="flex-row justify-between w-full my-0.5">
        <Text className="text-xs font-bold text-gray-800">Bayar</Text>
        <Text className="text-xs font-bold text-gray-800">{formatToIDR(payment)}</Text>
      </View>
      <View className="flex-row justify-between w-full my-0.5">
        <Text className="text-xs font-bold text-gray-800">Kembali</Text>
        <Text className="text-xs font-bold text-gray-800">{formatToIDR(change)}</Text>
      </View>
      <View className="flex-row justify-between w-full my-0.5">
        <Text className="text-xs font-bold text-gray-800">Metode</Text>
        <Text className="text-xs font-bold text-gray-800">{paymentMethod}</Text>
      </View>
      <Text className="w-full my-1 text-xs text-center text-gray-400">{alfamartLine}</Text>
      <Text className="mt-2 mb-1 text-base font-bold tracking-wider text-center text-blue-600">*** TERIMA KASIH ***</Text>
      <TouchableOpacity className="px-6 py-2 mt-3 bg-blue-600 rounded" onPress={handleShare}>
        <Text className="text-sm font-bold text-white">Bagikan Struk</Text>
      </TouchableOpacity>
    </View>
  )
}
