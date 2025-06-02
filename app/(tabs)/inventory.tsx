"use client"

import { Search, Filter, ChevronDownIcon, Edit, Trash2, Plus } from "lucide-react-native"
import { TextInput, View, TouchableOpacity, FlatList, Text } from "react-native"
import { useState } from "react"
import type { Items } from "~/services/POSService"
import { formatToIDR } from "~/utils/formatting"
import DeleteModal from "~/components/delete-modal"
import EditModal from "~/components/edit-modal"
import QuickStockModal from "~/components/quick-stock-modal"
import FilterModal from "~/components/filter-modal"
import AddModal from "~/components/add-modal"

const dummyData: Items[] = [
  { id: 1, name: "Keripik Kentang", price: 8000, stock: 45, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 2, name: "Biskuit Cokelat", price: 12000, stock: 32, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 3, name: "Permen Karet", price: 3000, stock: 85, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 4, name: "Wafer Vanilla", price: 15000, stock: 28, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 5, name: "Kacang Atom", price: 6000, stock: 60, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 6, name: "Cokelat Batang", price: 18000, stock: 22, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 7, name: "Kerupuk Udang", price: 5000, stock: 75, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 8, name: "Cookies Oatmeal", price: 14000, stock: 18, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 9, name: "Chiki Balls", price: 4500, stock: 95, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 10, name: "Pocky Strawberry", price: 11000, stock: 40, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 11, name: "Taro Net", price: 7500, stock: 55, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 12, name: "Oreo Original", price: 16000, stock: 25, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
]

interface FilterOption {
  label: string
  value: string
}

export default function Inventory() {
  const [isFilterModalVisible, setFilterModalVisible] = useState(false)
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false)
  const [isEditModalVisible, setEditModalVisible] = useState(false)
  const [isQuickStockModalVisible, setQuickStockModalVisible] = useState(false)
  const [isAddModalVisible, setAddModalVisible] = useState(false)

  const [itemToDelete, setItemToDelete] = useState<Items | null>(null)
  const [itemToEdit, setItemToEdit] = useState<Items | null>(null)
  const [itemForQuickStock, setItemForQuickStock] = useState<Items | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [currentFilter, setCurrentFilter] = useState<string | null>(null)
  const [filteredItems, setFilteredItems] = useState<Items[]>(dummyData)

  const filterOptions = [
    { label: "A ~ Z", value: "asc" },
    { label: "Z ~ A", value: "desc" },
    { label: "Stok Terendah", value: "lowStock" },
    { label: "Stok Tertinggi", value: "highStock" },
    { label: "Harga Terendah", value: "lowPrice" },
    { label: "Harga Tertinggi", value: "highPrice" },
  ]

  const getFilterLabel = (filterValue: string | null): string => {
    const filter = filterOptions.find((option) => option.value === filterValue)
    return filter ? filter.label : "Semua"
  }

  const handleFilterSelect = (filter: FilterOption): void => {
    setFilterModalVisible(false)
    setCurrentFilter(filter.value)

    let sortedItems = [...dummyData]
    switch (filter.value) {
      case "asc":
        sortedItems.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "desc":
        sortedItems.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "lowStock":
        sortedItems.sort((a, b) => a.stock - b.stock)
        break
      case "highStock":
        sortedItems.sort((a, b) => b.stock - a.stock)
        break
      case "lowPrice":
        sortedItems.sort((a, b) => a.price - b.price)
        break
      case "highPrice":
        sortedItems.sort((a, b) => b.price - a.price)
        break
    }

    if (searchQuery.length > 0) {
      sortedItems = sortedItems.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    setFilteredItems(sortedItems)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const filtered = dummyData.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))

    if (currentFilter) {
      switch (currentFilter) {
        case "asc":
          filtered.sort((a, b) => a.name.localeCompare(b.name))
          break
        case "desc":
          filtered.sort((a, b) => b.name.localeCompare(a.name))
          break
        case "lowStock":
          filtered.sort((a, b) => a.stock - b.stock)
          break
        case "highStock":
          filtered.sort((a, b) => b.stock - a.stock)
          break
        case "lowPrice":
          filtered.sort((a, b) => a.price - b.price)
          break
        case "highPrice":
          filtered.sort((a, b) => b.price - a.price)
          break
      }
    }

    setFilteredItems(filtered)
  }

  const handleDeleteItem = (id: number) => {
    const updatedItems = filteredItems.filter((item) => item.id !== id)
    setFilteredItems(updatedItems)
    setDeleteModalVisible(false)
    setItemToDelete(null)
  }

  const confirmDeleteItem = (item: Items) => {
    setItemToDelete(item)
    setDeleteModalVisible(true)
  }

  const openEditModal = (item: Items) => {
    setItemToEdit(item)
    setEditModalVisible(true)
  }

  const handleEditSave = (editedItem: Items) => {
    const updatedItems = filteredItems.map((item) => (item.id === editedItem.id ? editedItem : item))
    setFilteredItems(updatedItems)
    console.log("Item saved:", editedItem)
  }

  const openQuickStockModal = (item: Items) => {
    setItemForQuickStock(item)
    setQuickStockModalVisible(true)
  }

  const handleStockChange = (item: Items, stockChange: number) => {
    const updatedItems = filteredItems.map((currentItem) => {
      if (currentItem.id === item.id) {
        const newStock = Math.max(0, currentItem.stock + stockChange)
        return { ...currentItem, stock: newStock }
      }
      return currentItem
    })
    setFilteredItems(updatedItems)
  }

  const handleResetFilter = () => {
    setCurrentFilter(null)
    setFilteredItems(dummyData.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase())))
    setFilterModalVisible(false)
  }

  const handleAddItem = (newItem: Omit<Items, "id" | "createdAt" | "updatedAt">) => {
    // Generate a new ID (in a real app, this would come from the backend)
    const newId = Math.max(...filteredItems.map((item) => item.id)) + 1
    const now = new Date().toISOString()

    const itemToAdd: Items = {
      ...newItem,
      id: newId,
      createdAt: now,
      updatedAt: now,
    }

    const updatedItems = [...filteredItems, itemToAdd]
    setFilteredItems(updatedItems)
    console.log("New item added:", itemToAdd)
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <View className="flex-row mb-4">
        <View className="relative flex-row items-center border border-gray-300 rounded-[8px] pl-2 w-5/6">
          <View className="relative flex-row items-center">
            <Search className="absolute" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 p-2"
              placeholder="Cari barang..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
          {searchQuery.length > 0 && (
            <TouchableOpacity
              className="absolute p-2 right-2"
              onPress={() => {
                setSearchQuery("")
                handleSearch("")
              }}
            >
              <Text className="text-gray-400">X</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          className="flex-row items-center justify-center w-1/6 border border-gray-300 rounded-[8px] bg-white ml-2"
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {currentFilter && (
        <View className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-[8px] justify-between flex-row">
          <Text className="text-sm text-gray-600">
            Filter: <Text className="font-medium text-gray-800">{getFilterLabel(currentFilter)}</Text>
            {searchQuery.length > 0 && (
              <Text className="text-gray-600">
                {" "}
                • Pencarian: <Text className="font-medium text-gray-800">&quot;{searchQuery}&quot;</Text>
              </Text>
            )}
          </Text>
          <TouchableOpacity
            className="mr-2"
            onPress={() => {
              setCurrentFilter(null)
              setSearchQuery("")
              setFilteredItems(dummyData)
            }}
          >
            <Text className="text-sm text-center">X</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View className="p-4 mb-3 bg-white border border-gray-100 rounded-[8px] shadow-sm">
            <View className="flex-row items-start mb-3">
              <View className="w-20 h-20 mr-3 bg-gray-100 border border-gray-200 rounded-[8px] justify-center items-center">
                <Text className="text-xs text-gray-400">IMG</Text>
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-lg font-semibold text-gray-800">{item.name}</Text>
              </View>
              <View className="flex-row">
                <View className="p-[2px] rounded-[8px] bg-blue-50">
                  <TouchableOpacity className="p-2" onPress={() => openEditModal(item)}>
                    <Edit size={20} color="#4F8BE5" />
                  </TouchableOpacity>
                </View>
                <View className="p-[2px] rounded-[8px] bg-red-50 ml-4">
                  <TouchableOpacity className="p-2" onPress={() => confirmDeleteItem(item)}>
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <View>
                <Text className="mb-1 text-xs text-gray-500">Stok</Text>
                <Text className="text-sm font-medium text-gray-800">{item.stock} pcs</Text>
              </View>
              <View>
                <Text className="mb-1 text-xs text-gray-500">Harga</Text>
                <Text className="text-sm font-medium text-gray-800">{formatToIDR(item.price)}</Text>
              </View>

              <TouchableOpacity
                className="flex-row items-center px-3 py-2 border border-blue-200 rounded-[8px] bg-blue-50"
                onPress={() => openQuickStockModal(item)}
              >
                <Text className="mr-1 text-sm font-medium text-blue-600">Ubah Stok</Text>
                <ChevronDownIcon size={16} color="#2563EB" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Floating Action Button for Adding Items */}
      <TouchableOpacity
        className="absolute items-center justify-center bg-blue-500 rounded-full shadow-lg bottom-6 right-6 w-14 h-14"
        onPress={() => setAddModalVisible(true)}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal Components */}
      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onFilterSelect={handleFilterSelect}
        onResetFilter={handleResetFilter}
      />

      <DeleteModal
        visible={isDeleteModalVisible}
        item={itemToDelete}
        onClose={() => {
          setDeleteModalVisible(false)
          setItemToDelete(null)
        }}
        onConfirm={handleDeleteItem}
      />

      <EditModal
        visible={isEditModalVisible}
        item={itemToEdit}
        onClose={() => {
          setEditModalVisible(false)
          setItemToEdit(null)
        }}
        onSave={handleEditSave}
      />

      <QuickStockModal
        visible={isQuickStockModalVisible}
        item={itemForQuickStock}
        onClose={() => {
          setQuickStockModalVisible(false)
          setItemForQuickStock(null)
        }}
        onApplyChange={handleStockChange}
        onOpenEditModal={openEditModal}
      />

      <AddModal visible={isAddModalVisible} onClose={() => setAddModalVisible(false)} onSave={handleAddItem} />
    </View>
  )
}
