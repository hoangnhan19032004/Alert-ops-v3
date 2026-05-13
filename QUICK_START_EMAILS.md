# 🚀 Quick Start - Email Notifications

## Installation & Setup (5 minutes)

### Step 1: Configure SMTP (Backend)

Edit `AlertOpsBackend_fixed/appsettings.json`:

```json
{
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUser": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "SenderEmail": "noreply@alertops.com",
    "SenderName": "AlertOps"
  }
}
```

**For Gmail:** Use [App Password](https://support.google.com/accounts/answer/185833)

### Step 2: Build Backend

```bash
cd AlertOpsBackend_fixed
dotnet build
dotnet run
```

Backend should start on `http://localhost:5000`

### Step 3: Start Frontend

```bash
npm run dev
```

Frontend should start on `http://localhost:3000`

---

## How to Use

### 1️⃣ View Alert Details

Navigate to a Project → Click an Alert to expand it

```
📌 Alert Row (Expanded)
├─ Alert Message & Severity
├─ Service & Environment info
└─ Action Buttons:
   ├─ "Gửi thông báo" (Send Notification)
   └─ "Xem lịch sử (X)" (View History)
```

### 2️⃣ Send Notification

1. Click **"Gửi thông báo"** button
2. Enter recipient emails (one per line or comma-separated)
3. Enter subject & message body
4. Click **"Gửi thông báo"**
5. See success toast notification

### 3️⃣ View Notification History

1. Click mail icon 📧 (or **"Xem lịch sử"** link)
2. See all notifications sent for this alert:
   - Status (✓ Đã gửi, ✗ Lỗi, ⏳ Chờ)
   - Recipients & timestamp
   - Type (Thủ công / Tự động)

---

## API Endpoints Reference

### Send Email for Alert

```bash
curl -X POST http://localhost:5000/api/notificationhistory/send \
  -H "Content-Type: application/json" \
  -d '{
    "alertId": "alert-123",
    "projectId": "project-456",
    "recipients": ["user@example.com", "admin@example.com"],
    "subject": "Critical Alert Notification",
    "body": "Alert has been triggered",
    "type": "manual",
    "channel": "email"
  }'
```

### Get Notification History

```bash
curl http://localhost:5000/api/notificationhistory/alert/alert-123
```

### Get Failed Notifications

```bash
curl http://localhost:5000/api/notificationhistory/failed
```

---

## Common Scenarios

### Scenario 1: Alert came in, need to notify team

```
1. Click Alert → "Gửi thông báo"
2. Add recipient emails: ops@company.com, manager@company.com
3. Type subject: "Action Required: Critical Database Error"
4. Type body: "Critical alert detected on production database..."
5. Click "Gửi thông báo"
6. ✓ Notifications sent and recorded
```

### Scenario 2: Check who was notified about an alert

```
1. Click Alert → Mail icon or "Xem lịch sử"
2. See list of all notifications:
   - Who received it
   - When it was sent
   - Status (success/failed)
```

### Scenario 3: Troubleshoot failed email

```
1. Check notification history
2. Click on failed notification
3. See error message (e.g., "Invalid SMTP credentials")
4. Fix SMTP config in appsettings.json
5. Restart backend
6. Retry sending
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Email not sending | Check SMTP credentials, test with `dotnet run` logs |
| Notification history empty | Ensure MongoDB is running, check firewall port 27017 |
| "Thất bại" status | Check email format, verify SMTP account active |
| UI not showing mail icon | Refresh browser, check browser console for errors |

---

## What's Next?

After testing basic functionality:

1. **Auto-Escalation** - Automatically send emails when alerts hit escalation rules
2. **Slack Integration** - Send to Slack channels instead of email
3. **Email Templates** - Pre-designed email templates for different alert types
4. **SLA Tracking** - Monitor acknowledgement & resolution times

See `WORKFLOW_IMPROVEMENTS.md` for detailed roadmap.

---

## Database Verification

To verify notifications are being saved:

```bash
# In MongoDB Compass or mongosh
db.notificationHistory.find({})

# Check recent notifications
db.notificationHistory.find({}).sort({createdAt: -1}).limit(5)

# Count by status
db.notificationHistory.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

Expected output:
```json
[
  { "_id": "sent", "count": 5 },
  { "_id": "failed", "count": 1 },
  { "_id": "pending", "count": 0 }
]
```

---

## Support

For issues or questions:
1. Check `EMAIL_SETUP.md` for detailed configuration
2. Check `WORKFLOW_IMPROVEMENTS.md` for architecture details
3. Review backend logs: `dotnet run` output
4. Check browser console: Right-click → Inspect → Console tab
