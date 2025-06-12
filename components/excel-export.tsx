"use client"
import { Alert } from "react-native"
import * as XLSX from 'xlsx'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import type { Transaction } from "~/services/POSService"
import type { TimePeriod } from "~/components/period-selector"

export interface ExcelExportData {
  totalRevenue: number
  totalTransactions: number
  totalItemsSold: number
  transactions: Transaction[]
  period: TimePeriod
  selectedDate: Date
}

interface ExcelExportProps {
  data: ExcelExportData
  onExportStart?: () => void
  onExportComplete?: (success: boolean, message: string) => void
}

export const useExcelExport = () => {
  const exportToExcel = async (data: ExcelExportData, options?: {
    onStart?: () => void
    onComplete?: (success: boolean, message: string) => void
  }) => {
    try {
      options?.onStart?.()
      
      // Check if sharing is available first
      const isAvailable = await Sharing.isAvailableAsync()
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing tidak tersedia di perangkat ini')
        options?.onComplete?.(false, 'Sharing tidak tersedia')
        return
      }

      // Get period label for filename
      const periodLabels = {
        day: 'Harian',
        week: 'Mingguan', 
        month: 'Bulanan',
        year: 'Tahunan',
        'all-time': 'Semua_Waktu'
      } as const
      
      const dateStr = data.selectedDate.toISOString().split('T')[0]
      const filename = `Laporan_${periodLabels[data.period]}_${dateStr}.xlsx`

      // Create workbook
      const wb = XLSX.utils.book_new()

      // 1. Summary Sheet
      const summaryData = [
        ['LAPORAN PENJUALAN'],
        ['Periode', periodLabels[data.period]],
        ['Tanggal', data.selectedDate.toLocaleDateString('id-ID')],
        ['Waktu Export', new Date().toLocaleString('id-ID')],
        [''],
        ['RINGKASAN'],
        ['Total Pendapatan', `Rp ${data.totalRevenue.toLocaleString('id-ID')}`],
        ['Total Transaksi', data.totalTransactions],
        ['Total Item Terjual', data.totalItemsSold],
        [''],
        ['Rata-rata per Transaksi', data.totalTransactions > 0 ? `Rp ${Math.round(data.totalRevenue / data.totalTransactions).toLocaleString('id-ID')}` : 'Rp 0'],
        ['Rata-rata Item per Transaksi', data.totalTransactions > 0 ? Math.round(data.totalItemsSold / data.totalTransactions) : 0]
      ]

      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Ringkasan')

      // 2. Transactions Detail Sheet
      if (data.transactions.length > 0) {
        const transactionData = [
          ['No', 'ID Transaksi', 'Tanggal', 'Waktu', 'Total', 'Pembayaran', 'Kembalian', 'Metode Pembayaran', 'Jumlah Item', 'Detail Item']
        ]

        data.transactions.forEach((transaction, index) => {
          const date = new Date(transaction.created_at)
          const totalItems = transaction.transaction_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
          
          // Handle different property names for items
          const itemDetails = transaction.transaction_items?.map((item: any) => {
            const productName = 
              item.product?.name ||
              item.item?.name ||
              item.items?.name ||
              (item as any).name ||
              `Item ID: ${item.item_id}`

            return `${productName} (${item.quantity}x @ Rp${item.price_at_time.toLocaleString('id-ID')})`
          }).join(', ') || ''

          transactionData.push([
            (index + 1).toString(),
            transaction.id.toString(),
            date.toLocaleDateString('id-ID'),
            date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            transaction.total.toString(),
            transaction.payment?.toString() || transaction.total.toString(),
            transaction.change?.toString() || '0',
            transaction.payment_method || 'Cash',
            totalItems.toString(),
            itemDetails
          ])
        })

        const transactionWs = XLSX.utils.aoa_to_sheet(transactionData)
        
        // Set column widths
        transactionWs['!cols'] = [
          { width: 5 },   // No
          { width: 15 },  // ID
          { width: 12 },  // Date
          { width: 8 },   // Time
          { width: 15 },  // Total
          { width: 15 },  // Payment
          { width: 15 },  // Change
          { width: 15 },  // Payment Method
          { width: 10 },  // Item Count
          { width: 60 }   // Items Detail
        ]
        // Add autofilter to header row
        transactionWs['!autofilter'] = { ref: `A1:J1` }
        // Add simple border and color to header row (open source xlsx only supports cell styles for .xlsx, not .csv)
        for (let col = 0; col < 10; col++) {
          const cell = transactionWs[XLSX.utils.encode_cell({ r: 0, c: col })]
          if (cell) {
            cell.s = {
              fill: { fgColor: { rgb: 'FFCCE5FF' } }, // light blue
              font: { bold: true },
              border: {
                top: { style: 'thin', color: { rgb: 'FF000000' } },
                bottom: { style: 'thin', color: { rgb: 'FF000000' } },
                left: { style: 'thin', color: { rgb: 'FF000000' } },
                right: { style: 'thin', color: { rgb: 'FF000000' } },
              },
            }
          }
        }
        XLSX.utils.book_append_sheet(wb, transactionWs, 'Detail Transaksi')
      }

      // 3. Items Detail Sheet (All items sold)
      if (data.transactions.length > 0) {
        const itemsData = [
          ['No', 'ID Transaksi', 'Tanggal', 'Nama Item', 'Harga Saat Itu', 'Jumlah', 'Subtotal']
        ]

        let itemIndex = 1
        data.transactions.forEach(transaction => {
          const date = new Date(transaction.created_at)
          
          transaction.transaction_items?.forEach((item: any) => {
            const productName = 
              item.product?.name ||
              item.item?.name ||
              item.items?.name ||
              (item as any).name ||
              `Item ID: ${item.item_id}`

            itemsData.push([
              itemIndex++,
              transaction.id,
              date.toLocaleDateString('id-ID'),
              productName,
              item.price_at_time,
              item.quantity,
              item.quantity * item.price_at_time
            ])
          })
        })

        const itemsWs = XLSX.utils.aoa_to_sheet(itemsData)
        
        // Set column widths
        itemsWs['!cols'] = [
          { width: 5 },   // No
          { width: 15 },  // Transaction ID
          { width: 12 },  // Date
          { width: 30 },  // Product Name
          { width: 15 },  // Price
          { width: 10 },  // Quantity
          { width: 15 }   // Subtotal
        ]

        // Add autofilter, color, and border to header row
        itemsWs['!autofilter'] = { ref: `A1:G1` }
        for (let col = 0; col < 7; col++) {
          const cell = itemsWs[XLSX.utils.encode_cell({ r: 0, c: col })]
          if (cell) {
            cell.s = {
              fill: { fgColor: { rgb: 'FFCCE5FF' } },
              font: { bold: true },
              border: {
                top: { style: 'thin', color: { rgb: 'FF000000' } },
                bottom: { style: 'thin', color: { rgb: 'FF000000' } },
                left: { style: 'thin', color: { rgb: 'FF000000' } },
                right: { style: 'thin', color: { rgb: 'FF000000' } },
              },
            }
          }
        }
        XLSX.utils.book_append_sheet(wb, itemsWs, 'Detail Item')
      }

      // 4. Product Summary Sheet
      const productSummary: { [key: string]: { quantity: number, revenue: number, name: string, transactions: number } } = {}
      
      data.transactions.forEach(transaction => {
        transaction.transaction_items?.forEach((item: any) => {
          const productId = 
            item.product?.id || 
            item.item?.id || 
            item.items?.id || 
            item.item_id

          const productName = 
            item.product?.name ||
            item.item?.name ||
            item.items?.name ||
            (item as any).name ||
            `Item ID: ${item.item_id}`

          if (productId) {
            if (!productSummary[productId]) {
              productSummary[productId] = {
                name: productName,
                quantity: 0,
                revenue: 0,
                transactions: 0
              }
            }
            productSummary[productId].quantity += item.quantity
            productSummary[productId].revenue += item.quantity * item.price_at_time
            productSummary[productId].transactions += 1
          }
        })
      })

      if (Object.keys(productSummary).length > 0) {
        const productData = [
          ['Nama Produk', 'Total Terjual', 'Total Pendapatan', 'Rata-rata Harga', 'Jumlah Transaksi', 'Kontribusi (%)']
        ]

        Object.values(productSummary)
          .sort((a, b) => b.revenue - a.revenue)
          .forEach(product => {
            const contribution = ((product.revenue / data.totalRevenue) * 100).toFixed(2)
            productData.push([
              product.name,
              product.quantity.toString(),
              product.revenue.toString(),
              Math.round(product.revenue / product.quantity).toString(),
              product.transactions.toString(),
              `${contribution}%`
            ])
          })

        const productWs = XLSX.utils.aoa_to_sheet(productData)
        productWs['!cols'] = [
          { width: 30 },  // Product name
          { width: 15 },  // Quantity
          { width: 20 },  // Revenue
          { width: 15 },  // Average price
          { width: 15 },  // Transactions
          { width: 15 }   // Contribution
        ]

        // Add autofilter, color, and border to header row
        productWs['!autofilter'] = { ref: `A1:F1` }
        for (let col = 0; col < 6; col++) {
          const cell = productWs[XLSX.utils.encode_cell({ r: 0, c: col })]
          if (cell) {
            cell.s = {
              fill: { fgColor: { rgb: 'FFCCE5FF' } },
              font: { bold: true },
              border: {
                top: { style: 'thin', color: { rgb: 'FF000000' } },
                bottom: { style: 'thin', color: { rgb: 'FF000000' } },
                left: { style: 'thin', color: { rgb: 'FF000000' } },
                right: { style: 'thin', color: { rgb: 'FF000000' } },
              },
            }
          }
        }
        XLSX.utils.book_append_sheet(wb, productWs, 'Ringkasan Produk')
      }

      // 5. Daily Sales Sheet (for weekly/monthly/yearly periods)
      if (data.period !== 'day' && data.transactions.length > 0) {
        const dailySales: { [key: string]: { revenue: number, transactions: number, items: number } } = {}
        
        data.transactions.forEach(transaction => {
          const dateKey = new Date(transaction.created_at).toLocaleDateString('id-ID')
          const itemCount = transaction.transaction_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
          
          if (!dailySales[dateKey]) {
            dailySales[dateKey] = { revenue: 0, transactions: 0, items: 0 }
          }
          
          dailySales[dateKey].revenue += transaction.total
          dailySales[dateKey].transactions += 1
          dailySales[dateKey].items += itemCount
        })

        const dailyData = [
          ['Tanggal', 'Pendapatan', 'Jumlah Transaksi', 'Item Terjual']
        ]

        Object.entries(dailySales)
          .sort(([a], [b]) => new Date(a.split('/').reverse().join('-')).getTime() - new Date(b.split('/').reverse().join('-')).getTime())
          .forEach(([date, data]) => {
            dailyData.push([
              date,
              data.revenue.toString(),
              data.transactions.toString(),
              data.items.toString()
            ])
          })

        const dailyWs = XLSX.utils.aoa_to_sheet(dailyData)
        dailyWs['!cols'] = [
          { width: 15 },  // Date
          { width: 20 },  // Revenue
          { width: 15 },  // Transactions
          { width: 15 }   // Items
        ]

        // Add autofilter, color, and border to header row
        dailyWs['!autofilter'] = { ref: `A1:D1` }
        for (let col = 0; col < 4; col++) {
          const cell = dailyWs[XLSX.utils.encode_cell({ r: 0, c: col })]
          if (cell) {
            cell.s = {
              fill: { fgColor: { rgb: 'FFCCE5FF' } },
              font: { bold: true },
              border: {
                top: { style: 'thin', color: { rgb: 'FF000000' } },
                bottom: { style: 'thin', color: { rgb: 'FF000000' } },
                left: { style: 'thin', color: { rgb: 'FF000000' } },
                right: { style: 'thin', color: { rgb: 'FF000000' } },
              },
            }
          }
        }
        XLSX.utils.book_append_sheet(wb, dailyWs, 'Penjualan Harian')
      }

      // 3b. Per-Item Per-Transaction Detail Sheet
      if (data.transactions.length > 0) {
        const perItemTransData = [
          ['No', 'ID Transaksi', 'Tanggal', 'Waktu', 'Nama Item', 'Harga Saat Itu', 'Jumlah', 'Subtotal', 'Metode Pembayaran', 'Pembayaran', 'Kembalian']
        ]
        let rowIndex = 1
        data.transactions.forEach(transaction => {
          const date = new Date(transaction.created_at)
          const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          const paymentMethod = transaction.payment_method || 'Cash'
          const payment = transaction.payment?.toString() || transaction.total.toString()
          const change = transaction.change?.toString() || '0'
          transaction.transaction_items?.forEach((item: any) => {
            const productName = 
              item.product?.name || item.item?.name || item.items?.name || (item as any).name || `Item ID: ${item.item_id}`
            perItemTransData.push([
              rowIndex++,
              transaction.id,
              date.toLocaleDateString('id-ID'),
              time,
              productName,
              item.price_at_time,
              item.quantity,
              item.quantity * item.price_at_time,
              paymentMethod,
              payment,
              change
            ])
          })
        })
        const perItemTransWs = XLSX.utils.aoa_to_sheet(perItemTransData)
        perItemTransWs['!cols'] = [
          { width: 5 },   // No
          { width: 15 },  // Transaction ID
          { width: 12 },  // Date
          { width: 8 },   // Time
          { width: 30 },  // Product Name
          { width: 15 },  // Price
          { width: 10 },  // Quantity
          { width: 15 },  // Subtotal
          { width: 15 },  // Payment Method
          { width: 15 },  // Payment
          { width: 15 }   // Change
        ]
        // Add autofilter, color, and border to header row
        perItemTransWs['!autofilter'] = { ref: `A1:K1` }
        for (let col = 0; col < 11; col++) {
          const cell = perItemTransWs[XLSX.utils.encode_cell({ r: 0, c: col })]
          if (cell) {
            cell.s = {
              fill: { fgColor: { rgb: 'FFCCE5FF' } },
              font: { bold: true },
              border: {
                top: { style: 'thin', color: { rgb: 'FF000000' } },
                bottom: { style: 'thin', color: { rgb: 'FF000000' } },
                left: { style: 'thin', color: { rgb: 'FF000000' } },
                right: { style: 'thin', color: { rgb: 'FF000000' } },
              },
            }
          }
        }
        XLSX.utils.book_append_sheet(wb, perItemTransWs, 'Detail Per Item-Transaksi')
      }

      // Write file
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' })
      const uri = FileSystem.documentDirectory + filename

      await FileSystem.writeAsStringAsync(uri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      })

      // Share the file
      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Bagikan Laporan Excel',
      })
      
      options?.onComplete?.(true, 'Laporan berhasil diekspor')

    } catch (error) {
      console.error('Error exporting to Excel:', error)
      options?.onComplete?.(false, 'Gagal mengekspor laporan')
    }
  }

  return { exportToExcel }
}

export const useExcelExportButton = ({ 
  data, 
  onExportStart, 
  onExportComplete 
}: ExcelExportProps) => {
  const { exportToExcel } = useExcelExport()

  const handleExport = () => {
    exportToExcel(data, {
      onStart: onExportStart,
      onComplete: onExportComplete
    })
  }

  return { handleExport }
}
