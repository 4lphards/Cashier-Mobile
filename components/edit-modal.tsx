"use client"

import { Modal, View, Text, TouchableOpacity, TextInput, Alert, Image } from "react-native"
import { useState, useEffect } from "react"
import { Camera as LucideCamera, X } from "lucide-react-native"
import type { Items } from "~/services/POSService"
import * as DocumentPicker from "expo-document-picker"
import { formatToIDR } from "~/utils/formatting"
import CameraModal from "./CameraModal"

interface EditModalProps {
  visible: boolean
  item: Items | null
  onClose: () => void
  onSave: (item: Items, imageFile?: { uri: string; name: string }, removeImage?: boolean) => void
}

export default function EditModal({ visible, item, onClose, onSave }: EditModalProps) {
  const [editedItem, setEditedItem] = useState<Items | null>(null)
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null)
  const [hasImage, setHasImage] = useState(false)
  const [imageRemoved, setImageRemoved] = useState(false)
  const [cameraVisible, setCameraVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [priceInput, setPriceInput] = useState("")

  useEffect(() => {
    if (item) {
      setEditedItem({ ...item })
      setHasImage(!!item.image_url)
      setImageRemoved(false)
      setFile(null)
      setSaving(false)
      setPriceInput(item.price ? formatToIDR(item.price) : "")
    }
  }, [item])

  useEffect(() => {
    setHasImage((!!file || !!editedItem?.image_url) && !imageRemoved)
  }, [file, editedItem, imageRemoved])

  const handleSave = async () => {
    if (editedItem) {
      setSaving(true)

      try {
        const imageFile = file ? { uri: file.uri, name: file.name } : undefined
        await onSave(editedItem, imageFile, imageRemoved)
        onClose()
      } catch (error) {
        console.error("Error saving item:", error)
        Alert.alert("Error", "Gagal menyimpan perubahan")
      } finally {
        setSaving(false)
      }
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

  const openCamera = async () => {
    setCameraVisible(true)
  }

  const openGallery = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0])
        setImageRemoved(false)
      }
    } catch (error) {
      console.error("Error picking document:", error)
      Alert.alert("Error", "Terjadi kesalahan saat memilih gambar")
    }
  }

  const removeImage = () => {
    setFile(null)
    setImageRemoved(true)
  }

  if (cameraVisible) {
    return (
      <CameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onPictureTaken={(photo) => {
          setFile({
            uri: photo.uri,
            name: `photo_${Date.now()}.jpg`,
            mimeType: "image/jpeg",
            size: 0,
          })
          setImageRemoved(false)
          setCameraVisible(false)
        }}
      />
    )
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
              <Text className="mb-2 text-sm text-gray-600">Gambar Barang</Text>
              <View className="items-center mb-4">
                {file ? (
                  <View className="relative">
                    <Image
                      source={{ uri: file.uri }}
                      className="w-32 h-32 rounded-[12px] border-2 border-green-300"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      className="absolute p-1 bg-red-500 rounded-full -top-2 -right-2"
                      onPress={removeImage}
                    >
                      <X size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ) : editedItem.image_url && !imageRemoved ? (
                  <View className="relative">
                    <Image
                      source={{ uri: editedItem.image_url }}
                      className="w-32 h-32 rounded-[12px] border-2 border-green-300"
                      resizeMode="cover"
                      onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
                    />
                    <TouchableOpacity
                      className="absolute p-1 bg-red-500 rounded-full -top-2 -right-2"
                      onPress={removeImage}
                    >
                      <X size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="w-32 h-32 bg-gray-100 rounded-[12px] items-center justify-center border-2 border-dashed border-gray-300">
                    <LucideCamera size={32} color="#9CA3AF" />
                    <Text className="mt-1 text-xs text-gray-500">Tidak ada gambar</Text>
                  </View>
                )}

                <TouchableOpacity
                  className="flex-row items-center bg-blue-100 rounded-[8px] px-3 py-2 mt-3"
                  onPress={handleImagePicker}
                  disabled={saving}
                >
                  <LucideCamera size={16} color="#3B82F6" />
                  <Text className="ml-2 text-sm font-medium text-blue-600">
                    {hasImage ? "Ganti Gambar" : "Tambah Gambar"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="mb-2 text-sm text-gray-600">Nama Barang</Text>
              <TextInput
                className="border border-gray-300 rounded-[8px] p-2 mb-4"
                value={editedItem.name}
                onChangeText={(text) => setEditedItem({ ...editedItem, name: text })}
                placeholder="Masukkan nama barang"
                editable={!saving}
              />

              <Text className="mb-2 text-sm text-gray-600">Harga</Text>
              <TextInput
                className="border border-gray-300 rounded-[8px] p-2 mb-4"
                keyboardType="numeric"
                value={priceInput}
                onChangeText={(text) => {
                  // Remove non-digit characters
                  const numeric = text.replace(/\D/g, "")
                  setEditedItem({ ...editedItem, price: Number.parseInt(numeric) || 0 })
                  setPriceInput(numeric ? formatToIDR(Number(numeric)) : "")
                }}
                placeholder="0"
                editable={!saving}
              />

              <Text className="mb-2 text-sm text-gray-600">Stok</Text>
              <TextInput
                className="border border-gray-300 rounded-[8px] p-2 mb-4"
                keyboardType="numeric"
                value={editedItem.stock.toString()}
                onChangeText={(text) => setEditedItem({ ...editedItem, stock: Number.parseInt(text) || 0 })}
                placeholder="0"
                editable={!saving}
              />
            </>
          )}
          <View className="flex-row justify-end">
            <TouchableOpacity className="px-4 py-2 bg-gray-200 rounded-[8px] mr-2" onPress={onClose} disabled={saving}>
              <Text className="text-sm text-gray-800">Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-2 rounded-[8px] ${saving ? "bg-gray-300" : "bg-blue-500"}`}
              onPress={handleSave}
              disabled={saving}
            >
              <Text className={`text-sm ${saving ? "text-gray-500" : "text-white"}`}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}
