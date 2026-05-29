// useAlertExport.ts

export const useAlertExport = () => {
  const tzStore = useTimezoneStore()

  // ✅ Helper: format an thtoàn - trả về chuỗi gốc nếu không parse được
  const safeFormatTime = (value: any): string => {
    if (!value) return ''
    try {
      const date = new Date(value)
      if (isNaN(date.getTime())) return String(value) // guard invalid date
      return tzStore.formatTimeFull(value)
    } catch {
      return String(value)
    }
  }

  const formatData = (data: any[]) =>
    data.map(row => ({
      ...row,
      createdAt: safeFormatTime(row.createdAt), // ✅ dùng safe helper
    }))

  const exportToCSV = (data: any[], filename = 'alerts.csv') => {
    if (!data || data.length === 0) {
      console.warn('No data to export')
      return
    }

    const formattedData = formatData(data) // ✅ format trước
    const headers = Object.keys(formattedData[0]) // ✅ dùng formattedData

    const csvContent = [
      headers.join(','),
      ...formattedData.map(row => // ✅ dùng formattedData (không phải data)
        headers.map(header => {
          const value = row[header]
          if (
            typeof value === 'string' &&
            (value.includes(',') || value.includes('"') || value.includes('\n'))
          ) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value ?? ''
        }).join(',')
      ),
    ].join('\n')

    downloadFile(csvContent, filename, 'text/csv')
  }

  const exportToJSON = (data: any[], filename = 'alerts.json') => {
    if (!data || data.length === 0) {
      console.warn('No data to export')
      return
    }

    const formattedData = formatData(data) // ✅ format trước
    const jsonContent = JSON.stringify(formattedData, null, 2) // ✅ dùng formattedData
    downloadFile(jsonContent, filename, 'application/json')
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return { exportToCSV, exportToJSON }
}