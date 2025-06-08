"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Image } from "react-native"
import { ChevronLeft, Plus, Minus, Trash2, CreditCard, X, ShoppingCart, QrCode, Banknote } from "lucide-react-native"
import { PosService, type Items } from "~/services/POSService"
import { formatToIDR } from "~/utils/formatting"
import { useToast } from "~/contexts/toastContext"
import { useRefresh } from "~/contexts/refreshContext"
import ReceiptShareView from "~/components/ReceiptShareView"

interface CartItem {
  item: Items
  quantity: number
}

interface CartPageProps {
  cart: CartItem[]
  updateCartItemQuantity: (itemId: number, quantity: number) => void
  removeFromCart: (itemId: number) => void
  goBack: () => void
  onTransactionComplete: () => Promise<void>
}

type PaymentMethod = "CASH" | "QRIS"

export default function CartPage({
  cart,
  updateCartItemQuantity,
  removeFromCart,
  goBack,
  onTransactionComplete,
}: CartPageProps) {
  const { showToast } = useToast()
  const { triggerRefresh } = useRefresh()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [, setCustomerNote] = useState("")
  const [, setCustomerName] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH")
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<any>(null)

  // Calculate totals
  const subtotal = cart.reduce((sum, cartItem) => sum + cartItem.item.price * cartItem.quantity, 0)
  const total = subtotal // You can add tax calculation here if needed
  const totalItems = cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0)

  const handlePayment = () => {
    if (cart.length === 0) {
      showToast("Keranjang masih kosong", "warning")
      return
    }
    setShowPaymentModal(true)
    setPaymentAmount(total.toString())
  }

  const processTransaction = async () => {
    const payment = Number.parseFloat(paymentAmount)

    // For QRIS, payment amount should match total exactly
    if (paymentMethod === "QRIS") {
      if (payment !== total) {
        setPaymentAmount(total.toString())
      }
    } else if (isNaN(payment) || payment < total) {
      showToast("Jumlah pembayaran tidak valid", "error")
      return
    }

    setIsProcessing(true)

    try {
      const change = paymentMethod === "QRIS" ? 0 : payment - total
      const transactionData = {
        total,
        payment,
        change,
        payment_method: paymentMethod,
        items: cart.map((cartItem) => ({
          item_id: cartItem.item.id,
          quantity: cartItem.quantity,
          price_at_time: cartItem.item.price,
        })),
      }

      const result = await PosService.createTransaction(transactionData)

      if (result) {
        showToast("Transaksi berhasil!", "success")
        setShowPaymentModal(false)
        setPaymentAmount("")
        setCustomerName("")
        setCustomerNote("")
        triggerRefresh() // Notify other pages to refresh
        setLastTransaction({
          ...transactionData,
          id: result.id,
          date: new Date().toLocaleString("id-ID"),
          items: cart.map((cartItem) => ({
            name: cartItem.item.name,
            quantity: cartItem.quantity,
            price: cartItem.item.price,
            subtotal: cartItem.item.price * cartItem.quantity,
          })),
        })
        setShowReceipt(true)
        // Remove Alert.alert, show receipt instead
      } else {
        showToast("Gagal memproses transaksi", "error")
      }
    } catch (error) {
      console.error("Error processing transaction:", error)
      showToast("Terjadi kesalahan saat memproses transaksi", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  const renderQuickAmountButtons = () => {
    if (paymentMethod === "QRIS") return null

    const quickAmounts = [
      Math.ceil(total / 1000) * 1000, // Round up to nearest thousand
      Math.ceil(total / 5000) * 5000, // Round up to nearest 5k
      Math.ceil(total / 10000) * 10000, // Round up to nearest 10k
      Math.ceil(total / 50000) * 50000, // Round up to nearest 50k
    ].filter((amount, index, arr) => arr.indexOf(amount) === index && amount > total) // Remove duplicates and amounts <= total

    return quickAmounts.slice(0, 4).map((amount) => (
      <TouchableOpacity
        key={amount}
        className="px-4 py-2 mr-2 bg-blue-100 rounded-[8px]"
        onPress={() => setPaymentAmount(amount.toString())}
      >
        <Text className="font-medium text-blue-600">{formatToIDR(amount)}</Text>
      </TouchableOpacity>
    ))
  }

  const clearCart = () => {
    Alert.alert("Kosongkan Keranjang", "Apakah Anda yakin ingin mengosongkan keranjang?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Ya",
        style: "destructive",
        onPress: () => {
          cart.forEach((cartItem) => removeFromCart(cartItem.item.id))
          showToast("Keranjang dikosongkan", "info")
        },
      },
    ])
  }

  if (showReceipt && lastTransaction) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ReceiptShareView
          items={lastTransaction.items}
          total={lastTransaction.total}
          payment={lastTransaction.payment}
          change={lastTransaction.change}
          paymentMethod={lastTransaction.payment_method === "CASH" ? "Tunai" : "QRIS"}
          transactionId={lastTransaction.id}
          date={lastTransaction.date}
          onShare={() => {
            setShowReceipt(false)
            onTransactionComplete()
          }}
        />
        <TouchableOpacity
          className="mt-4 px-6 py-3 bg-gray-200 rounded-[8px]"
          onPress={() => {
            setShowReceipt(false)
            onTransactionComplete()
          }}
        >
          <Text className="font-medium text-gray-700">Kembali ke Transaksi</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
        <TouchableOpacity className="flex-row items-center" onPress={goBack}>
          <ChevronLeft size={24} color="#4F8BE5" />
          <Text className="ml-2 text-lg font-bold text-gray-800">Keranjang</Text>
        </TouchableOpacity>
        <View className="flex-row items-center">
          <View className="px-3 py-1 mr-2 bg-blue-100 rounded-full">
            <Text className="text-sm font-medium text-blue-600">{totalItems} Barang</Text>
          </View>
          {cart.length > 0 && (
            <TouchableOpacity onPress={clearCart}>
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Cart Items */}
      <ScrollView className="flex-1 p-4">
        {cart.length === 0 ? (
          <View className="items-center justify-center p-8">
            <ShoppingCart size={48} color="#D1D5DB" />
            <Text className="mt-4 text-center text-gray-500">Keranjang kosong</Text>
            <TouchableOpacity className="p-3 mt-4 bg-blue-100 rounded-[8px]" onPress={goBack}>
              <Text className="font-medium text-blue-600">Tambah Barang</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Cart Items */}
            {cart.map((cartItem) => (
              <View key={cartItem.item.id} className="p-4 mb-3 bg-white border border-gray-200 rounded-[8px] shadow-sm">
                <View className="flex-row items-start">
                  <View className="items-center justify-center w-16 h-16 mr-3 bg-gray-100 border border-gray-200 rounded-[8px]">
                    {cartItem.item.image_url ? (
                      <Image
                        source={{ uri: cartItem.item.image_url }}
                        className="w-full h-full rounded-[8px]"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-xs text-gray-400">IMG</Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between">
                      <Text className="font-medium text-gray-800" numberOfLines={2}>
                        {cartItem.item.name}
                      </Text>
                      <TouchableOpacity onPress={() => removeFromCart(cartItem.item.id)}>
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    <Text className="text-sm text-gray-600">{formatToIDR(cartItem.item.price)}</Text>
                    <Text className="text-xs text-gray-500">Stok tersedia: {cartItem.item.stock}</Text>

                    <View className="flex-row items-center justify-between mt-2">
                      <View className="flex-row items-center border border-gray-300 rounded-[8px]">
                        <TouchableOpacity
                          className="p-2"
                          onPress={() => updateCartItemQuantity(cartItem.item.id, cartItem.quantity - 1)}
                        >
                          <Minus size={16} color="#6B7280" />
                        </TouchableOpacity>
                        <Text className="px-3 font-medium">{cartItem.quantity}</Text>
                        <TouchableOpacity
                          className="p-2"
                          onPress={() => updateCartItemQuantity(cartItem.item.id, cartItem.quantity + 1)}
                        >
                          <Plus size={16} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                      <Text className="font-bold text-green-600">
                        {formatToIDR(cartItem.item.price * cartItem.quantity)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <View className="p-4 bg-white border-t border-gray-200">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Subtotal ({totalItems} barang):</Text>
            <Text className="font-medium">{formatToIDR(subtotal)}</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-lg font-bold">Total:</Text>
            <Text className="text-lg font-bold text-green-600">{formatToIDR(total)}</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center justify-center p-4 bg-blue-500 rounded-[8px]"
            onPress={handlePayment}
          >
            <CreditCard size={20} color="#FFFFFF" />
            <Text className="ml-2 font-bold text-white">Proses Pembayaran</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <View className="w-80 max-h-[80%] p-6 bg-white rounded-[8px]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold">Pembayaran</Text>
                <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Transaction Summary */}
              <View className="p-3 mb-4 rounded-[8px] bg-gray-50">
                <Text className="mb-2 text-sm font-medium text-gray-700">Ringkasan Transaksi</Text>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-600">{totalItems} barang</Text>
                  <Text className="text-sm font-medium">{formatToIDR(subtotal)}</Text>
                </View>
              </View>

              <View className="mb-4">
                <Text className="mb-2 text-gray-600">Total Belanja:</Text>
                <Text className="text-2xl font-bold text-green-600">{formatToIDR(total)}</Text>
              </View>

              {/* Payment Method Selection */}
              <View className="mb-4">
                <Text className="mb-2 text-gray-600">Metode Pembayaran:</Text>
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    className={`flex-1 flex-row items-center justify-center p-3 rounded-[8px] border ${
                      paymentMethod === "CASH" ? "bg-blue-50 border-blue-300" : "bg-white border-gray-300"
                    }`}
                    onPress={() => {
                      setPaymentMethod("CASH")
                      // Reset payment amount when switching to cash
                      if (paymentAmount === total.toString()) {
                        setPaymentAmount("")
                      }
                    }}
                  >
                    <Banknote size={20} color={paymentMethod === "CASH" ? "#3B82F6" : "#6B7280"} className="mr-2" />
                    <Text className={`font-medium ${paymentMethod === "CASH" ? "text-blue-600" : "text-gray-600"}`}>
                      Tunai
                    </Text>
                  </TouchableOpacity>
                  <View className="w-2" />
                  <TouchableOpacity
                    className={`flex-1 flex-row items-center justify-center p-3 rounded-[8px] border ${
                      paymentMethod === "QRIS" ? "bg-blue-50 border-blue-300" : "bg-white border-gray-300"
                    }`}
                    onPress={() => {
                      setPaymentMethod("QRIS")
                      // For QRIS, payment amount is always equal to total
                      setPaymentAmount(total.toString())
                    }}
                  >
                    <QrCode size={20} color={paymentMethod === "QRIS" ? "#3B82F6" : "#6B7280"} className="mr-2" />
                    <Text className={`font-medium ${paymentMethod === "QRIS" ? "text-blue-600" : "text-gray-600"}`}>
                      QRIS
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Payment Amount Input - Only show for CASH */}
              {paymentMethod === "CASH" && (
                <>
                  <View className="mb-4">
                    <Text className="mb-2 text-gray-600">Jumlah Bayar:</Text>
                    <TextInput
                      className="p-3 border border-gray-300 rounded-[8px]"
                      placeholder="Masukkan jumlah bayar"
                      value={paymentAmount}
                      onChangeText={setPaymentAmount}
                      keyboardType="numeric"
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="mb-2 text-gray-600">Pembayaran Cepat:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {renderQuickAmountButtons()}
                    </ScrollView>
                  </View>

                  {paymentAmount &&
                    !isNaN(Number.parseFloat(paymentAmount)) &&
                    Number.parseFloat(paymentAmount) >= total && (
                      <View className="p-3 mb-4 border border-green-200 rounded-[8px] bg-green-50">
                        <Text className="font-medium text-green-800">
                          Kembalian: {formatToIDR(Number.parseFloat(paymentAmount) - total)}
                        </Text>
                      </View>
                    )}
                </>
              )}

              {/* QRIS Payment Instructions */}
              {paymentMethod === "QRIS" && (
                <View className="p-3 mb-4 border border-blue-200 rounded-[8px] bg-blue-50">
                  <Text className="mb-2 font-medium text-blue-800">Instruksi Pembayaran QRIS:</Text>
                  <Text className="mb-1 text-sm text-blue-700">1. Scan kode QR dengan aplikasi e-wallet</Text>
                  <Text className="mb-1 text-sm text-blue-700">2. Pastikan jumlah pembayaran sesuai</Text>
                  <Text className="text-sm text-blue-700">3. Konfirmasi pembayaran setelah berhasil</Text>
                </View>
              )}

              <View className="flex-row">
                <TouchableOpacity
                  className="flex-1 p-3 mr-2 border border-gray-300 rounded-[8px]"
                  onPress={() => setShowPaymentModal(false)}
                >
                  <Text className="font-medium text-center text-gray-600">Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 p-3 ml-2 rounded-[8px] ${
                    isProcessing ||
                    (paymentMethod === "CASH" && (!paymentAmount || Number.parseFloat(paymentAmount) < total))
                      ? "bg-gray-300"
                      : "bg-green-500"
                  }`}
                  onPress={processTransaction}
                  disabled={
                    isProcessing ||
                    (paymentMethod === "CASH" && (!paymentAmount || Number.parseFloat(paymentAmount) < total))
                  }
                >
                  <Text className="font-bold text-center text-white">{isProcessing ? "Memproses..." : "Proses"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  )
}
