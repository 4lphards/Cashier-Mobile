import React from "react"
import { View, Text } from "react-native"

interface SettingsItemProps {
  label: string
  description?: string
  children: React.ReactNode
  isLast?: boolean
}

export const SettingsItem: React.FC<SettingsItemProps> = React.memo(
  ({ label, description, children, isLast = false }) => {
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
)
