"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"
import Toast from "../components/toast"

interface ToastContextType {
  showToast: (message: string, type: "success" | "error" | "warning" | "info") => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<{
    visible: boolean
    message: string
    type: "success" | "error" | "warning" | "info"
  }>({
    visible: false,
    message: "",
    type: "info",
  })

  const showToast = (message: string, type: "success" | "error" | "warning" | "info") => {
    setToast({
      visible: true,
      message,
      type,
    })
  }

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </ToastContext.Provider>
  )
}
