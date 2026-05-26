export interface ExportOptions {
  format: 'csv' | 'json'  // Chỉ cho phép 2 định dạng hợp lệ 
  filename?: string       // Tên file 
}

export const useAlertExport = () => {
  const exportToCSV = (data: any[], filename = 'alerts.csv') => {
    if (!data || data.length === 0) {
      console.warn('No data to export')
      return
    }

    // Get column headers from first row - Lấy tất cả các key của object đầu tiên để làm header
    const headers = Object.keys(data[0])

    // Create CSV header - Tạo CSV header - Ghép tất cả các key lại với nhau và ngăn cách bởi dấu phẩy
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header]
          // Escape values that contain comma, quote, or newline - Nếu giá trị chứa dấu phẩy, dấu nháy kép hoặc xuống dòng thì thêm dấu ngoặc kép vào xung quanh
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value || ''
        }).join(',')
      )
    ].join('\n') // Tạo một chuỗi mới bằng cách nối các phần tử trong mảng lại với nhau và ngăn cách bởi dấu xuống dòng

    downloadFile(csvContent, filename, 'text/csv')
  }

  // Hàm exportToJSON - Tạo JSON và download nó - Convert dữ liệu sang JSON và download nó như một file
  const exportToJSON = (data: any[], filename = 'alerts.json') => {
    if (!data || data.length === 0) {
      console.warn('No data to export')
      return
    }

    const jsonContent = JSON.stringify(data, null, 2)
    downloadFile(jsonContent, filename, 'application/json')
  }

  // Tạo hàm downloadFile - Tạo một file blob và download nó - Tạo một blob từ chuỗi nội dung và mime type, tạo một URL từ blob và tải nó xuống như một file
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
