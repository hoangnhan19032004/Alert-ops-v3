# AlertOps v3 — JWT Authentication Fix

## Tóm tắt các thay đổi

### Backend (ASP.NET Core)

| File | Fix |
|------|-----|
| `Controllers/AuthController.cs` | Thêm `POST /api/auth/logout` (xóa refresh token DB) + `GET /api/auth/me` + cleanup |
| `Controllers/ProjectsController.cs` | Thêm `[Authorize]` + role policies (ManagerUp/AdminOnly) |
| `Controllers/EscalationRulesController.cs` | Thêm `[Authorize]` + role policies |
| `Controllers/NotificationHistoryController.cs` | Thêm `[Authorize]` + role policies |
| `Program.cs` | Swagger Bearer UI, role-based policies, ClockSkew=0, JWT key null-check |
| `appsettings.json` | Xóa key hardcode — dùng env var hoặc User Secrets |
| `appsettings.Development.json` | Key mạnh hơn cho dev (không commit production key) |

### Frontend (Nuxt 3)

| File | Fix |
|------|-----|
| `composables/useAuth.ts` | Viết lại hoàn toàn — gọi API thực, lưu token đúng cách, auto-refresh |
| `composables/useApi.ts` | Đính `Authorization: Bearer` + intercept 401 → auto-refresh → retry |
| `middleware/auth.global.ts` | SSR-safe — dùng `useCookie` thay vì `localStorage` |
| `plugins/signalr.client.ts` | `accessTokenFactory` truyền JWT cho SignalR hub |
| `pages/login.vue` | Dùng email thay username, gọi API thực, set session cookie |
| `pages/logout.vue` | Gọi `POST /api/auth/logout`, xóa cookie, hiển thị tên đúng |

---

## Cài đặt nhanh

### 1. Cấu hình JWT Key an toàn

**Development** — dùng User Secrets (không lưu vào file):
```bash
cd AlertOpsBackend_fixed
dotnet user-secrets set "Jwt:Key" "your-strong-random-key-min-32-chars"
```

**Production** — biến môi trường:
```bash
export Jwt__Key="your-strong-random-key-min-32-chars"
```

### 2. Tạo user đầu tiên (Admin)

Sau khi chạy backend, gọi endpoint register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@company.com","password":"StrongPass123!","role":"Admin"}'
```

### 3. Chạy

```bash
# Backend
cd AlertOpsBackend_fixed
dotnet run

# Frontend
cd ..  # (thư mục Nuxt)
npm install
npm run dev
```

---

## Luồng JWT hoàn chỉnh

```
Login (email+password)
  → POST /api/auth/login
  → Nhận accessToken (1h) + refreshToken (7 ngày)
  → accessToken: in memory (useAuth)
  → refreshToken: localStorage
  → sessionCookie: cookie (SSR middleware)

Mỗi API request
  → useApi.apiCall() tự đính Bearer header
  → 401 → tự gọi /api/auth/refresh → retry

Token sắp hết hạn (60s trước)
  → scheduleRefresh() tự gọi silentRefresh()

Logout
  → POST /api/auth/logout (xóa refreshToken trên DB)
  → Xóa localStorage + sessionCookie

SignalR connect
  → accessTokenFactory() cung cấp JWT qua ?access_token=...
```

---

## Role-based authorization

| Role | Quyền |
|------|-------|
| `Admin` | Toàn quyền (AdminOnly + ManagerUp + Operator) |
| `Manager` | Tạo/sửa project, rule, gửi notification; không xóa |
| `Operator` | Đọc + sửa alert status |
| `Viewer` | Chỉ đọc |

Policies trong `Program.cs`:
- `AdminOnly` — chỉ Admin
- `ManagerUp` — Admin hoặc Manager
- `OperatorUp` — Admin, Manager, hoặc Operator
