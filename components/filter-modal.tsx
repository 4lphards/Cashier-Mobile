import { Modal, Text, TouchableOpacity, FlatList } from "react-native"

interface FilterOption {
  label: string
  value: string
}

interface FilterModalProps {
  visible: boolean
  onClose: () => void
  onFilterSelect: (filter: FilterOption) => void
  onResetFilter: () => void
}

export default function FilterModal({ visible, onClose, onFilterSelect, onResetFilter }: FilterModalProps) {
  const filterOptions: FilterOption[] = [
    { label: "A ~ Z", value: "asc" },
    { label: "Z ~ A", value: "desc" },
    { label: "Stok Terendah", value: "lowStock" },
    { label: "Stok Tertinggi", value: "highStock" },
    { label: "Harga Terendah", value: "lowPrice" },
    { label: "Harga Tertinggi", value: "highPrice" },
  ]

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        className="items-end justify-start flex-1 pt-16 pr-4 bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity className="w-48 bg-white rounded-[12px] p-4 border border-gray-300" activeOpacity={1}>
          <FlatList
            data={filterOptions}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity className="p-2 border-b border-gray-200" onPress={() => onFilterSelect(item)}>
                <Text className="text-gray-800">{item.label}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity className="mt-2 p-2 bg-red-100 rounded-[8px]" onPress={onResetFilter}>
            <Text className="text-center text-red-600">Reset Filter</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}
