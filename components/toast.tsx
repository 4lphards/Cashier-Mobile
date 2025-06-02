"use client"

import { useEffect, useRef } from "react"
import { Text, Animated } from "react-native"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react-native"

interface ToastProps {
  visible: boolean
  message: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
  onHide: () => void
}

export default function Toast({ visible, message, type, duration = 3000, onHide }: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible])

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide()
    })
  }

  const getToastConfig = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: "bg-green-500",
          icon: <CheckCircle size={20} color="#ffffff" />,
        }
      case "error":
        return {
          backgroundColor: "bg-red-500",
          icon: <XCircle size={20} color="#ffffff" />,
        }
      case "warning":
        return {
          backgroundColor: "bg-orange-500",
          icon: <AlertCircle size={20} color="#ffffff" />,
        }
      case "info":
        return {
          backgroundColor: "bg-blue-500",
          icon: <Info size={20} color="#ffffff" />,
        }
      default:
        return {
          backgroundColor: "bg-gray-500",
          icon: <Info size={20} color="#ffffff" />,
        }
    }
  }

  const config = getToastConfig()

  if (!visible) return null

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 50,
        left: 16,
        right: 16,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
      className={`${config.backgroundColor} rounded-xl p-4 shadow-lg flex-row items-center`}
    >
      {config.icon}
      <Text className="flex-1 ml-3 font-medium text-white">{message}</Text>
    </Animated.View>
  )
}
