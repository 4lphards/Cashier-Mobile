import { Modal, View, Text, TouchableOpacity } from "react-native"
import type { Items } from "~/services/POSService"

interface DeleteModalProps {
  visible: boolean
  item: Items | null
  onClose: () => void
  onConfirm: (id: number) => void
}

export default function DeleteModal({ visible, item, onClose, onConfirm }: DeleteModalProps) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity className="items-center justify-center flex-1 bg-black/50" activeOpacity={1} onPress={onClose}>
        <TouchableOpacity className="w-4/5 bg-white rounded-[12px] p-6" activeOpacity={1}>
          <Text className="mb-4 text-lg font-semibold text-gray-800">Konfirmasi Hapus</Text>
          {item && (
            <Text className="mb-6 text-base text-gray-600">
              Apakah Anda yakin ingin menghapus item <Text className="font-medium text-gray-800">{item.name}</Text>?
            </Text>
          )}
          <View className="flex-row justify-end">
            <TouchableOpacity className="px-4 py-2 bg-gray-200 rounded-[8px] mr-2" onPress={onClose}>
              <Text className="text-sm text-gray-800">Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-4 py-2 bg-red-500 rounded-[8px]" onPress={() => item && onConfirm(item.id)}>
              <Text className="text-sm text-white">Hapus</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}
