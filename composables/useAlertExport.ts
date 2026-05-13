export interface ExportOptions {
  format: 'csv' | 'json'
  filename?: string
}

export const useAlertExport = () => {
  const exportToCSV = (data: any[], filename = 'alerts.csv') => {
    if (!data || data.length === 0) {
      console.warn('No data to export')
      return
    }

    // Get column headers from first row
    const headers = Object.keys(data[0])
    
    // Create CSV header
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header]
          // Escape values that contain comma, quote, or newline
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value || ''
        }).join(',')
      )
    ].join('\n')

    downloadFile(csvContent, filename, 'text/csv')
  }

  const exportToJSON = (data: any[], filename = 'alerts.json') => {
    if (!data || data.length === 0) {
      console.warn('No data to export')
      return
    }

    const jsonContent = JSON.stringify(data, null, 2)
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

  return {
    exportToCSV,
    exportToJSON
  }
}
