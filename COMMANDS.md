# ⚡ COMMANDS - Copy & Paste để Chạy

## MongoDB Started ✅

### Windows (Command Prompt)
```cmd
mongod
```

### Windows (PowerShell)
```powershell
Start-Process mongod
```

### macOS
```bash
brew services start mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
sudo systemctl start mongod
```

---

## Backend Started ⚙️

### Từ project root hoặc backend folder

```bash
cd backend/AlertOpsBackend
dotnet run
```

**Expected Output**:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

---

## Frontend Started 🎨

### Từ project root

```bash
npm run dev
```

**Expected Output**:
```
  ➜ Local:    http://localhost:3000
  ➜ Network:  use --host to expose
```

---

## Add Test Data 📊

### Terminal mới (khi Backend & Frontend đang chạy)

```bash
mongosh
```

```javascript
// Chọn database
use AlertOpsDB

// Thêm alerts
db.alerts.insertMany([
  {
    message: "Database connection timeout",
    service: "payment-api",
    severity: "Critical",
    status: "Open",
    env: "Production",
    createdAt: new Date()
  },
  {
    message: "Memory usage high",
    service: "notification-service",
    severity: "Warning",
    status: "Acknowledged",
    env: "Production",
    createdAt: new Date()
  }
])

// Thêm projects
db.projects.insertMany([
  {
    name: "payment-api",
    desc: "Payment processing system",
    sev: "Critical",
    alertCount: 1
  },
  {
    name: "notification-service",
    desc: "Email and SMS notifications",
    sev: "Warning",
    alertCount: 1
  }
])

// Thêm escalation rules
db.escalationrules.insertMany([
  {
    project: "payment-api",
    trigger: "critical",
    delay: "5 min",
    channel: "Email + Slack",
    active: true
  }
])

// Kiểm tra
db.alerts.find()
db.projects.find()
db.escalationrules.find()

// Thoát
exit
```

---

## Open in Browser 🌐

| Trang | URL |
|-------|-----|
| **Home** | http://localhost:3000 |
| **Alerts** | http://localhost:3000/alerts |
| **Projects** | http://localhost:3000/projects |
| **Escalation** | http://localhost:3000/escalation |
| **API Swagger** | http://localhost:5000/swagger |

---

## Stop Services 🛑

### Graceful Stop

```bash
# Terminal 1: Ctrl+C (MongoDB)
# Terminal 2: Ctrl+C (Backend)
# Terminal 3: Ctrl+C (Frontend)
```

### Or Force Kill (Windows)

```cmd
taskkill /F /IM mongod.exe
taskkill /F /IM dotnet.exe
```

### Or Force Kill (macOS/Linux)

```bash
killall mongod
killall dotnet
```

---

## Environment Variables 🔧

### Set API URL (if not localhost:5000)

**Windows (Command Prompt)**:
```cmd
set NUXT_PUBLIC_API_BASE=http://your-backend-server:5000
npm run dev
```

**Windows (PowerShell)**:
```powershell
$env:NUXT_PUBLIC_API_BASE = "http://your-backend-server:5000"
npm run dev
```

**macOS/Linux**:
```bash
export NUXT_PUBLIC_API_BASE=http://your-backend-server:5000
npm run dev
```

---

## Common Issues 🐛

### MongoDB Won't Start

```bash
# Check if already running
mongosh

# Kill existing process and restart
# Windows
taskkill /F /IM mongod.exe
mongod

# macOS
brew services stop mongodb-community
brew services start mongodb-community

# Linux
sudo systemctl restart mongod
```

### Backend Connection Error

```bash
# Check .NET SDK
dotnet --version

# Clean build
cd backend/AlertOpsBackend
dotnet clean
dotnet build
dotnet run
```

### Frontend "API Not Responding"

1. Verify backend running: http://localhost:5000/swagger
2. Check console errors: F12 → Console
3. Verify API URL: Should be http://localhost:5000
4. Restart frontend: Ctrl+C, then `npm run dev`

### Port Already in Use

**Port 3000** (Frontend):
```bash
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# Kill and retry
npm run dev
```

**Port 5000** (Backend):
```bash
# Windows
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :5000

# Kill process or start on different port
# Edit backend to use different port in launchSettings.json
```

---

## Check Status ✓

### Is MongoDB running?
```bash
mongosh
# If connects, MongoDB is OK
exit
```

### Is Backend running?
```bash
# Browser or curl
http://localhost:5000/swagger

# Or curl
curl http://localhost:5000/api/alerts
```

### Is Frontend running?
```bash
# Browser
http://localhost:3000

# Should load without errors
```

### Is Data loaded?
```bash
# Check Alerts page
http://localhost:3000/alerts
# Should show "API Connected" badge (green)
# Should show alerts from MongoDB
```

---

## Complete Setup Flow

```
1. mongod                           ← Terminal 1
2. cd backend/AlertOpsBackend       ← Terminal 2
3. dotnet run
4. npm run dev                      ← Terminal 3 (from root)
5. Open http://localhost:3000       ← Browser
6. mongosh + Add test data          ← Terminal 4 (optional)
7. Refresh browser                  ← See data loaded!
```

---

## More Info

- Setup Guide: [BACKEND_SETUP.md](./BACKEND_SETUP.md)
- Technical Details: [MIGRATION_NOTES.md](./MIGRATION_NOTES.md)
- Quick Start: [QUICKSTART.md](./QUICKSTART.md)

---

**You're ready! 🚀**
