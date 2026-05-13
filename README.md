# 🚀 AlertOps — Hướng dẫn cài đặt & chạy

## Yêu cầu
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [MongoDB Community](https://www.mongodb.com/try/download/community)
- [Node.js 18+](https://nodejs.org)

---

## Cài & kiểm tra MongoDB

Sau khi cài MongoDB, mở PowerShell kiểm tra:
```powershell
Get-Service -Name MongoDB
```
Nếu `Stopped` thì chạy:
```powershell
Start-Service -Name MongoDB
```

## Bước 1 — Chạy Backend

```powershell
cd AlertOpsBackend_fixed
dotnet restore
dotnet run
```

Backend chạy tại: `http://localhost:5000`  
Swagger UI: `http://localhost:5000/swagger`

---

## Bước 2 — Chạy Frontend

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
