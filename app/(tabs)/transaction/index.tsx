"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, RefreshControl } from "react-native"
import { Search, ShoppingCart, ChevronRight, X, Plus, Minus } from "lucide-react-native"
import { PosService, type Items } from "~/services/POSService"
import { formatToIDR } from "~/utils/formatting"
import { useToast } from "~/contexts/toastContext"
import CartPage from "./cart-page"

interface CartItem {
  item: Items
  quantity: number
}

export default function Transaction() {
  const { showToast } = useToast()
  const [items, setItems] = useState<Items[]>([])
  const [filteredItems, setFilteredItems] = useState<Items[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showCartPage, setShowCartPage] = useState(false)

  // Calculate totals
  const subtotal = cart.reduce((sum, cartItem) => sum + cartItem.item.price * cartItem.quantity, 0)
  const totalItems = cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0)

  const fetchItems = async () => {
    try {
      const data = await PosService.getItems()
      // Only show items with stock > 0
      const availableItems = data.filter((item) => item.stock > 0)
      setItems(availableItems)
      setFilteredItems(availableItems)
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
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchItems()
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length === 0) {
      setFilteredItems(items)
    } else {
      const filtered = items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
      setFilteredItems(filtered)
    }
  }

  const getItemQuantityInCart = (itemId: number): number => {
    const cartItem = cart.find((item) => item.item.id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  const addToCart = (item: Items) => {
    const existingCartItem = cart.find((cartItem) => cartItem.item.id === item.id)

    if (existingCartItem) {
      if (existingCartItem.quantity >= item.stock) {
        showToast(`Stok ${item.name} tidak mencukupi`, "warning")
        return
      }
      setCart(
        cart.map((cartItem) =>
          cartItem.item.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        ),
      )
    } else {
      setCart([...cart, { item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId: number) => {
    const existingCartItem = cart.find((cartItem) => cartItem.item.id === itemId)

    if (existingCartItem) {
      if (existingCartItem.quantity === 1) {
        // Remove item completely if quantity is 1
        setCart(cart.filter((cartItem) => cartItem.item.id !== itemId))
      } else {
        // Decrease quantity
        setCart(
          cart.map((cartItem) =>
            cartItem.item.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem,
          ),
        )
      }
    }
  }

  const updateCartItemQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((cartItem) => cartItem.item.id !== itemId))
      return
    }

    const item = items.find((i) => i.id === itemId)
    if (item && newQuantity > item.stock) {
      showToast(`Stok ${item.name} tidak mencukupi`, "warning")
      return
    }

    setCart(cart.map((cartItem) => (cartItem.item.id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem)))
  }

  const removeCartItem = (itemId: number) => {
    setCart(cart.filter((cartItem) => cartItem.item.id !== itemId))
  }

  const goToCartPage = () => {
    setShowCartPage(true)
  }

  const goToItemsPage = () => {
    setShowCartPage(false)
  }

  const handleTransactionComplete = async () => {
    setCart([])
    await fetchItems() // Refresh items to update stock
    goToItemsPage()
  }

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 p-4 bg-white">
        <Text className="text-gray-600">Memuat data...</Text>
      </View>
    )
  }

  if (showCartPage) {
    return (
      <CartPage
        cart={cart}
        updateCartItemQuantity={updateCartItemQuantity}
        removeFromCart={removeCartItem}
        goBack={goToItemsPage}
        onTransactionComplete={handleTransactionComplete}
      />
    )
  }

  return (
    <View className="flex-1 bg-white">
      <View className="p-4">
        {/* Search Bar */}
        <View className="relative flex-row items-center mb-4 border border-gray-300 rounded-[8px] pl-4">
          <Search className="absolute left-3" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 p-3"
            placeholder="Cari barang..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              className="absolute p-2 right-2"
              onPress={() => {
                setSearchQuery("")
                handleSearch("")
              }}
            >
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Items Grid */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingBottom: 100 }} // Extra padding for cart preview
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="items-center justify-center flex-1 p-8">
              <Text className="text-center text-gray-500">
                {searchQuery ? "Tidak ada barang yang sesuai" : "Tidak ada barang tersedia"}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const quantityInCart = getItemQuantityInCart(item.id)

            return (
              <View className="w-[48%] p-3 mb-3 bg-white border border-gray-200 rounded-[8px] shadow-sm">
                <View className="items-center mb-2">
                  <View className="w-20 h-20 mb-2 bg-gray-100 border border-gray-200 rounded-[8px] justify-center items-center">
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        className="w-full h-full rounded-[8px]"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-xs text-gray-400">IMG</Text>
                    )}
                  </View>
                  <Text className="text-sm font-medium text-center text-gray-800" numberOfLines={2}>
                    {item.name}
                  </Text>
                </View>

                <View className="items-center mb-2">
                  <Text className="mb-1 text-sm font-bold text-green-600">{formatToIDR(item.price)}</Text>
                  <Text className="text-xs text-gray-500">Stok: {item.stock}</Text>
                </View>

                {/* Quantity Controls */}
                {quantityInCart > 0 ? (
                  <View className="flex-row items-center justify-center border border-gray-300 rounded-[8px]">
                    <TouchableOpacity className="items-center flex-1 p-2" onPress={() => removeFromCart(item.id)}>
                      <Minus size={16} color="#EF4444" />
                    </TouchableOpacity>
                    <View className="px-3 py-2 bg-gray-50">
                      <Text className="font-medium text-center">{quantityInCart}</Text>
                    </View>
                    <TouchableOpacity className="items-center flex-1 p-2" onPress={() => addToCart(item)}>
                      <Plus size={16} color="#22C55E" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="flex-row items-center justify-center p-2 bg-blue-500 rounded-[8px]"
                    onPress={() => addToCart(item)}
                  >
                    <Plus size={16} color="#FFFFFF" />
                    <Text className="ml-1 font-medium text-white">Tambah</Text>
                  </TouchableOpacity>
                )}
              </View>
            )
          }}
        />
      </View>

      {/* Cart Preview */}
      {cart.length > 0 && (
        <TouchableOpacity
          className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between p-4 bg-blue-500"
          onPress={goToCartPage}
        >
          <View className="flex-row items-center">
            <ShoppingCart size={24} color="#FFFFFF" />
            <View className="ml-3">
              <Text className="font-medium text-white">{totalItems} Barang</Text>
              <Text className="text-lg font-bold text-white">{formatToIDR(subtotal)}</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Text className="mr-2 font-medium text-white">Lihat Keranjang</Text>
            <ChevronRight size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  )
}
