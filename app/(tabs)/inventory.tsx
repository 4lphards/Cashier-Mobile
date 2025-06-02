"use client";

import { Search, Filter, ChevronDownIcon, Edit, Trash2 } from "lucide-react-native";
import { TextInput, View, TouchableOpacity, Modal, FlatList, Text } from "react-native";
import { useState } from "react";
import { Items } from "~/services/POSService";
import { formatToIDR } from "~/utils/formatting";

const dummyData: Items[] = [
  { id: 1, name: "Keripik Kentang", price: 8000, stock: 45, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 2, name: "Biskuit Cokelat", price: 12000, stock: 32, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 3, name: "Permen Karet", price: 3000, stock: 85, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 4, name: "Wafer Vanilla", price: 15000, stock: 28, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 5, name: "Kacang Atom", price: 6000, stock: 60, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 6, name: "Cokelat Batang", price: 18000, stock: 22, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 7, name: "Kerupuk Udang", price: 5000, stock: 75, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 8, name: "Cookies Oatmeal", price: 14000, stock: 18, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 9, name: "Chiki Balls", price: 4500, stock: 95, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 10, name: "Pocky Strawberry", price: 11000, stock: 40, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 11, name: "Taro Net", price: 7500, stock: 55, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
  { id: 12, name: "Oreo Original", price: 16000, stock: 25, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
];

export default function Inventory() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setFilter] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState<Items[]>(dummyData);

  const filterOptions = [
    { label: "A ~ Z", value: "asc" },
    { label: "Z ~ A", value: "desc" },
    { label: "Stok Terendah", value: "lowStock" },
    { label: "Stok Tertinggi", value: "highStock" },
    { label: "Harga Terendah", value: "lowPrice" },
    { label: "Harga Tertinggi", value: "highPrice" },
  ];

  interface FilterOption {
    label: string;
    value: string;
  }

  const handleFilterSelect = (filter: FilterOption): void => {
    setModalVisible(false);
    setFilter(filter.value);

    let sortedItems = [...dummyData];
    switch (filter.value) {
      case "asc":
        sortedItems.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "desc":
        sortedItems.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "lowStock":
        sortedItems.sort((a, b) => a.stock - b.stock);
        break;
      case "highStock":
        sortedItems.sort((a, b) => b.stock - a.stock);
        break;
      case "lowPrice":
        sortedItems.sort((a, b) => a.price - b.price);
        break;
      case "highPrice":
        sortedItems.sort((a, b) => b.price - a.price);
        break;
    }
    setFilteredItems(sortedItems);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = dummyData.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <View className="flex-row mb-4">
        <View className="relative flex-row items-center border border-gray-300 rounded-[8px] pl-2 w-5/6">
          <View className="relative flex-row items-center">
            <Search className="absolute" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 p-2"
              placeholder="Cari barang..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
            {searchQuery.length > 0 && (
            <TouchableOpacity
              className="absolute p-2 right-2"
              onPress={() => {
              setSearchQuery("");
              handleSearch("");
              }}
            >
              <Text className="text-gray-400">X</Text>
            </TouchableOpacity>
            )}
        </View>
        <TouchableOpacity
          className="flex-row items-center justify-center w-1/6 border border-gray-300 rounded-[8px] bg-white ml-2"
          onPress={() => setModalVisible(true)}
        >
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
        <View className="p-4 mb-3 bg-white border border-gray-100 rounded-[8px] shadow-sm">
          <View className="flex-row items-start mb-3">
            <View className="w-20 h-20 mr-3 bg-gray-100 border border-gray-200 rounded-[8px] justify-center items-center">
              <Text className="text-xs text-gray-400">IMG</Text>
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-lg font-semibold text-gray-800">
              {item.name}
              </Text>
            </View>
            <View className="flex-row">
              <View className="p-[2px] rounded-[8px] bg-blue-50">
                <TouchableOpacity className="p-2">
                  <Edit size={20} color="#4F8BE5" />
                </TouchableOpacity>
              </View>
              <View className="p-[2px] rounded-[8px] bg-red-50 ml-4">
                <TouchableOpacity className="p-2">
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between">
            <View>  
            <Text className="mb-1 text-xs text-gray-500">Stok</Text>
              <Text className="text-sm font-medium text-gray-800">
                {item.stock} pcs
              </Text>
            </View>
            <View>
              <Text className="mb-1 text-xs text-gray-500">Harga</Text>
              <Text className="text-sm font-medium text-gray-800">
                {formatToIDR(item.price)}
              </Text>
            </View>
            
            <TouchableOpacity className="flex-row items-center px-3 py-2 border border-gray-200 rounded-[8px] bg-gray-50">
              <Text className="mr-1 text-sm text-gray-600">Ubah Stok</Text>
              <ChevronDownIcon size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        )}
      />
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="items-end justify-start flex-1"
          onPress={() => setModalVisible(false)}
        >
          <View className="w-1/2 bg-white rounded-[8px] p-4 border border-gray-300">
            <FlatList
              data={filterOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="p-2 border-b border-gray-200"
                  onPress={() => handleFilterSelect(item)}
                >
                  <Text className="text-gray-800">{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              className="mt-4 p-2 bg-gray-200 rounded-[8px]"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-center text-gray-600">Tutup</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
