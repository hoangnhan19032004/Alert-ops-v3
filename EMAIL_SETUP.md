# 📧 Email & Notification History Setup

## Tổng Quan

Chức năng Email/Notification History cho phép gửi thông báo cho mỗi Alert và lưu lịch sử gửi.

### Features:
- ✅ Gửi email cho mỗi Alert (Thủ công hoặc tự động từ Escalation Rules)
- ✅ Lưu lịch sử email/notification trong MongoDB
- ✅ Xem lịch sử gửi email cho mỗi Alert
- ✅ Theo dõi trạng thái (Sent, Failed, Pending)
- ✅ Hỗ trợ SMTP (Gmail, Office 365, Custom SMTP)

---

## Backend Setup

### 1. **Models & Services Created**

**New Models:**
- `NotificationHistory.cs` - Lưu lịch sử email/notification

**New Services:**
- `EmailService.cs` - Gửi email qua SMTP
- `NotificationHistoryService.cs` - Quản lý notification history

**New Controllers:**
- `NotificationHistoryController.cs` - API endpoints

### 2. **Database Configuration**

Cập nhật `appsettings.json`:

```json
{
  "AlertOpsDatabase": {
    "NotificationHistoryCollectionName": "notificationHistory"
  },
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUser": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "SenderEmail": "noreply@alertops.com",
    "SenderName": "AlertOps Notifications"
  }
}
```

### 3. **SMTP Configuration Examples**

#### **Gmail**
```json
{
  "SmtpHost": "smtp.gmail.com",
  "SmtpPort": 587,
  "SmtpUser": "your-email@gmail.com",
  "SmtpPassword": "your-app-password",
  "SenderEmail": "your-email@gmail.com",
  "SenderName": "AlertOps"
}
```

**Lưu ý:** Dùng [App Password](https://support.google.com/accounts/answer/185833) thay vì password thường.

#### **Office 365**
```json
{
  "SmtpHost": "smtp.office365.com",
  "SmtpPort": 587,
  "SmtpUser": "your-email@company.com",
  "SmtpPassword": "your-password",
  "SenderEmail": "your-email@company.com",
  "SenderName": "AlertOps"
}
```

#### **SendGrid**
```json
{
  "SmtpHost": "smtp.sendgrid.net",
  "SmtpPort": 587,
  "SmtpUser": "apikey",
  "SmtpPassword": "SG.your-sendgrid-api-key",
  "SenderEmail": "noreply@company.com",
  "SenderName": "AlertOps"
}
```

---

## API Endpoints

### **Notification History API**

#### **1. Get notifications for an Alert**
```
GET /api/notificationhistory/alert/{alertId}
```

Response:
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "alertId": "507f1f77bcf86cd799439012",
    "projectId": "507f1f77bcf86cd799439013",
    "recipients": ["user@example.com"],
    "subject": "Alert Notification",
    "body": "Critical alert triggered",
    "channel": "email",
    "type": "manual",
    "status": "sent",
    "createdAt": "2026-05-08T10:00:00Z",
    "sentAt": "2026-05-08T10:00:05Z"
  }
]
```

#### **2. Get all notifications for a Project**
```
GET /api/notificationhistory/project/{projectId}
```

#### **3. Send notification for an Alert**
```
POST /api/notificationhistory/send

Body:
{
  "alertId": "507f1f77bcf86cd799439012",
  "projectId": "507f1f77bcf86cd799439013",
  "recipients": ["user@example.com", "admin@example.com"],
  "subject": "Alert: Critical Error Detected",
  "body": "<h1>Alert Notification</h1><p>Critical alert has been triggered...</p>",
  "type": "manual",
  "channel": "email"
}
```

Response: `201 Created` with NotificationHistory object

#### **4. Get recent notifications**
```
GET /api/notificationhistory/recent?limit=20
```

#### **5. Get failed notifications**
```
GET /api/notificationhistory/failed
```

---

## Frontend Usage

### **Components Updated**

**File:** `pages/projects/[id].vue`

#### **Alert Row - New Actions**
- Mail icon button với notification count
- Click để xem lịch sử thông báo
- Expand để xem chi tiết alert và gửi notification

#### **New Modals**
1. **Alert Notifications Modal** - Xem lịch sử gửi email
2. **Send Alert Notification Modal** - Gửi email mới

#### **Composable**
```typescript
// composables/useNotificationHistory.ts

const { 
  notificationHistory,
  loading,
  sending,
  loadByAlertId,
  sendNotification,
  loadRecent,
  loadFailed
} = useNotificationHistory()
```

---

## Testing

### **1. Manual Test via UI**
1. Vào Project Details
2. Click expand alert
3. Click "Gửi thông báo"
4. Nhập recipient emails
5. Nhập subject & body
6. Click "Gửi thông báo"
7. Xem notification history

### **2. Test via API (Postman)**
```bash
# Send notification
POST http://localhost:5000/api/notificationhistory/send
Content-Type: application/json

{
  "alertId": "alert-id-here",
  "projectId": "project-id-here",
  "recipients": ["test@example.com"],
  "subject": "Test Alert",
  "body": "This is a test notification",
  "type": "manual",
  "channel": "email"
}

# Get notifications for alert
GET http://localhost:5000/api/notificationhistory/alert/alert-id-here
```

---

## Alert Workflow & Escalation Rules

### **Current Workflow**

```
1. Alert Created
   ├─ Manual notification (User gửi từ UI)
   └─ Auto notification (From Escalation Rules)

2. Escalation Rule Triggers
   ├─ Based on severity/status
   └─ Auto-send notification to escalation channel

3. Notification Saved to DB
   ├─ Sent: Email gửi thành công
   ├─ Failed: Email gửi thất bại
   └─ Pending: Đang chờ gửi
```

### **Escalation Rule Enhancement** (Sắp có)

Để thêm auto-notification từ escalation rules:

1. Update `EscalationRule` model thêm `notificationRecipients`
2. Update `AlertsController` POST method gọi escalation rules
3. Nếu rule trigger → auto-send notification

Example:
```json
{
  "project": "project-id",
  "trigger": "critical",
  "delay": "5m",
  "channel": "email",
  "notificationRecipients": ["ops@company.com", "manager@company.com"],
  "active": true
}
```

---

## Production Deployment Checklist

- [ ] Set real SMTP credentials trong `appsettings.json`
- [ ] Test email sending trong production environment
- [ ] Set up email retry logic cho failed notifications
- [ ] Monitor notification delivery rate
- [ ] Set up alerts cho failed notifications
- [ ] Backup notification history regularly

---

## Troubleshooting

### **Email không gửi được**
1. Kiểm tra SMTP credentials
2. Kiểm tra firewall (port 587/465)
3. Kiểm tra app logs
4. Test SMTP connection: `telnet smtp.gmail.com 587`

### **Notification history không xuất hiện**
1. Kiểm tra MongoDB connection
2. Kiểm tra collection `notificationHistory` tồn tại
3. Kiểm tra notification status (có thể là "failed")

### **Nhận được HTML lạ trong email**
- Body được gửi as-is, nên cần format HTML đúng
- Hoặc send plain text (không HTML)

---

## Future Enhancements

- [ ] Support cho Slack, Teams, Webhook
- [ ] Email templates
- [ ] Notification scheduling
- [ ] Batch notifications
- [ ] Notification preferences per user
- [ ] Unsubscribe link
- [ ] Retry policy for failed notifications
