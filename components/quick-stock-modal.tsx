"use client"

import { Modal, View, Text, TouchableOpacity } from "react-native"
import { useState, useEffect } from "react"
import { Undo2, RotateCcw, Edit, X, Check } from "lucide-react-native"
import type { Items } from "~/services/POSService"

interface QuickStockModalProps {
  visible: boolean
  item: Items | null
  onClose: () => void
  onApplyChange: (item: Items, stockChange: number) => void
  onOpenEditModal: (item: Items) => void
}

export default function QuickStockModal({
  visible,
  item,
  onClose,
  onApplyChange,
  onOpenEditModal,
}: QuickStockModalProps) {
  const [pendingStockChange, setPendingStockChange] = useState<number>(0)
  const [changeHistory, setChangeHistory] = useState<number[]>([])

  const stockPresets = [1, 5, 10, 25, 50]

  useEffect(() => {
    if (visible && item) {
      setPendingStockChange(0)
      setChangeHistory([])
    }
  }, [visible, item])

  const handleStackableStockChange = (change: number) => {
    if (!item) return

    const newPendingChange = pendingStockChange + change
    const newStock = item.stock + newPendingChange

    // Prevent going below 0
    if (newStock < 0) return

    setPendingStockChange(newPendingChange)
    setChangeHistory((prev) => [...prev, change])
  }

  const applyStockChange = () => {
    if (!item || pendingStockChange === 0) return

    onApplyChange(item, pendingStockChange)

    // Reset and close modal
    setPendingStockChange(0)
    setChangeHistory([])
    onClose()
  }

  const resetStockPreview = () => {
    setPendingStockChange(0)
    setChangeHistory([])
  }

  const undoLastChange = () => {
    if (changeHistory.length === 0) return

    const lastChange = changeHistory[changeHistory.length - 1]
    setPendingStockChange((prev) => prev - lastChange)
    setChangeHistory((prev) => prev.slice(0, -1))
  }

  const handleCustomStockInput = () => {
    onClose()
    if (item) {
      onOpenEditModal(item)
    }
  }

  // Calculate preview values
  const getPreviewStock = () => {
    if (!item) return 0
    return Math.max(0, item.stock + pendingStockChange)
  }

  const isValidChange = (change: number) => {
    if (!item) return false
    return item.stock + pendingStockChange + change >= 0
  }

  // Format change history for display
  const formatChangeHistory = () => {
    if (changeHistory.length === 0) return ""

    return changeHistory.map((change) => (change > 0 ? `+${change}` : `${change}`)).join(" ")
  }

  // Count how many times each preset was used
  const getPresetCount = (amount: number, isNegative = false) => {
    const targetValue = isNegative ? -amount : amount
    return changeHistory.filter((change) => change === targetValue).length
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity className="items-center justify-center flex-1 bg-black/50" activeOpacity={1} onPress={onClose}>
        <TouchableOpacity className="bg-white rounded-[12px] p-6 mx-4 min-w-[320px]" activeOpacity={1}>
          {item && (
            <>
              <Text className="mb-2 text-lg font-semibold text-center text-gray-800">{item.name}</Text>

              {/* Stock Preview Section */}
              <View className="bg-gray-50 rounded-[8px] p-4 mb-4">
                {pendingStockChange === 0 ? (
                  <Text className="text-center text-gray-600">
                    Stok saat ini: <Text className="font-bold text-gray-800">{item.stock} pcs</Text>
                  </Text>
                ) : (
                  <View className="items-center">
                    <Text className="mb-2 text-sm text-gray-600">Preview Perubahan:</Text>
                    <View className="flex-row items-center justify-center mb-2">
                      <Text className="text-lg font-bold text-gray-800">{item.stock}</Text>
                      <Text
                        className={`text-lg font-bold mx-2 ${pendingStockChange > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {pendingStockChange > 0 ? "+" : ""}
                        {pendingStockChange}
                      </Text>
                      <Text className="text-lg font-bold text-gray-400">=</Text>
                      <Text
                        className={`text-lg font-bold ml-2 ${getPreviewStock() === 0 ? "text-red-600" : "text-blue-600"}`}
                      >
                        {getPreviewStock()} pcs
                      </Text>
                    </View>
                    {changeHistory.length > 0 && (
                      <Text className="text-xs text-gray-500">Operasi: {formatChangeHistory()}</Text>
                    )}
                  </View>
                )}
              </View>

              <Text className="mb-3 text-sm font-medium text-gray-700">Kurangi Stok:</Text>
              <View className="flex-row justify-between mb-6">
                {stockPresets.map((amount) => {
                  const count = getPresetCount(amount, true)
                  return (
                    <TouchableOpacity
                      key={`minus-${amount}`}
                      className={`flex-1 border rounded-[8px] py-3 mx-1 relative ${
                        !isValidChange(-amount)
                          ? "bg-gray-100 border-gray-200"
                          : count > 0
                            ? "bg-red-100 border-red-300"
                            : "bg-red-50 border-red-200"
                      }`}
                      onPress={() => handleStackableStockChange(-amount)}
                      disabled={!isValidChange(-amount)}
                    >
                      <Text
                        className={`text-center font-medium ${
                          !isValidChange(-amount) ? "text-gray-400" : count > 0 ? "text-red-700" : "text-red-600"
                        }`}
                      >
                        -{amount}
                      </Text>
                      {count > 0 && (
                        <View className="absolute items-center justify-center w-5 h-5 bg-red-500 rounded-full -top-1 -right-1">
                          <Text className="text-xs font-bold text-white">{count}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )
                })}
              </View>

              <Text className="mb-3 text-sm font-medium text-gray-700">Tambah Stok:</Text>
              <View className="flex-row justify-between mb-6">
                {stockPresets.map((amount) => {
                  const count = getPresetCount(amount, false)
                  return (
                    <TouchableOpacity
                      key={`plus-${amount}`}
                      className={`flex-1 border rounded-[8px] py-3 mx-1 relative ${
                        count > 0 ? "bg-green-100 border-green-300" : "bg-green-50 border-green-200"
                      }`}
                      onPress={() => handleStackableStockChange(amount)}
                    >
                      <Text className={`text-center font-medium ${count > 0 ? "text-green-700" : "text-green-600"}`}>
                        +{amount}
                      </Text>
                      {count > 0 && (
                        <View className="absolute items-center justify-center w-5 h-5 bg-green-500 rounded-full -top-1 -right-1">
                          <Text className="text-xs font-bold text-white">{count}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )
                })}
              </View>

              {/* Utility Buttons (Undo/Reset) - Only show when there are changes */}
              {pendingStockChange !== 0 && (
                <View className="flex-row justify-center mb-6">
                  {changeHistory.length > 0 && (
                    <TouchableOpacity
                      className="flex-row items-center justify-center bg-orange-100 rounded-[8px] px-4 py-2 mx-1 flex-1"
                      onPress={undoLastChange}
                    >
                      <Undo2 size={18} color="#c2410c" />
                      <Text className="ml-2 text-sm font-medium text-orange-700">Undo</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    className="flex-row items-center justify-center bg-gray-100 rounded-[8px] px-4 py-2 mx-1 flex-1"
                    onPress={resetStockPreview}
                  >
                    <RotateCcw size={18} color="#374151" />
                    <Text className="ml-2 text-sm font-medium text-gray-700">Reset</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Primary Action Button */}
              {pendingStockChange !== 0 && (
                <TouchableOpacity
                  className="flex-row items-center justify-center bg-blue-500 rounded-[8px] py-4 mb-4"
                  onPress={applyStockChange}
                >
                  <Check size={22} color="#ffffff" />
                  <Text className="ml-2 text-lg font-semibold text-center text-white">
                    Terapkan Perubahan ({pendingStockChange > 0 ? "+" : ""}
                    {pendingStockChange})
                  </Text>
                </TouchableOpacity>
              )}

              {/* Secondary Action Buttons */}
              <View className="flex-row">
                <TouchableOpacity
                  className="flex-row items-center justify-center bg-orange-500 rounded-[8px] py-3 flex-1 mr-4"
                  onPress={handleCustomStockInput}
                >
                  <Edit size={18} color="#ffffff" />
                  <Text className="ml-2 font-medium text-center text-white">Input Manual</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center justify-center bg-gray-300 rounded-[8px] py-3 flex-1"
                  onPress={onClose}
                >
                  <X size={18} color="#374151" />
                  <Text className="ml-2 font-medium text-center text-gray-700">Tutup</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}
