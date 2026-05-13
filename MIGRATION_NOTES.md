# 📚 Tài Liệu: Xóa Mock Data & Kết Nối API Thực

## 🎯 Mục Đích

Chuyển đổi ứng dụng từ sử dụng **mock data tĩnh** sang **kết nối API thực** với backend .NET.

---

## 📊 Những Gì Đã Bị Xóa

### 1. Mock Data trong Composables

**File**: `composables/useAlertStore.ts`

**Cũ** (Mock Data):
```typescript
export const useAlerts = () => useState('alerts', () => [
  { id: 'ALT-001', severity: 'Critical', ... },
  { id: 'ALT-002', severity: 'Error', ... },
  // ... 6 alerts giả
])

export const useProjects = () => useState('projects', () => [
  { name: 'mssql-ftel-alerts', sev: 'Critical', ... },
  // ... 5 projects giả
])

export const useEscRules = () => useState('escRules', () => [
  { project: 'mssql-ftel-alerts', trigger: 'critical', ... },
  // ... 4 rules giả
])
```

**Mới** (API-Driven):
```typescript
export const useProjects = () => {
  const { apiCall } = useApi()
  const projects = useState<Project[]>('projects', () => [])
  
  const loadProjects = async () => {
    const response = await apiCall<Project[]>('/api/projects')
    if (response.success) {
      projects.value = response.data
    }
  }
  
  if (process.client && projects.value.length === 0) {
    loadProjects()
  }
  
  return projects
}
```

### 2. Mock Data trong Store

**File**: `stores/alerts.js`

**Cũ**: Chứa 6 alerts, 5 projects, 4 rules giả bằng Tiếng Việt

**Mới**: Rỗng (không dùng nữa)

### 3. Error Handling Composite

**File**: `composables/useErrorStore.ts`

**Cũ**: 
- Có fallback mock data (getMockAlerts function)
- Hiển thị mock data khi API offline

**Mới**:
- Xóa hết mock data fallback
- Nếu API offline, danh sách rỗng

---

## 🔄 Những Gì Đã Thay Đổi

### 1. useErrorStore.ts - Alerts Management

| Tính Năng | Trước | Sau |
|----------|--------|------|
| Mock Data | ✅ 6 alerts | ❌ Không |
| Load từ API | ❌ Có fallback | ✅ Luôn load |
| Update Alert | ❌ Không | ✅ Có |
| Delete Alert | ❌ Không | ✅ Có |
| Endpoint | `/api/alerts` | `/api/alerts` |

**Hàm mới**:
- `loadAlerts()` - Lấy tất cả alerts
- `createAlert()` - Tạo alert mới
- `updateAlert()` - Cập nhật alert
- `deleteAlert()` - Xóa alert
- `checkConnection()` - Kiểm tra API

### 2. useAlertStore.ts - Projects & Rules

**Cũ**:
```typescript
export const useProjects = () => useState('projects', () => [...mock data...])
```

**Mới**:
```typescript
export const useProjects = () => {
  // Load từ API `/api/projects`
  // Auto-load khi component mount
  // Có thêm createProject() function
}

export const useEscRules = () => {
  // Load từ API `/api/escalationrules`
  // Auto-load khi component mount
  // Có thêm createRule() function
}
```

### 3. Pages Updates

#### a) pages/alerts.vue
```diff
- const { alerts, loading, apiConnected, loadErrors } = useErrorStore()
+ const { alerts, loading, apiConnected, loadAlerts } = useErrorStore()

- @click="loadErrors"
+ @click="refetchAlerts"

- // Fallback to mock data
- <span>• Offline (Mock Data)</span>
+ <span>• Offline (No Data)</span>
```

#### b) pages/projects.vue
```diff
- Hiển thị ngay projects (có mock data)
+ Có loading state
+ Hiển thị: "Loading projects from API..."
+ Cập nhật UI để phù hợp dữ liệu API
```

#### c) pages/escalation.vue
```diff
- Xóa local mutation của array
+ API call khi xóa rule
+ API call khi thêm rule
```

### 4. nuxt.config.ts - Runtime Config

**Thêm**:
```typescript
runtimeConfig: {
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:5000'
  }
}
```

---

## 🔌 API Endpoints Sử Dụng

Tất cả từ backend .NET:

### Alerts
```
GET    /api/alerts           - Lấy tất cả
POST   /api/alerts           - Tạo mới
PUT    /api/alerts/{id}      - Cập nhật
DELETE /api/alerts/{id}      - Xóa
```

### Projects
```
GET    /api/projects         - Lấy tất cả
POST   /api/projects         - Tạo mới
PUT    /api/projects/{id}    - Cập nhật
DELETE /api/projects/{id}    - Xóa
```

### Escalation Rules
```
GET    /api/escalationrules  - Lấy tất cả
POST   /api/escalationrules  - Tạo mới
PUT    /api/escalationrules/{id}    - Cập nhật
DELETE /api/escalationrules/{id}    - Xóa
```

---

## 📝 Quy Trình Load Dữ Liệu

### Trước (Mock Data):
```
Component Mount
    ↓
useState() với initial mock data
    ↓
Hiển thị ngay (không cần load)
```

### Sau (Real Data):
```
Component Mount
    ↓
useState() rỗng
    ↓
Composable auto-load từ API
    ↓
API → MongoDB → Component
    ↓
Render dữ liệu thực
```

---

## 🛠️ Cách Thêm/Sửa Dữ Liệu

### Cách 1: Qua Frontend UI

**Alerts**: Chưa có button "Add Alert" (cần UI)

**Projects**: Button "Thêm Project"
```typescript
// projects.vue - handleAddProject()
const result = await useApi().apiCall('/api/projects', {
  method: 'POST',
  body: newProject
})
```

**Escalation Rules**: Button "+ Add Rule"
```typescript
// escalation.vue - addRule()
const response = await useApi().apiCall('/api/escalationrules', {
  method: 'POST',
  body: newRule
})
```

### Cách 2: MongoDB Shell

```bash
mongosh
use AlertOpsDB

db.alerts.insertOne({
  message: "New alert",
  service: "my-service",
  severity: "Critical"
})

# Rồi refresh frontend
```

### Cách 3: Swagger UI

http://localhost:5000/swagger
- Try it out
- Gửi request
- Check MongoDB

---

## 🔍 Debug Tips

### Kiểm tra dữ liệu từ API
```bash
# Terminal
curl http://localhost:5000/api/alerts

# Hoặc DevTools (F12)
# Network tab → xem requests
```

### Kiểm tra MongoDB
```bash
mongosh
db.alerts.find().pretty()
db.projects.find().pretty()
```

### Kiểm tra Console Errors
```
F12 → Console tab
Tìm messages màu đỏ
```

---

## 📦 Danh Sách File Đã Thay Đổi

| File | Thay Đổi |
|------|----------|
| `composables/useErrorStore.ts` | ✅ Xóa mock, thêm API load |
| `composables/useAlertStore.ts` | ✅ Xóa mock, thêm API load |
| `pages/alerts.vue` | ✅ Cập nhật naming, UI |
| `pages/projects.vue` | ✅ Thêm loading state |
| `pages/escalation.vue` | ✅ Thêm API calls |
| `stores/alerts.js` | ✅ Xóa mock data |
| `nuxt.config.ts` | ✅ Thêm runtimeConfig |
| `BACKEND_SETUP.md` | ✨ New - Hướng dẫn setup |
| `QUICKSTART.md` | ✨ New - Quick start |

---

## ✨ Lợi Ích

### Trước (Mock Data)
- ❌ Dữ liệu cứng nhắc
- ❌ Phải edit code để thay đổi
- ❌ Không đồng bộ với backend
- ❌ Không thể persist dữ liệu

### Sau (Real API)
- ✅ Dữ liệu động từ database
- ✅ CRUD qua UI
- ✅ Sync với backend thực
- ✅ Data persist trong MongoDB
- ✅ Có thể kiểm thử end-to-end
- ✅ Production-ready

---

## 🚀 Tiếp Theo

1. ✅ Xóa mock data
2. ✅ Kết nối API
3. ⚠️ **Cần làm**:
   - Thêm UI "Add Alert" button
   - Thêm Edit/Delete buttons
   - Thêm validation form
   - Thêm loading spinners
   - Thêm error handling
   - Thêm test cases

---

Đọc `QUICKSTART.md` để chạy ngay!
