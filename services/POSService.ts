import { supabase } from "../utils/supabase"

export interface Items {
  id: number
  name: string
  price: number
  stock: number
  barcode?: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface TransactionItem {
  id: number
  item_id: number
  quantity: number
  price_at_time: number
  item?: Items
}

export interface Transaction {
  id: number
  total: number
  payment: number
  change: number
  created_at: string
  transaction_items?: TransactionItem[]
}

class PosServiceClass {
  // Simplified image upload method for React Native without authentication
  async uploadImage(uri: string, fileName: string): Promise<string | null> {
    try {
      // Convert URI to ArrayBuffer for React Native compatibility
      const response = await fetch(uri)
      const arrayBuffer = await response.arrayBuffer()

      // Create a unique filename
      const fileExt = fileName.split(".").pop()?.toLowerCase() ?? "jpeg"
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // Upload to Supabase Storage using ArrayBuffer
      const { data, error } = await supabase.storage.from("item-images").upload(uniqueFileName, arrayBuffer, {
        contentType: `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
        upsert: false,
      })

      if (error) {
        console.error("Error uploading image:", error)
        return null
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("item-images").getPublicUrl(data.path)

      return publicUrl
    } catch (error) {
      console.error("Error in uploadImage:", error)
      return null
    }
  }

  // Delete image from storage
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split("/")
      const fileName = urlParts[urlParts.length - 1]

      const { error } = await supabase.storage.from("item-images").remove([fileName])

      if (error) {
        console.error("Error deleting image:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in deleteImage:", error)
      return false
    }
  }

  // Dashboard methods
  async getDashboardData(): Promise<{
    totalTransactions: number
    totalItemsSold: number
    totalRevenue: number
    todaysTransactions: Transaction[]
  }> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's transactions with items
    const { data: transactions, error: transError } = await supabase
      .from("transactions")
      .select(`
        *,
        transaction_items (
          *,
          items (*)
        )
      `)
      .gte("created_at", today.toISOString())
      .lt("created_at", tomorrow.toISOString())
      .order("created_at", { ascending: false })

    if (transError) {
      console.error("Error fetching transactions:", transError)
      return {
        totalTransactions: 0,
        totalItemsSold: 0,
        totalRevenue: 0,
        todaysTransactions: [],
      }
    }

    const totalTransactions = transactions?.length || 0
    const totalRevenue = transactions?.reduce((sum, t) => sum + t.total, 0) || 0
    const totalItemsSold =
      transactions?.reduce(
        (sum, t) =>
          sum + (t.transaction_items?.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0) || 0),
        0,
      ) || 0

    return {
      totalTransactions,
      totalItemsSold,
      totalRevenue,
      todaysTransactions: transactions || [],
    }
  }

  // Items methods
  async getItems(): Promise<Items[]> {
    const { data, error } = await supabase.from("items").select("*").order("name")

    if (error) {
      console.error("Error fetching items:", error)
      return []
    }

    return data || []
  }

  async createItem(
    item: Omit<Items, "id" | "created_at" | "updated_at">,
    imageFile?: { uri: string; name: string },
  ): Promise<Items | null> {
    try {
      let imageUrl = null

      // Upload image if provided
      if (imageFile) {
        imageUrl = await this.uploadImage(imageFile.uri, imageFile.name)
        if (!imageUrl) {
          console.error("Failed to upload image")
          // Continue without image rather than failing completely
        }
      }

      // Create item with image URL
      const itemData = {
        ...item,
        image_url: imageUrl,
      }

      const { data, error } = await supabase.from("items").insert([itemData]).select().single()

      if (error) {
        console.error("Error creating item:", error)
        // If item creation fails but image was uploaded, clean up the image
        if (imageUrl) {
          await this.deleteImage(imageUrl)
        }
        return null
      }

      return data
    } catch (error) {
      console.error("Error in createItem:", error)
      return null
    }
  }

  async updateItem(
    id: number,
    updates: Partial<Omit<Items, "id" | "created_at" | "updated_at">>,
    imageFile?: { uri: string; name: string },
    removeImage?: boolean,
  ): Promise<Items | null> {
    try {
      let imageUrl = updates.image_url

      // Handle image removal
      if (removeImage && imageUrl) {
        await this.deleteImage(imageUrl)
        imageUrl = undefined
      }

      // Handle new image upload
      if (imageFile) {
        // Delete old image if exists
        if (imageUrl) {
          await this.deleteImage(imageUrl)
        }

        // Upload new image
        const uploadedImageUrl = await this.uploadImage(imageFile.uri, imageFile.name)
        imageUrl = uploadedImageUrl === null ? undefined : uploadedImageUrl
        if (!imageUrl) {
          console.error("Failed to upload new image")
        }
      }

      // Update item with new data
      const updateData = {
        ...updates,
        image_url: imageUrl,
      }

      const { data, error } = await supabase.from("items").update(updateData).eq("id", id).select().single()

      if (error) {
        console.error("Error updating item:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in updateItem:", error)
      return null
    }
  }

  async deleteItem(id: number): Promise<boolean> {
    try {
      // Get item to check if it has an image
      const { data: item } = await supabase.from("items").select("image_url").eq("id", id).single()

      // Delete the item
      const { error } = await supabase.from("items").delete().eq("id", id)

      if (error) {
        console.error("Error deleting item:", error)
        return false
      }

      // Delete associated image if exists
      if (item?.image_url) {
        await this.deleteImage(item.image_url)
      }

      return true
    } catch (error) {
      console.error("Error in deleteItem:", error)
      return false
    }
  }

  async updateItemStock(id: number, stockChange: number): Promise<Items | null> {
    // First get current stock
    const { data: currentItem, error: fetchError } = await supabase.from("items").select("stock").eq("id", id).single()

    if (fetchError) {
      console.error("Error fetching current stock:", fetchError)
      return null
    }

    const newStock = Math.max(0, currentItem.stock + stockChange)

    return this.updateItem(id, { stock: newStock })
  }

  // Transaction methods
  async createTransaction(transaction: {
    total: number
    payment: number
    change: number
    items: { item_id: number; quantity: number; price_at_time: number }[]
  }): Promise<Transaction | null> {
    const { data: transactionData, error: transError } = await supabase
      .from("transactions")
      .insert([
        {
          total: transaction.total,
          payment: transaction.payment,
          change: transaction.change,
        },
      ])
      .select()
      .single()

    if (transError) {
      console.error("Error creating transaction:", transError)
      return null
    }

    // Insert transaction items
    const transactionItems = transaction.items.map((item) => ({
      transaction_id: transactionData.id,
      item_id: item.item_id,
      quantity: item.quantity,
      price_at_time: item.price_at_time,
    }))

    const { error: itemsError } = await supabase.from("transaction_items").insert(transactionItems)

    if (itemsError) {
      console.error("Error creating transaction items:", itemsError)
      return null
    }

    // Update stock for each item
    for (const item of transaction.items) {
      await this.updateItemStock(item.item_id, -item.quantity)
    }

    return transactionData
  }

  async getTransactions(limit = 50): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        transaction_items (
          *,
          items (*)
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching transactions:", error)
      return []
    }

    return data || []
  }
}

export const PosService = new PosServiceClass()
