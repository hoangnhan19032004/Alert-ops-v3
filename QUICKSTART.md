# 🚀 QUICK START - Chạy Backend & Frontend

## Terminal 1: Khởi Động MongoDB

```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Kiểm tra (terminal khác)
mongosh
exit
```

---

## Terminal 2: Khởi Động Backend

```bash
cd backend/AlertOpsBackend
dotnet run
```

✅ Chờ tới khi thấy:
```
Now listening on: http://localhost:5000
```

---

## Terminal 3: Khởi Động Frontend

```bash
npm run dev
```

✅ Mở: http://localhost:3000

---

## Thêm Dữ Liệu Test (Terminal 4)

```bash
mongosh
use AlertOpsDB

# Thêm 1 alert
db.alerts.insertOne({
  message: "Test alert",
  service: "test-service",
  severity: "Critical",
  status: "Open"
})

# Thêm 1 project
db.projects.insertOne({
  name: "test-project",
  desc: "Test project description",
  sev: "Critical",
  alertCount: 1
})

# Kiểm tra
db.alerts.find()
db.projects.find()

# Thoát
exit
```

---

## Xem Kết Quả

| Trang | URL |
|-------|-----|
| Alerts | http://localhost:3000/alerts |
| Projects | http://localhost:3000/projects |
| Escalation | http://localhost:3000/escalation |
| Swagger API | http://localhost:5000/swagger |

---

## Tắt Tất Cả

```bash
# Terminal 1: Ctrl+C (mongod)
# Terminal 2: Ctrl+C (dotnet)
# Terminal 3: Ctrl+C (npm)
```

---

## ⚠️ Nếu Gặp Lỗi

**"Lỗi khi kết nối API"**
- Kiểm tra backend chạy: http://localhost:5000/swagger
- Kiểm tra MongoDB chạy: mongosh

**"Không thể tải alerts"**
- Mở DevTools (F12) → Console
- Kiểm tra error message

**MongoDB Connection Error**
```bash
# Khởi động lại MongoDB
mongod  # Windows
brew services restart mongodb-community  # macOS
sudo systemctl restart mongod  # Linux
```

---

Đọc `BACKEND_SETUP.md` để chi tiết hơn!
