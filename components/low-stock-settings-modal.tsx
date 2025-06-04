"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, Modal, TouchableOpacity, TextInput } from "react-native"
import { Settings, X, Save } from "lucide-react-native"

interface LowStockSettingsModalProps {
  visible: boolean
  onClose: () => void
  currentThreshold: number
  onSave: (threshold: number) => void
}

export const LowStockSettingsModal: React.FC<LowStockSettingsModalProps> = ({
  visible,
  onClose,
  currentThreshold,
  onSave,
}) => {
  const [threshold, setThreshold] = useState(currentThreshold.toString())

  const handleSave = () => {
    const numThreshold = Number.parseInt(threshold)
    if (!isNaN(numThreshold) && numThreshold >= 0) {
      onSave(numThreshold)
      onClose()
    }
  }

  const handleClose = () => {
    setThreshold(currentThreshold.toString()) // Reset to current value
    onClose()
  }

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={handleClose}>
      <View className="items-center justify-center flex-1 bg-black/50">
        <View className="p-6 m-4 bg-white rounded-xl w-80">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <Settings size={24} color="#6B7280" />
              <Text className="ml-2 text-lg font-bold text-gray-800">Pengaturan Stok Menipis</Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-gray-700">Batas Peringatan Stok Menipis</Text>
            <Text className="mb-3 text-xs text-gray-500">
              Barang akan ditandai sebagai stok menipis jika jumlahnya ≤ nilai ini
            </Text>

            <View className="flex-row items-center">
              <TextInput
                className="flex-1 p-3 text-center border border-gray-300 rounded-[8px]"
                value={threshold}
                onChangeText={setThreshold}
                keyboardType="numeric"
                placeholder="10"
                placeholderTextColor="#9CA3AF"
              />
              <Text className="ml-2 text-gray-600">pcs</Text>
            </View>
          </View>

          <View className="space-y-3">
            <Text className="text-sm font-medium text-gray-700">Contoh:</Text>
            <View className="p-3 rounded-[8px] bg-gray-50">
              <Text className="text-xs text-gray-600">• Jika diset 10: barang dengan stok 1-10 akan ditandai ⚠️</Text>
              <Text className="mt-1 text-xs text-gray-600">• Jika diset 5: barang dengan stok 1-5 akan ditandai ⚠️</Text>
              <Text className="mt-1 text-xs text-gray-600">• Barang dengan stok 0 akan selalu ditandai ❌</Text>
            </View>
          </View>

          <View className="flex-row mt-6 space-x-3">
            <TouchableOpacity className="flex-1 p-3 border border-gray-300 rounded-[8px]" onPress={handleClose}>
              <Text className="font-medium text-center text-gray-700">Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-center flex-1 p-3 bg-blue-500 rounded-[8px]"
              onPress={handleSave}
            >
              <Save size={16} color="#FFFFFF" />
              <Text className="ml-2 font-medium text-center text-white">Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
