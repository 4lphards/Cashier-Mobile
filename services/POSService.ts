import { supabase } from "~/utils/supabase"

export interface Items {
  id: number
  name: string
  price: number
  stock: number
  barcode?: string
  createdAt: string
  updatedAt: string
}

export interface TransactionItem {
  id: number
  items: Items
  name: string
  price: number
  quantity: number
}

export interface Transaction {
  id: number
  total: number
  payment: number
  change: number
  timestamp: string
  items: TransactionItem[]
}

class PosServiceClass {
  async getDashboardData(): Promise<{
    totalTransactions: number
    totalItemsSold: number
    totalRevenue: number
  }> {
    const [transactionsResponse] = await Promise.all([
      supabase.from('transactions').select('id, total'),
      supabase.from('items').select('id, stock, price')
    ]);

    const totalTransactions = transactionsResponse.data?.length || 0;
    const totalItemsSold = transactionsResponse.data?.reduce((sum: number, transaction: any) => sum + transaction.items.length, 0) || 0;
    const totalRevenue = transactionsResponse.data?.reduce((sum: number, transaction: any) => sum + transaction.total, 0) || 0;

    return {
      totalTransactions,
      totalItemsSold,
      totalRevenue,
    };
  }

  async getItems(): Promise<Items[]> {
    const response = await supabase.from('items')
      .select('id, name, price, stock, category (id, name), barcode, createdAt, updatedAt')

    return (response.data ?? []).map((item: any) => ({
      ...item,
      category: Array.isArray(item.category) ? item.category[0] : item.category
    }));
  }
}

export const PosService = new PosServiceClass();