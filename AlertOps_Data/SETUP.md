# 🚀 AlertOps — Hướng dẫn cài đặt & chạy

## Yêu cầu
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [MongoDB Community](https://www.mongodb.com/try/download/community)
- [Node.js 18+](https://nodejs.org)

---

## Bước 1 — Cài & kiểm tra MongoDB

Sau khi cài MongoDB, mở PowerShell kiểm tra:
```powershell
Get-Service -Name MongoDB
```
Nếu `Stopped` thì chạy:
```powershell
Start-Service -Name MongoDB
```

---

## Bước 2 — Import data mẫu

M�� PowerShell **tại thư mục này**, chạy:
```powershell
.\import.ps1
```

> Script sẽ tự tạo database `AlertOpsDB` với đầy đủ data mẫu.

---

## Bước 3 — Cấu hình Backend

M�� file `AlertOpsBackend_fixed_v2/appsettings.json`, đảm bảo có các section sau:

```json
{
  "AlertOpsDatabase": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "AlertOpsDB",
    "AlertsCollectionName": "Alerts",
    "ProjectsCollectionName": "Projects",
    "EscalationRulesCollectionName": "EscalationRules",
    "NotificationHistoryCollectionName": "NotificationHistory"
  },
  "Jwt": {
    "Key": "AlertOps_SuperSecret_Key_MinLength32Chars!",
    "Issuer": "alertops",
    "Audience": "alertops"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:3000"]
  }
}
```

---

## Bước 4 — Chạy Backend

```powershell
cd AlertOpsBackend_fixed_v2
dotnet restore
dotnet run
```

Backend chạy tại: `http://localhost:5000`  
Swagger UI: `http://localhost:5000/swagger`

---

## Bước 5 — Chạy Frontend

M�� terminal mới:
```powershell
cd alert-ops-v3
npm install
npm run dev
```

Frontend chạy tại: `http://localhost:3000`

---

## ✅ Kiểm tra nhanh

M�� browser vào `http://localhost:3000` — nếu thấy dashboard với data là thành công!
