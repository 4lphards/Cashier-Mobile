import React from "react"
import { View, Text } from "react-native"

interface SettingsSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

export const SettingsSection: React.FC<SettingsSectionProps> = React.memo(({ title, icon, children }) => {
  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        {icon}
        <Text className="ml-2 text-lg font-bold text-gray-800">{title}</Text>
      </View>
      <View className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">{children}</View>
    </View>
  )
})
