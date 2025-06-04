"use client"

import type React from "react"
import { useState } from "react"
import { View, TouchableOpacity, Text, Modal, ScrollView } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Calendar, ChevronDown, X, ChevronLeft, ChevronRight } from "lucide-react-native"
import type { TimePeriod } from "./period-selector"

interface DateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  period: TimePeriod
}

export const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange, period }) => {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [showYearPicker, setShowYearPicker] = useState(false)

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  const formatDateForPeriod = (date: Date, period: TimePeriod): string => {
    switch (period) {
      case "day":
        return date.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      case "week":
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        return `${weekStart.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} - ${weekEnd.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}`
      case "month":
        return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
      case "year":
        return date.getFullYear().toString()
      case "all-time":
        return "Seluruh Data"
      default:
        return date.toLocaleDateString("id-ID")
    }
  }

  const handleDateSelection = () => {
    if (period === "month") {
      setShowMonthPicker(true)
    } else if (period === "year") {
      setShowYearPicker(true)
    } else if (period === "all-time") {
      // Do nothing for all-time
      return
    } else {
      setShowDatePicker(true)
    }
  }

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(monthIndex)
    onDateChange(newDate)
    setShowMonthPicker(false)
  }

  const handleYearSelect = (year: number) => {
    const newDate = new Date(selectedDate)
    newDate.setFullYear(year)
    onDateChange(newDate)
    setShowYearPicker(false)
  }

  const handlePreviousPeriod = () => {
    if (period === "all-time") return

    const newDate = new Date(selectedDate)

    switch (period) {
      case "day":
        newDate.setDate(selectedDate.getDate() - 1)
        break
      case "week":
        newDate.setDate(selectedDate.getDate() - 7)
        break
      case "month":
        newDate.setMonth(selectedDate.getMonth() - 1)
        break
      case "year":
        newDate.setFullYear(selectedDate.getFullYear() - 1)
        break
    }

    onDateChange(newDate)
  }

  const handleNextPeriod = () => {
    if (period === "all-time") return

    const newDate = new Date(selectedDate)

    switch (period) {
      case "day":
        newDate.setDate(selectedDate.getDate() + 1)
        break
      case "week":
        newDate.setDate(selectedDate.getDate() + 7)
        break
      case "month":
        newDate.setMonth(selectedDate.getMonth() + 1)
        break
      case "year":
        newDate.setFullYear(selectedDate.getFullYear() + 1)
        break
    }

    onDateChange(newDate)
  }

  return (
    <View className="mb-4">
      <View className="flex-row items-center">
        {/* Left Arrow */}
        <TouchableOpacity
          className={`p-3 rounded-[8px] ${period === "all-time" ? "bg-gray-100" : "bg-white border border-gray-300"}`}
          onPress={handlePreviousPeriod}
          disabled={period === "all-time"}
        >
          <ChevronLeft size={20} color={period === "all-time" ? "#D1D5DB" : "#6B7280"} />
        </TouchableOpacity>

        <View className="w-2"/>

        {/* Date Picker */}
        <View className="flex-1">
          {period === "all-time" ? (
            <View className="flex-row items-center justify-between p-3 bg-gray-100 border border-gray-300 rounded-[8px]">
              <View className="flex-row items-center">
                <Calendar size={20} color="#6B7280" />
                <Text className="ml-2 font-medium text-gray-700">{formatDateForPeriod(selectedDate, period)}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className="flex-row items-center justify-between p-3 bg-white border border-gray-300 rounded-[8px]"
              onPress={handleDateSelection}
            >
              <View className="flex-row items-center">
                <Calendar size={20} color="#6B7280" />
                <Text className="ml-2 font-medium text-gray-700">{formatDateForPeriod(selectedDate, period)}</Text>
              </View>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        <View className="w-2"/>

        {/* Right Arrow */}
        <TouchableOpacity
          className={`p-3 rounded-[8px] ${period === "all-time" ? "bg-gray-100" : "bg-white border border-gray-300"}`}
          onPress={handleNextPeriod}
          disabled={period === "all-time"}
        >
          <ChevronRight size={20} color={period === "all-time" ? "#D1D5DB" : "#6B7280"} />
        </TouchableOpacity>
      </View>

      {/* Regular Date Picker for day and week */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false)
            if (date) {
              onDateChange(date)
            }
          }}
        />
      )}

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <View className="items-center justify-center flex-1 bg-black/50">
          <View className="p-6 m-4 bg-white rounded-xl max-h-96 w-80">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">Pilih Bulan</Text>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {months.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  className={`p-3 rounded-[8px] mb-2 ${selectedDate.getMonth() === index ? "bg-blue-500" : "bg-gray-50"}`}
                  onPress={() => handleMonthSelect(index)}
                >
                  <Text
                    className={`text-center font-medium ${
                      selectedDate.getMonth() === index ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {month} {selectedDate.getFullYear()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <View className="items-center justify-center flex-1 bg-black/50">
          <View className="p-6 m-4 bg-white rounded-xl max-h-96 w-80">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">Pilih Tahun</Text>
              <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  className={`p-3 rounded-[8px] mb-2 ${
                    selectedDate.getFullYear() === year ? "bg-blue-500" : "bg-gray-50"
                  }`}
                  onPress={() => handleYearSelect(year)}
                >
                  <Text
                    className={`text-center font-medium ${
                      selectedDate.getFullYear() === year ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}
