# 🚨 AlertOps v3

Hệ thống quản lý cảnh báo (Alert Operations) full-stack dành cho đội vận hành, hỗ trợ realtime, phân quyền theo vai trò, leo thang tự động và thống kê trực quan.

---

## 🛠 Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | Nuxt 4 · Vue 3 · TypeScript · Pinia · Chart.js |
| Backend | ASP.NET Core (.NET 10) · C# |
| Database | MongoDB |
| Realtime | SignalR |
| Auth | JWT (Access Token + Refresh Token) |
| Email | SMTP (HTML template) |

---

## ✅ Những gì đã làm được

### 🔐 Xác thực & Phân quyền

- **JWT hoàn chỉnh**: Access Token lưu in-memory (chống XSS) + Refresh Token 7 ngày lưu DB
- **Auto-refresh**: Frontend tự động gia hạn token 60 giây trước khi hết hạn, intercept 401 → refresh → retry
- **4 vai trò**: `Admin` · `Manager` · `Operator` · `Viewer`
- **3 policy RBAC**: `AdminOnly` · `ManagerUp` · `OperatorUp` — gán đúng từng endpoint
- **Endpoints Auth**: `/register` · `/login` · `/refresh` · `/logout` · `/me`
- **SSR-safe middleware**: dùng `useCookie` thay `localStorage` để route guard hoạt động đúng trên server

---

### 📋 Quản lý Alerts

- CRUD đầy đủ: tạo, xem, sửa, xóa alert
- **Bulk actions**: chọn nhiều → xóa hàng loạt, đổi status hàng loạt (Acknowledge / Resolve / Escalate)
- **Patch status**: PATCH endpoint riêng để cập nhật status mà không cần gửi toàn bộ object
- **Stats endpoint**: tổng hợp số lượng theo status và severity
- **Filter & Sort**: lọc theo status, severity, environment; sort multi-column
- **Tự động cập nhật alertCount** của Project khi tạo/xóa alert
- **Export**: xuất danh sách alert ra CSV hoặc JSON

---

### 🏗 Quản lý Projects

- CRUD đầy đủ, phân quyền (tạo/sửa cần Manager+, xóa cần Admin)
- Mỗi project có: Owner, danh sách Managers, danh sách Members (email)
- AlertCount tự tăng/giảm theo alert được tạo/xóa trong project

---

### ⚡ Realtime với SignalR

- `AlertOpsHub` yêu cầu xác thực JWT, truyền token qua query string `?access_token=`
- Mỗi user được join vào group riêng (`user:{id}`) và group theo role (`role:{Admin}`)
- Hỗ trợ join/leave group theo project
- Phát sự kiện realtime:
  - `alert:new` — có alert mới
  - `alert:updated` — alert vừa được cập nhật
  - `alert:deleted` — alert bị xóa
  - `alerts:bulkDeleted` / `alerts:bulkUpdated` — thao tác hàng loạt
- Admin có thể broadcast thông báo toàn hệ thống
- Frontend hiển thị trạng thái **Live / Offline**, tự retry khi mất kết nối

---

### 🔔 Leo thang tự động (EscalationWorker)

- Background service chạy **mỗi 30 giây**
- Match alert với escalation rule theo: project, trigger (severity/keyword), delay time
- Tự động gửi email khi alert chưa được giải quyết sau thời gian delay
- Delay hỗ trợ: `Immediate` · `30 sec` · `1–30 min` · `1 hour`
- Chống gửi trùng bằng `HashSet<ruleId:alertId>` in-memory
- Email recipients lấy từ owner + managers + members của project

---

### 📧 Notification & Email

- Gửi email qua SMTP cấu hình qua `appsettings.json` hoặc biến môi trường
- Template email HTML responsive, dark-mode style
- Lịch sử notification lưu vào DB, có thể lọc theo alert, project, recent, failed
- Dev mode: log warning thay vì lỗi khi chưa cấu hình SMTP

---

### 📊 Analytics & Thống kê

- **KPI cards**: Tổng alerts · Open · Escalated · Resolved · Critical · Resolve rate
- **Alert Trend**: biểu đồ đường theo ngày (7 / 14 / 30 ngày)
- **Donut chart**: phân bổ theo status
- **Heatmap**: mật độ alert theo giờ trong ngày
- Tất cả render bằng Chart.js, responsive

---

### 🌐 Giao diện Frontend

- **Dark / Light theme** — lưu preference vào localStorage
- **i18n**: hỗ trợ Tiếng Việt và English, toggle realtime
- **Toast notification** — thông báo thành công/lỗi nhẹ nhàng
- **Search history** — gợi ý lại các từ khóa đã tìm
- **User Preferences** — lưu cài đặt cá nhân
- **Swagger UI** với Bearer auth (chỉ chạy ở dev)
- Sidebar navigation với icon, responsive

---

## 📁 Cấu trúc dự án

```
alert-ops-v3/
├── backend/
│   ├── Controllers/          # API endpoints
│   ├── Services/             # Business logic, Email, Notification
│   ├── Models/               # MongoDB models
│   ├── DTOs/                 # Request/Response objects
│   ├── Hubs/                 # SignalR hub
│   └── Program.cs            # DI, JWT, CORS, Swagger setup
└── frontend/
    ├── pages/                # alerts · analytics · projects · escalation · profile
    ├── components/           # Modals, Sidebar, Toast, AlertDetail
    ├── composables/          # useAuth · useApi · useAlertStore · useI18n · ...
    ├── stores/               # Pinia alert store
    ├── plugins/              # SignalR client plugin
    └── middleware/           # auth.global.ts (SSR-safe)
```

---

## 🚀 Chạy nhanh

### Yêu cầu
- .NET 10 SDK
- Node.js 20+
- MongoDB (local hoặc Atlas)

### Backend

```bash
cd backend

# Cấu hình JWT key (dev)
dotnet user-secrets set "Jwt:Key" "your-strong-random-key-min-32-chars"

# Chạy
dotnet run
# → http://localhost:5000
# → Swagger: http://localhost:5000/swagger
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Tạo user Admin đầu tiên

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@company.com","password":"StrongPass123!","role":"Admin"}'
```

---

## ⚙️ Cấu hình

`backend/appsettings.Development.json`:

```json
{
  "AlertOpsDatabase": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "AlertOps"
  },
  "Jwt": {
    "Issuer": "AlertOpsBackend",
    "Audience": "AlertOpsFrontend"
  },
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "SmtpUser": "your@email.com",
    "SmtpPassword": "your-app-password",
    "SenderEmail": "noreply@alertops.com",
    "SenderName": "AlertOps"
  }
}
```

---

## 🔑 Phân quyền

| Role | Quyền |
|---|---|
| `Admin` | Toàn quyền — xóa project, quản lý user |
| `Manager` | Tạo/sửa project, rule, gửi notification |
| `Operator` | Đọc + sửa status alert |
| `Viewer` | Chỉ xem |

---

## ⚠️ Lưu ý

- `EscalationWorker` dùng HashSet in-memory để chống gửi trùng → **restart server sẽ reset**. Cần persist vào DB/Redis cho production.
- Slack và PagerDuty hiện là **UI placeholder** — chưa tích hợp API thật.
- Frontend `useAlertRealtime` cần đọc URL từ `runtimeConfig` thay vì hardcode trước khi deploy.