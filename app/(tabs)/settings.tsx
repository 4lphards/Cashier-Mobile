"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { View, Text, ScrollView, TextInput } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Package } from "lucide-react-native"
import { useToast } from "~/contexts/toastContext"

interface InventorySettings {
  lowStockThreshold: number
  enableLowStockAlerts: boolean
  autoUpdateStock: boolean
}

const DEFAULT_SETTINGS: InventorySettings = {
  lowStockThreshold: 10,
  enableLowStockAlerts: true,
  autoUpdateStock: true,
}

// Storage keys
const STORAGE_KEYS = {
  lowStockThreshold: "lowStockThreshold",
  enableLowStockAlerts: "enableLowStockAlerts",
  autoUpdateStock: "autoUpdateStock",
} as const

interface SettingsSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon, children }) => {
  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        {icon}
        <Text className="ml-2 text-lg font-bold text-gray-800">{title}</Text>
      </View>
      <View className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">{children}</View>
    </View>
  )
}

interface SettingsItemProps {
  label: string
  description?: string
  children: React.ReactNode
  isLast?: boolean
}

const SettingsItem: React.FC<SettingsItemProps> = ({ label, description, children, isLast = false }) => {
  return (
    <View className={`${!isLast ? "border-b border-gray-100 pb-4 mb-4" : ""}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-medium text-gray-800">{label}</Text>
          {description && <Text className="mt-1 text-sm text-gray-500">{description}</Text>}
        </View>
        <View className="ml-4">{children}</View>
      </View>
    </View>
  )
}

export default function Settings() {
  const { showToast } = useToast()
  const [settings, setSettings] = useState<InventorySettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  const loadSettings = useCallback(async () => {
    try {
      const keys = Object.values(STORAGE_KEYS)
      const values = await AsyncStorage.multiGet(keys)
      const loadedSettings: Record<keyof InventorySettings, InventorySettings[keyof InventorySettings]> = { ...DEFAULT_SETTINGS }

      values.forEach(([key, value]) => {
        if (value !== null) {
          // Find the matching setting key
          const settingKey = Object.entries(STORAGE_KEYS).find(([_, val]) => val === key)?.[0] as
            | keyof InventorySettings
            | undefined

          if (settingKey) {
            if (typeof DEFAULT_SETTINGS[settingKey] === "boolean") {
              loadedSettings[settingKey] = value === "true"
            } else if (typeof DEFAULT_SETTINGS[settingKey] === "number") {
              loadedSettings[settingKey] = Number.parseFloat(value)
            }
          }
        }
      })

      setSettings(loadedSettings as InventorySettings)
    } catch (error) {
      console.error("Error loading settings:", error)
      showToast("Gagal memuat pengaturan", "error")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const updateSetting = async <K extends keyof InventorySettings>(key: K, value: InventorySettings[K]) => {
    try {
      // Update local state immediately
      setSettings((prev) => ({ ...prev, [key]: value }))

      // Get the storage key
      const storageKey = STORAGE_KEYS[key]

      // Save to AsyncStorage
      await AsyncStorage.setItem(storageKey, String(value))

      // Show success toast
      showToast("Pengaturan disimpan", "success")
    } catch (error) {
      console.error("Error saving setting:", error)
      showToast("Gagal menyimpan pengaturan", "error")

      // Revert local state on error
      setSettings((prev) => ({ ...prev }))
    }
  }

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 p-4 bg-gray-50">
        <Text className="text-gray-600">Memuat pengaturan...</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      {/* Inventory Settings */}
      <SettingsSection title="Pengaturan Inventori" icon={<Package size={20} color="#3B82F6" />}>
        <SettingsItem label="Batas Stok Menipis" description="Peringatan akan muncul jika stok barang ≤ nilai ini">
          <View className="flex-row items-center">
            <TextInput
              className="w-16 p-2 text-center border border-gray-300 rounded-lg"
              value={settings.lowStockThreshold.toString()}
              onChangeText={(text) => {
                const num = Number.parseInt(text) || 0
                if (num >= 0) {
                  updateSetting("lowStockThreshold", num)
                }
              }}
              keyboardType="numeric"
              placeholder="10"
            />
            <Text className="ml-2 text-gray-600">pcs</Text>
          </View>
        </SettingsItem>
      </SettingsSection>

      {/* Info Section */}
      <View className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
        <Text className="mb-2 text-sm font-medium text-blue-800">💡 Tips Pengaturan Inventori</Text>
        <Text className="mb-1 text-xs text-blue-700">• Set batas stok menipis sesuai dengan waktu restock Anda</Text>
        <Text className="mb-1 text-xs text-blue-700">• Aktifkan peringatan untuk mencegah kehabisan stok</Text>
        <Text className="text-xs text-blue-700">• Update stok otomatis membantu menjaga akurasi inventori</Text>
      </View>
    </ScrollView>
  )
}
