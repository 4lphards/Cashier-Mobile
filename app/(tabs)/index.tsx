"use client";

import { ScrollView, Text, View } from "react-native";
import { TrendingUp, Receipt, Box } from "lucide-react-native";
import { formatToIDR } from "~/utils/formatting";
import { Items, Transaction } from "~/services/POSService";

export default function Dashboard() {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-lg font-bold text-gray-800">Ringkasan Terbaru</Text>
      <Text className="text-gray-800 text-md">{today}</Text>
      <View className="mt-4 bg-white">
        {/* First Row: Total Penjualan */}
        <View className="flex-row">
            <View className="flex-1 m-2 p-4 bg-white border border-gray-200 shadow-sm rounded-xl min-w-[150px] relative">
            <Text className="text-base font-medium text-gray-500">Total Penjualan</Text>
            <Text className="mt-1 text-2xl font-bold text-green-600">
              {formatToIDR(todaysTransactions.reduce((total, trx) => total + trx.total, 0))}
            </Text>
            <View className="absolute p-2 rounded-full top-2 right-4 bg-green-50">
              <TrendingUp color="#22c55e" size={20} />
            </View>
            </View>
        </View>
        {/* Second Row: Transaksi and Barang Terjual */}
        <View className="flex-row">
          {/* Transaksi */}
            <View className="flex-1 m-2 p-4 bg-white border border-gray-200 shadow-sm rounded-xl min-w-[150px] relative">
            <Text className="text-base font-medium text-gray-500">Transaksi</Text>
            <Text className="mt-1 text-2xl font-bold text-blue-600">{todaysTransactions.length}</Text>
            <View className="absolute p-2 rounded-full top-2 right-4 bg-blue-50">
              <Receipt color="#3b82f6" size={20} />
            </View>
            </View>
          {/* Barang Terjual */}
            <View className="flex-1 m-2 p-4 bg-white border border-gray-200 shadow-sm rounded-xl min-w-[150px] relative">
            <Text className="text-base font-medium text-gray-500">Terjual</Text>
            <View className="flex-row items-center">
              <Text className="mt-1 text-2xl font-bold text-orange-600">
              {todaysTransactions.reduce((total, trx) => total + trx.items.reduce((sum, item) => sum + item.quantity, 0), 0)}
              </Text>
              <Text className="mt-1 text-base font-bold text-gray-500"> barang</Text>
            </View>
            <View className="absolute p-2 rounded-full top-2 right-4 bg-orange-50">
              <Box color="#fb923c" size={20} />
            </View>
            </View>
        </View>
      </View>
      <View className="flex-1">
        <Text className="mt-6 text-lg font-bold text-gray-800">Transaksi Hari ini</Text>
        <View className="flex-1 mt-2">
            <ScrollView className="flex-1 p-1" showsVerticalScrollIndicator={false}>
            {[...todaysTransactions]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((trx) => {
              const totalItems = trx.items.reduce((sum, item) => sum + item.quantity, 0);
              // Show items until total name length exceeds 30 chars
              let charLimit = 30;
              let runningLength = 0;
              let showItems: typeof trx.items = [];
              let hasMore = false;
              for (let i = 0; i < trx.items.length; i++) {
                const item = trx.items[i];
                // +2 for ", " or ","
                const nextLength = runningLength + item.name.length + (showItems.length > 0 ? 2 : 0);
                if (nextLength > charLimit) {
                hasMore = true;
                break;
                }
                showItems.push(item);
                runningLength = nextLength;
              }
              if (showItems.length < trx.items.length) hasMore = true;
              return (
                <View
                key={trx.id}
                className="flex-row items-center justify-between p-3 mb-2 bg-white border border-gray-100 rounded-xl"
                >
                  <View>
                    <Text className="font-medium text-gray-800">{`Transaksi #${trx.id}`}</Text>
                    <Text className="text-xs text-gray-500">
                    {new Date(trx.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })} • {totalItems} item
                    </Text>
                    <View className="flex-row flex-wrap mt-1">
                    {showItems.map((item, i) => (
                      <Text key={i} className="mr-2 text-xs text-gray-600">
                      - {item.name} ({item.quantity})
                      {i < showItems.length - 1 || hasMore ? ',' : ''}
                      </Text>
                    ))}
                    {hasMore && (
                      <Text className="text-xs text-gray-600">...</Text>
                    )}
                    </View>
                  </View>
                  <Text className="font-bold text-green-600">{formatToIDR(trx.total)}</Text>
                </View>
              );
              })}
            </ScrollView>
        </View>
      </View>
    </View>
  );
}

const mockItems: Items[] = [
  {
    id: 1,
    name: "Kopi Hitam",
    price: 12000,
    stock: 100,
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2024-06-01T08:00:00Z",
  },
  {
    id: 2,
    name: "Kopi Susu",
    price: 15000,
    stock: 100,
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2024-06-01T08:00:00Z",
  },
  {
    id: 3,
    name: "Kopi Tubruk",
    price: 11000,
    stock: 100,
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2024-06-01T08:00:00Z",
  },
  {
    id: 4,
    name: "Kopi Latte",
    price: 12000,
    stock: 100,
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2024-06-01T08:00:00Z",
  },
  {
    id: 5,
    name: "Roti Tawar",
    price: 5000,
    stock: 100,
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2024-06-01T08:00:00Z",
  },
  {
    id: 6,
    name: "Roti Coklat",
    price: 7500,
    stock: 100,
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2024-06-01T08:00:00Z",
  },
  {
    id: 7,
    name: "Teh Manis",
    price: 5000,
    stock: 100,
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2024-06-01T08:00:00Z",
  },
  {
    id: 8,
    name: "Teh Tawar",
    price: 4000,
    stock: 100,
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2024-06-01T08:00:00Z",
  },
  {
    id: 9,
    name: "Teh Hijau",
    price: 6000,
    stock: 100,
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2024-06-01T08:00:00Z",
  },
  {
    id: 10,
    name: "Keripik",
    price: 4000,
    stock: 100,
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2024-06-01T08:00:00Z",
  },
  {
    id: 11,
    name: "Kacang",
    price: 5000,
    stock: 100,
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2024-06-01T08:00:00Z",
  },
  {
    id: 12,
    name: "Biskuit",
    price: 6000,
    stock: 100,
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2024-06-01T08:00:00Z",
  },
  {
    id: 13,
    name: "Permen",
    price: 2000,
    stock: 100,
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2024-06-01T08:00:00Z",
  },
];

const todaysTransactions: Transaction[] = [
  {
    id: 1,
    total: 63000,
    payment: 65000,
    change: 2000,
    timestamp: "2024-06-01T10:30:00Z",
    items: [
      {
        id: 1,
        items: mockItems[0],
        name: "Kopi Hitam",
        price: 24000,
        quantity: 2,
      },
      {
        id: 2,
        items: mockItems[1],
        name: "Kopi Susu",
        price: 15000,
        quantity: 1,
      },
      {
        id: 3,
        items: mockItems[2],
        name: "Kopi Tubruk",
        price: 11000,
        quantity: 1,
      },
      {
        id: 4,
        items: mockItems[3],
        name: "Kopi Latte",
        price: 12000,
        quantity: 1,
      },
    ],
  },
  {
    id: 5,
    total: 63000,
    payment: 65000,
    change: 2000,
    timestamp: "2024-06-01T10:30:00Z",
    items: [
      {
        id: 1,
        items: mockItems[0],
        name: "Kopi Hitam",
        price: 24000,
        quantity: 2,
      },
      {
        id: 2,
        items: mockItems[1],
        name: "Kopi Susu",
        price: 15000,
        quantity: 1,
      },
      {
        id: 3,
        items: mockItems[2],
        name: "Kopi Tubruk",
        price: 11000,
        quantity: 1,
      },
      {
        id: 4,
        items: mockItems[3],
        name: "Kopi Latte",
        price: 12000,
        quantity: 1,
      },
    ],
  },
  {
    id: 2,
    total: 30000,
    payment: 30000,
    change: 0,
    timestamp: "2024-06-01T09:45:00Z",
    items: [
      {
        id: 5,
        items: mockItems[4],
        name: "Roti Tawar",
        price: 15000,
        quantity: 3,
      },
      {
        id: 6,
        items: mockItems[5],
        name: "Roti Coklat",
        price: 15000,
        quantity: 2,
      },
    ],
  },
  {
    id: 3,
    total: 25000,
    payment: 30000,
    change: 5000,
    timestamp: "2024-06-01T09:15:00Z",
    items: [
      {
        id: 7,
        items: mockItems[6],
        name: "Teh Manis",
        price: 5000,
        quantity: 1,
      },
      {
        id: 8,
        items: mockItems[7],
        name: "Teh Tawar",
        price: 8000,
        quantity: 2,
      },
      {
        id: 9,
        items: mockItems[8],
        name: "Teh Hijau",
        price: 12000,
        quantity: 2,
      },
    ],
  },
  {
    id: 4,
    total: 32000,
    payment: 35000,
    change: 3000,
    timestamp: "2024-06-01T08:50:00Z",
    items: [
      {
        id: 10,
        items: mockItems[9],
        name: "Keripik",
        price: 8000,
        quantity: 2,
      },
      {
        id: 11,
        items: mockItems[10],
        name: "Kacang",
        price: 10000,
        quantity: 2,
      },
      {
        id: 12,
        items: mockItems[11],
        name: "Biskuit",
        price: 6000,
        quantity: 1,
      },
      {
        id: 13,
        items: mockItems[12],
        name: "Permen",
        price: 6000,
        quantity: 3,
      },
    ],
  },
];
