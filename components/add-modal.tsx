"use client"

import { Modal, View, Text, TouchableOpacity, TextInput, Alert, Image } from "react-native"
import { useState, useEffect, useRef } from "react"
import { Camera as LucideCamera, X, RotateCcw } from "lucide-react-native"
import type { Items } from "~/services/POSService"
import * as DocumentPicker from "expo-document-picker"
import { CameraView, type CameraType, useCameraPermissions } from "expo-camera"

interface AddModalProps {
  visible: boolean
  onClose: () => void
  onSave: (item: Omit<Items, "id" | "created_at" | "updated_at">, imageFile?: { uri: string; name: string }) => void
}

export default function AddModal({ visible, onClose, onSave }: AddModalProps) {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null)
  const [newItem, setNewItem] = useState({
    name: "",
    price: 0,
    stock: 0,
  })
  const [hasImage, setHasImage] = useState(false)
  const [cameraVisible, setCameraVisible] = useState(false)
  const [facing, setFacing] = useState<CameraType>("back")
  const [permission, requestPermission] = useCameraPermissions()
  const [saving, setSaving] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      setNewItem({
        name: "",
        price: 0,
        stock: 0,
      })
      setHasImage(false)
      setFile(null)
      setSaving(false)
    }
  }, [visible])

  useEffect(() => {
    // Set hasImage based on file state
    setHasImage(!!file)
  }, [file])

  const handleSave = async () => {
    // Validation
    if (!newItem.name.trim()) {
      Alert.alert("Error", "Nama barang tidak boleh kosong")
      return
    }

    if (newItem.price <= 0) {
      Alert.alert("Error", "Harga harus lebih dari 0")
      return
    }

    if (newItem.stock < 0) {
      Alert.alert("Error", "Stok tidak boleh negatif")
      return
    }

    setSaving(true)

    try {
      // Prepare image file if exists
      const imageFile = file ? { uri: file.uri, name: file.name } : undefined

      // Call onSave with item data and image file
      await onSave(newItem, imageFile)
      onClose()
    } catch (error) {
      console.error("Error saving item:", error)
      Alert.alert("Error", "Gagal menyimpan item")
    } finally {
      setSaving(false)
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
    if (!permission) {
      return
    }

    if (!permission.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        Alert.alert("Error", "Izin kamera ditolak")
        return
      }
    }

    setCameraVisible(true)
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync()
        if (photo) {
          setFile({
            uri: photo.uri,
            name: `photo_${Date.now()}.jpg`,
            mimeType: "image/jpeg",
            size: 0,
          })
          setCameraVisible(false)
        }
      } catch (error) {
        console.error("Error taking picture:", error)
        Alert.alert("Error", "Gagal mengambil gambar")
      }
    }
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"))
  }

  const openGallery = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0])
      }
    } catch (error) {
      console.error("Error picking document:", error)
      Alert.alert("Error", "Terjadi kesalahan saat memilih gambar")
    }
  }

  const removeImage = () => {
    setFile(null)
    setHasImage(false)
  }

  const isFormValid = newItem.name.trim() && newItem.price > 0 && newItem.stock >= 0

  if (cameraVisible) {
    return (
      <Modal visible={true} transparent={false} animationType="slide">
        <View className="flex-1">
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
            <View className="justify-between flex-1 p-6 bg-transparent">
              <View className="flex-row items-center justify-between mt-12">
                <TouchableOpacity className="p-3 rounded-full bg-black/50" onPress={() => setCameraVisible(false)}>
                  <X size={24} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity className="p-3 rounded-full bg-black/50" onPress={toggleCameraFacing}>
                  <RotateCcw size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center justify-center mb-12">
                <TouchableOpacity className="p-4 bg-white border-4 border-gray-300 rounded-full" onPress={takePicture}>
                  <View className="w-16 h-16 bg-white rounded-full" />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>
    )
  }

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity className="justify-end flex-1 bg-black/50" activeOpacity={1} onPress={onClose}>
        <TouchableOpacity
          className="bg-white rounded-t-[16px] p-6 border border-gray-300 max-h-[90%]"
          activeOpacity={1}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">Tambah Item Baru</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

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

          <Text className="mb-2 text-sm text-gray-600">Nama Barang *</Text>
          <TextInput
            className="border border-gray-300 rounded-[8px] p-2 mb-4"
            value={newItem.name}
            onChangeText={(text) => setNewItem({ ...newItem, name: text })}
            placeholder="Masukkan nama barang"
            editable={!saving}
          />

          <Text className="mb-2 text-sm text-gray-600">Harga *</Text>
          <TextInput
            className="border border-gray-300 rounded-[8px] p-2 mb-4"
            keyboardType="numeric"
            value={newItem.price > 0 ? newItem.price.toString() : ""}
            onChangeText={(text) => setNewItem({ ...newItem, price: Number.parseInt(text) || 0 })}
            placeholder="0"
            editable={!saving}
          />

          <Text className="mb-2 text-sm text-gray-600">Stok Awal *</Text>
          <TextInput
            className="border border-gray-300 rounded-[8px] p-2 mb-6"
            keyboardType="numeric"
            value={newItem.stock > 0 ? newItem.stock.toString() : ""}
            onChangeText={(text) => setNewItem({ ...newItem, stock: Number.parseInt(text) || 0 })}
            placeholder="0"
            editable={!saving}
          />

          <View className="flex-row justify-end space-x-3">
            <TouchableOpacity className="px-4 py-2 bg-gray-200 rounded-[8px]" onPress={onClose} disabled={saving}>
              <Text className="text-sm text-gray-800">Batal</Text>
            </TouchableOpacity>
            <View className="w-4" />
            <TouchableOpacity
              className={`px-4 py-2 rounded-[8px] ${isFormValid && !saving ? "bg-blue-500" : "bg-gray-300"}`}
              onPress={handleSave}
              disabled={!isFormValid || saving}
            >
              <Text className={`text-sm ${isFormValid && !saving ? "text-white" : "text-gray-500"}`}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}
