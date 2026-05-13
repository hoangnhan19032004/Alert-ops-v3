# Hướng Dẫn Chạy Backend & Frontend với Dữ Liệu Thực

## 📋 Tóm Tắt Những Gì Đã Thay Đổi

Toàn bộ mock data đã bị **xóa hoàn toàn**. Frontend hiện đang sử dụng:
- **Alerts**: Lấy từ API `/api/alerts` 
- **Projects**: Lấy từ API `/api/projects`
- **Escalation Rules**: Lấy từ API `/api/escalationrules`

---

## 🔧 BƯỚC 1: Kiểm Tra Backend

### 1.1 Chuyển vào thư mục backend
```bash
cd backend/AlertOpsBackend
```

### 1.2 Kiểm tra .NET SDK
```bash
dotnet --version
# Cần .NET 10.0 trở lên
```

### 1.3 Kiểm tra cấu hình MongoDB
Mở file `appsettings.json`:
```bash
# Windows
notepad appsettings.json

# hoặc macOS/Linux
cat appsettings.json
```

Nó sẽ trông như này:
```json
{
  "AlertOpsDatabase": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "AlertOpsDB"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

---

## 🗄️ BƯỚC 2: Khởi Động MongoDB

### Cho Windows:
```bash
# Nếu MongoDB được cài cùng Path
mongod

# Hoặc từ Windows Services
services.msc
# Tìm "MongoDB Server" và chạy nó
```

### Cho macOS:
```bash
brew services start mongodb-community
```

### Cho Linux:
```bash
sudo systemctl start mongod
```

**✅ Kiểm tra MongoDB chạy:**
```bash
mongosh
# Nếu có prompt `>` là OK, gõ `exit` để thoát
```

---

## 🚀 BƯỚC 3: Khởi Động Backend

### 3.1 Từ thư mục `backend/AlertOpsBackend`
```bash
dotnet run
```

Bạn sẽ thấy:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
      Now listening on: https://localhost:5001
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to stop.
```

### 3.2 Kiểm tra Swagger UI
Mở: http://localhost:5000/swagger

Bạn sẽ thấy các endpoint:
- `GET /api/alerts`
- `POST /api/alerts`
- `PUT /api/alerts/{id}`
- `DELETE /api/alerts/{id}`
- `GET /api/projects`
- `GET /api/escalationrules`

---

## 💾 BƯỚC 4: Thêm Dữ Liệu Test vào MongoDB

Mở terminal khác (đừng tắt backend):

### 4.1 Kết nối MongoDB
```bash
mongosh
```

### 4.2 Chọn database
```javascript
use AlertOpsDB
```

### 4.3 Thêm sample alerts
```javascript
db.alerts.insertMany([
  {
    _id: ObjectId(),
    message: "Database connection timeout",
    service: "payment-api",
    severity: "Critical",
    status: "Open",
    env: "Production",
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    message: "High memory usage detected",
    service: "notification-service",
    severity: "Warning",
    status: "Acknowledged",
    env: "Production",
    createdAt: new Date()
  }
])
```

### 4.4 Thêm sample projects
```javascript
db.projects.insertMany([
  {
    _id: ObjectId(),
    name: "api-payment",
    desc: "Payment processing system",
    sev: "Critical",
    alertCount: 1
  },
  {
    _id: ObjectId(),
    name: "notification-service",
    desc: "Email and SMS notifications",
    sev: "Warning",
    alertCount: 1
  }
])
```

### 4.5 Thêm sample escalation rules
```javascript
db.escalationrules.insertMany([
  {
    _id: ObjectId(),
    project: "api-payment",
    trigger: "critical",
    delay: "5 min",
    channel: "Email + Slack",
    active: true
  }
])
```

### 4.6 Kiểm tra dữ liệu
```javascript
db.alerts.find()
db.projects.find()
db.escalationrules.find()
```

Gõ `exit` để thoát MongoDB

---

## 🎨 BƯỚC 5: Khởi Động Frontend

### 5.1 Từ thư mục gốc (alert-ops-v3)
```bash
npm run dev
```

Bạn sẽ thấy:
```
  Nuxt 3 (v3.x.x) with Nitro
  
  ➜ Local:    http://localhost:3000
```

### 5.2 Mở trình duyệt
```
http://localhost:3000
```

---

## ✅ BƯỚC 6: Kiểm Tra Kết Nối

### 6.1 Vào trang Alerts
http://localhost:3000/alerts

Bạn sẽ thấy:
- ✅ Badge xanh "API Connected" (nếu kết nối thành công)
- Danh sách alerts từ MongoDB
- Nếu có lỗi, sẽ thấy "Offline (Mock Data)" nhưng lúc này không có mock data nữa, chỉ kết nối API

### 6.2 Vào trang Projects
http://localhost:3000/projects

Danh sách projects từ API

### 6.3 Vào trang Escalation Rules
http://localhost:3000/escalation

Danh sách rules từ API

---

## 🔧 Tìm & Sửa Lỗi

### Lỗi: "Lỗi khi kết nối API"

**Nguyên nhân**: Backend không chạy

**Giải pháp**:
1. Kiểm tra backend chạy trên http://localhost:5000
2. Kiểm tra lỗi trong terminal backend
3. Kiểm tra MongoDB chạy (`mongosh`)

### Lỗi: "Không thể tải alerts từ API"

**Nguyên nhân**: Có vấn đề với request API

**Giải pháp**:
1. Mở DevTools (F12) → Console
2. Xem error message chi tiết
3. Kiểm tra network tab xem request gửi đi như nào

### Lỗi: MongoDB Connection Error

**Giải pháp**:
```bash
# Kiểm tra MongoDB chạy
mongosh

# Hoặc khởi động lại MongoDB
# Windows
mongod

# macOS
brew services restart mongodb-community

# Linux
sudo systemctl restart mongod
```

---

## 📝 Các File Đã Thay Đổi

1. **composables/useErrorStore.ts** - Xóa mock data, kết nối API thực
2. **composables/useAlertStore.ts** - Xóa mock data, load từ API
3. **pages/alerts.vue** - Cập nhật để dùng API thực
4. **pages/projects.vue** - Cập nhật để dùng API thực
5. **pages/escalation.vue** - Cập nhật để dùng API thực
6. **stores/alerts.js** - Xóa toàn bộ mock data
7. **nuxt.config.ts** - Thêm runtime config cho API base URL

---

## 🌐 Thay Đổi API Base URL

Mặc định: `http://localhost:5000`

Để thay đổi:

### Cách 1: Environment Variable
```bash
# Windows (Command Prompt)
set NUXT_PUBLIC_API_BASE=http://your-server:5000

# Windows (PowerShell)
$env:NUXT_PUBLIC_API_BASE="http://your-server:5000"

# macOS/Linux
export NUXT_PUBLIC_API_BASE=http://your-server:5000

# Rồi chạy
npm run dev
```

### Cách 2: Cập nhật nuxt.config.ts
```typescript
runtimeConfig: {
  public: {
    apiBase: 'http://your-server:5000'
  }
}
```

---

## 📊 Tóm Tắt API Endpoints

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/api/alerts` | Lấy tất cả alerts |
| POST | `/api/alerts` | Tạo alert mới |
| PUT | `/api/alerts/{id}` | Cập nhật alert |
| DELETE | `/api/alerts/{id}` | Xóa alert |
| GET | `/api/projects` | Lấy tất cả projects |
| POST | `/api/projects` | Tạo project mới |
| GET | `/api/escalationrules` | Lấy tất cả rules |
| POST | `/api/escalationrules` | Tạo rule mới |

---

## 🎉 Xong! 

Bây giờ bạn có:
- ✅ Backend chạy trên port 5000
- ✅ Frontend chạy trên port 3000
- ✅ Dữ liệu thực từ MongoDB
- ✅ Không còn mock data nữa
- ✅ Kết nối API hoạt động
