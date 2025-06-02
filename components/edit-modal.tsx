"use client"

import { Modal, View, Text, TouchableOpacity, TextInput, Image, Alert } from "react-native"
import { useState, useEffect } from "react"
import { Camera, Trash2 } from "lucide-react-native"
import type { Items } from "~/services/POSService"

interface EditModalProps {
  visible: boolean
  item: Items | null
  onClose: () => void
  onSave: (item: Items) => void
}

export default function EditModal({ visible, item, onClose, onSave }: EditModalProps) {
  const [editedItem, setEditedItem] = useState<Items | null>(null)

  useEffect(() => {
    if (item) {
      setEditedItem({ ...item })
    }
  }, [item])

  const handleSave = () => {
    if (editedItem) {
      onSave(editedItem)
      onClose()
    }
  }

  const handleImagePicker = () => {
    Alert.alert("Pilih Gambar", "Pilih sumber gambar untuk item ini", [
      {
        text: "Kamera",
        onPress: () => openCamera(),
      },
      {
        text: "Galeri",
        onPress: () => openGallery(),
      },
      {
        text: "Batal",
        style: "cancel",
      },
    ])
  }

  const openCamera = () => {
    // Placeholder for camera functionality
    // In a real app, you would use react-native-image-picker or expo-image-picker
    console.log("Opening camera...")
    // For demo purposes, we would upload the image and the backend would save it with the item ID
    if (editedItem) {
      // The actual image upload would happen here
      // The backend would save the image using the item ID as reference
      Alert.alert("Sukses", "Foto berhasil diambil dan diunggah")
    }
  }

  const openGallery = () => {
    // Placeholder for gallery functionality
    // In a real app, you would use react-native-image-picker or expo-image-picker
    console.log("Opening gallery...")
    // For demo purposes, we would upload the image and the backend would save it with the item ID
    if (editedItem) {
      // The actual image upload would happen here
      // The backend would save the image using the item ID as reference
      Alert.alert("Sukses", "Gambar berhasil dipilih dan diunggah")
    }
  }

  const removeImage = () => {
    Alert.alert("Hapus Gambar", "Apakah Anda yakin ingin menghapus gambar ini?", [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          if (editedItem) {
            // In a real app, you would make an API call to delete the image
            // The backend would remove the image associated with this item ID
            Alert.alert("Sukses", "Gambar berhasil dihapus")
          }
        },
      },
    ])
  }

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity className="justify-end flex-1 bg-black/50" activeOpacity={1} onPress={onClose}>
        <TouchableOpacity
          className="bg-white rounded-t-[16px] p-6 border border-gray-300 max-h-[90%]"
          activeOpacity={1}
        >
          <Text className="mb-4 text-lg font-semibold text-gray-800">Edit Item</Text>
          {editedItem && (
            <>
              {/* Image Section */}
              <Text className="mb-2 text-sm text-gray-600">Gambar Barang</Text>
              <View className="items-center mb-4">
                {editedItem && (
                  <View className="relative">
                    <Image
                      source={{ uri: `https://your-api-url.com/images/${editedItem.id}` }}
                      className="w-32 h-32 rounded-[12px] bg-gray-100"
                      resizeMode="cover"
                      defaultSource={{ uri: "https://via.placeholder.com/150" }}
                      onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
                    />
                    <TouchableOpacity
                      className="absolute p-1 bg-red-500 rounded-full -top-2 -right-2"
                      onPress={removeImage}
                    >
                      <Trash2 size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                )}

                <View className="flex-row mt-3 space-x-3">
                  <TouchableOpacity
                    className="flex-row items-center bg-blue-100 rounded-[8px] px-3 py-2"
                    onPress={handleImagePicker}
                  >
                    <Camera size={16} color="#3B82F6" />
                    <Text className="ml-2 text-sm font-medium text-blue-600">
                      {editedItem ? "Ganti Gambar" : "Tambah Gambar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text className="mb-2 text-sm text-gray-600">Nama Barang</Text>
              <TextInput
                className="border border-gray-300 rounded-[8px] p-2 mb-4"
                value={editedItem.name}
                onChangeText={(text) => setEditedItem({ ...editedItem, name: text })}
                placeholder="Masukkan nama barang"
              />

              <Text className="mb-2 text-sm text-gray-600">Harga</Text>
              <TextInput
                className="border border-gray-300 rounded-[8px] p-2 mb-4"
                keyboardType="numeric"
                value={editedItem.price.toString()}
                onChangeText={(text) => setEditedItem({ ...editedItem, price: Number.parseInt(text) || 0 })}
                placeholder="0"
              />

              <Text className="mb-2 text-sm text-gray-600">Stok</Text>
              <TextInput
                className="border border-gray-300 rounded-[8px] p-2 mb-4"
                keyboardType="numeric"
                value={editedItem.stock.toString()}
                onChangeText={(text) => setEditedItem({ ...editedItem, stock: Number.parseInt(text) || 0 })}
                placeholder="0"
              />
            </>
          )}
          <View className="flex-row justify-end">
            <TouchableOpacity className="px-4 py-2 bg-gray-200 rounded-[8px] mr-2" onPress={onClose}>
              <Text className="text-sm text-gray-800">Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-4 py-2 bg-blue-500 rounded-[8px]" onPress={handleSave}>
              <Text className="text-sm text-white">Simpan</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}
