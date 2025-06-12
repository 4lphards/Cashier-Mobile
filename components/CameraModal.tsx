import React, { useRef, useState } from "react"
import { Modal, View, TouchableOpacity, Text, Image, Dimensions } from "react-native"
import { CameraView } from "expo-camera"
import { X } from "lucide-react-native"

interface CameraModalProps {
  visible: boolean
  onClose: () => void
  onPictureTaken: (photo: { uri: string }) => void
}

const windowWidth = Dimensions.get("window").width

export default function CameraModal({ visible, onClose, onPictureTaken }: CameraModalProps) {
  const cameraRef = useRef<CameraView>(null)
  const [photoUri, setPhotoUri] = useState<string | null>(null)

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync()
        if (photo) {
          setPhotoUri(photo.uri)
        }
      } catch {
        alert("Gagal mengambil gambar")
      }
    }
  }

  const handleRetake = () => {
    setPhotoUri(null)
  }

  return (
    <Modal visible={visible} transparent={false} animationType="slide">
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {photoUri ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Image source={{ uri: photoUri }} style={{ width: windowWidth, height: windowWidth, resizeMode: "contain" }} />
            <View style={{ flexDirection: "row", marginTop: 24 }}>
              <TouchableOpacity onPress={handleRetake} style={{ marginRight: 16, backgroundColor: "#fff", padding: 12, borderRadius: 8 }}>
                <Text style={{ color: "#000" }}>Ambil Ulang</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { onPictureTaken({ uri: photoUri }); setPhotoUri(null); }} style={{ backgroundColor: "#3B82F6", padding: 12, borderRadius: 8, flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: "#fff", marginLeft: 8 }}>Gunakan Foto Ini</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
            <View style={{ justifyContent: "space-between", flex: 1, padding: 24, backgroundColor: "transparent" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 48 }}>
                <TouchableOpacity style={{ padding: 12, borderRadius: 999, backgroundColor: "#0008" }} onPress={onClose}>
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 48 }}>
                <TouchableOpacity style={{ padding: 16, backgroundColor: "#fff", borderWidth: 4, borderColor: "#d1d5db", borderRadius: 999 }} onPress={takePicture}>
                  <View style={{ width: 64, height: 64, backgroundColor: "#fff", borderRadius: 999 }} />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        )}
      </View>
    </Modal>
  )
}
