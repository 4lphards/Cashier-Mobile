"use client"

import { Search, Filter, ChevronDown, Edit, Trash2, Plus } from "lucide-react-native"
import { TextInput, View, TouchableOpacity, FlatList, Text, RefreshControl, Image } from "react-native"
import { useState, useEffect } from "react"
import { PosService, type Items } from "~/services/POSService"
import { formatToIDR } from "~/utils/formatting"
import DeleteModal from "~/components/delete-modal"
import EditModal from "~/components/edit-modal"
import QuickStockModal from "~/components/quick-stock-modal"
import FilterModal from "~/components/filter-modal"
import AddModal from "~/components/add-modal"
import { useToast } from "~/contexts/toastContext"

interface FilterOption {
  label: string
  value: string
}

export default function Inventory() {
  const { showToast } = useToast()
  const [items, setItems] = useState<Items[]>([])
  const [filteredItems, setFilteredItems] = useState<Items[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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

  const filterOptions = [
    { label: "A ~ Z", value: "asc" },
    { label: "Z ~ A", value: "desc" },
    { label: "Stok Terendah", value: "lowStock" },
    { label: "Stok Tertinggi", value: "highStock" },
    { label: "Harga Terendah", value: "lowPrice" },
    { label: "Harga Tertinggi", value: "highPrice" },
  ]

  const fetchItems = async () => {
    try {
      const data = await PosService.getItems()
      setItems(data)
      applyFiltersAndSearch(data, searchQuery, currentFilter)
    } catch (error) {
      console.error("Error fetching items:", error)
      showToast("Gagal memuat data barang", "error")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchItems()
  })

  const onRefresh = () => {
    setRefreshing(true)
    fetchItems()
  }

  const applyFiltersAndSearch = (itemList: Items[], query: string, filter: string | null) => {
    let filtered = [...itemList]

    // Apply search filter
    if (query.length > 0) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
    }

    // Apply sorting filter
    if (filter) {
      switch (filter) {
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

  const getFilterLabel = (filterValue: string | null): string => {
    const filter = filterOptions.find((option) => option.value === filterValue)
    return filter ? filter.label : "Semua"
  }

  const handleFilterSelect = (filter: FilterOption): void => {
    setFilterModalVisible(false)
    setCurrentFilter(filter.value)
    applyFiltersAndSearch(items, searchQuery, filter.value)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    applyFiltersAndSearch(items, query, currentFilter)
  }

  const handleDeleteItem = async (id: number) => {
    try {
      const success = await PosService.deleteItem(id)
      if (success) {
        await fetchItems() // Refresh the list
        showToast("Barang berhasil dihapus", "success")
      } else {
        showToast("Gagal menghapus barang", "error")
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      showToast("Terjadi kesalahan saat menghapus barang", "error")
    }
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

  const handleEditSave = async (
    editedItem: Items,
    imageFile?: { uri: string; name: string },
    removeImage?: boolean,
  ) => {
    try {
      const updated = await PosService.updateItem(
        editedItem.id,
        {
          name: editedItem.name,
          price: editedItem.price,
          stock: editedItem.stock,
          barcode: editedItem.barcode,
        },
        imageFile,
        removeImage,
      )
      if (updated) {
        await fetchItems() // Refresh the list
        showToast("Barang berhasil diperbarui", "success")
      } else {
        showToast("Gagal memperbarui barang", "error")
      }
    } catch (error) {
      console.error("Error updating item:", error)
      showToast("Terjadi kesalahan saat memperbarui barang", "error")
    }
  }

  const openQuickStockModal = (item: Items) => {
    setItemForQuickStock(item)
    setQuickStockModalVisible(true)
  }

  const handleStockChange = async (item: Items, stockChange: number) => {
    try {
      const updated = await PosService.updateItemStock(item.id, stockChange)
      if (updated) {
        await fetchItems() // Refresh the list
        const action = stockChange > 0 ? "ditambah" : "dikurangi"
        showToast(`Stok ${item.name} berhasil ${action}`, "success")
      } else {
        showToast("Gagal mengubah stok", "error")
      }
    } catch (error) {
      console.error("Error updating stock:", error)
      showToast("Terjadi kesalahan saat mengubah stok", "error")
    }
  }

  const handleResetFilter = () => {
    setCurrentFilter(null)
    applyFiltersAndSearch(items, searchQuery, null)
    setFilterModalVisible(false)
  }

  const handleAddItem = async (
    newItem: Omit<Items, "id" | "created_at" | "updated_at">,
    imageFile?: { uri: string; name: string },
  ) => {
    try {
      const created = await PosService.createItem(newItem, imageFile)
      if (created) {
        await fetchItems() // Refresh the list
        showToast("Barang berhasil ditambahkan", "success")
      } else {
        showToast("Gagal menambahkan barang", "error")
      }
    } catch (error) {
      console.error("Error creating item:", error)
      showToast("Terjadi kesalahan saat menambahkan barang", "error")
    }
  }

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 p-4 bg-white">
        <Text className="text-gray-600">Memuat data...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <View className="flex-row mb-4">
        <View className="relative flex-row items-center border border-gray-300 rounded-[8px] pl-2 w-5/6">
          <View className="relative flex-row items-center">
            <Search className="absolute" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 p-2 pl-8"
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
              applyFiltersAndSearch(items, "", null)
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="items-center justify-center flex-1 p-8">
            <Text className="text-center text-gray-500">
              {searchQuery || currentFilter ? "Tidak ada barang yang sesuai dengan filter" : "Belum ada barang"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="p-4 mb-3 bg-white border border-gray-100 rounded-[8px] shadow-sm">
            <View className="flex-row items-start mb-3">
              <View className="w-20 h-20 mr-3 bg-gray-100 border border-gray-200 rounded-[8px] justify-center items-center">
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    className="w-full h-full rounded-[8px]"
                    resizeMode="cover"
                    onError={() => console.log("Failed to load image")}
                  />
                ) : (
                  <Text className="text-xs text-gray-400">IMG</Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-lg font-semibold text-gray-800">{item.name}</Text>
                {item.barcode && <Text className="text-xs text-gray-500">Barcode: {item.barcode}</Text>}
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
                <Text className={`text-sm font-medium ${item.stock === 0 ? "text-red-600" : "text-gray-800"}`}>
                  {item.stock} pcs
                </Text>
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
                <ChevronDown size={16} color="#2563EB" />
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
