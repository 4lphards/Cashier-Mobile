import { Tabs } from "expo-router"
import { Home, Package, BarChart3, ShoppingBag, Store, Box, Settings } from "lucide-react-native"
import { View } from "react-native"

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: "#4A90E2",
      tabBarInactiveTintColor: "#7D7D7D",
      tabBarStyle: {
        backgroundColor: "#FFFFFF",
        borderTopWidth: 0,
        elevation: 8, // Increase elevation for Android shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      }}
    >
      <Tabs.Screen
      name="index"
      options={{
        title: "Beranda",
        tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        headerRight: () => (
        <View className="p-3 mr-4 rounded-full bg-blue-50">
          <Store size={24} color="#4A90E2" />
        </View>
        ),
      }}
      />
      <Tabs.Screen
      name="inventory"
      options={{
        title: "Barang",
        headerTitle: "Manajemen Barang",
        tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        headerRight: () => (
          <View className="p-3 mr-4 bg-orange-100 rounded-full">
            <Box size={24} color="#fb923c" />
          </View>
        ),
      }}
      />
      <Tabs.Screen
      name="transaction"
      options={{
        title: "Transaksi",
        tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
      }}
      />
      <Tabs.Screen
      name="reports"
      options={{
        title: "Laporan",
        tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
      }}
      />
      <Tabs.Screen
      name="settings"
      options={{
        title: "Pengaturan",
        tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
      }}
      />
    </Tabs>
  )
}
