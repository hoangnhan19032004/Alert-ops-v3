# 🏗️ System Architecture - Email Notifications

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Nuxt 3)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  pages/projects/[id].vue                                        │
│  ├─ Alert List                                                  │
│  ├─ Alert Expanded View (NEW)                                  │
│  │  ├─ Send Notification Button (NEW)                          │
│  │  └─ View History Button (NEW)                               │
│  │                                                               │
│  └─ Modals (NEW)                                                │
│     ├─ Send Alert Notification Modal                           │
│     └─ View Alert Notifications Modal                          │
│                                                                  │
│  composables/useNotificationHistory.ts (NEW)                   │
│  └─ API calls to notification endpoints                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                    REST API over HTTP
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Backend (.NET 10 / ASP.NET Core)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Controllers                                                    │
│  ├─ AlertsController (existing)                                │
│  ├─ ProjectsController (existing)                              │
│  ├─ EscalationRulesController (existing)                       │
│  └─ NotificationHistoryController (NEW)                        │
│     ├─ GET /api/notificationhistory/alert/{id}                │
│     ├─ GET /api/notificationhistory/project/{id}              │
│     ├─ GET /api/notificationhistory/recent                    │
│     ├─ GET /api/notificationhistory/failed                    │
│     ├─ POST /api/notificationhistory/send (NEW)               │
│     └─ DELETE /api/notificationhistory/{id}                   │
│                                                                  │
│  Services                                                       │
│  ├─ AlertService (existing)                                    │
│  ├─ ProjectService (existing)                                  │
│  ├─ EscalationRuleService (existing)                           │
│  ├─ EmailService (NEW) ◄─────────────────┐                    │
│  │  └─ SendEmailAsync() via SMTP        │                     │
│  │                                        │                     │
│  ├─ NotificationService (existing)       │                     │
│  │  └─ SignalR notifications            │                     │
│  │                                        │                     │
│  └─ NotificationHistoryService (NEW)     │                     │
│     └─ Database operations               │                     │
│                                           │                     │
└───────────────────────────────────────────┼─────────────────────┘
                                            │
                                   SMTP Protocol
                                            │
                                            ▼
                        ┌────────────────────────────┐
                        │      SMTP Server           │
                        │  (Gmail/Office365/SendGrid)│
                        └────────────────────────────┘
                                            │
                                   Send Email (SMTP)
                                            │
                                            ▼
                        ┌────────────────────────────┐
                        │    Email Recipients        │
                        │ (user@example.com)         │
                        └────────────────────────────┘

            MongoDB Connection
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MongoDB Atlas                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Database: AlertOpsDB                                          │
│  ├─ Collection: Alerts (existing)                              │
│  ├─ Collection: Projects (existing)                            │
│  ├─ Collection: EscalationRules (existing)                     │
│  └─ Collection: notificationHistory (NEW)                      │
│     ├─ Document: NotificationHistory                           │
│     │  ├─ id (ObjectId)                                        │
│     │  ├─ alertId (string)                                     │
│     │  ├─ projectId (string)                                   │
│     │  ├─ recipients (array of emails)                         │
│     │  ├─ subject (string)                                     │
│     │  ├─ body (string)                                        │
│     │  ├─ channel (email/slack/teams)                          │
│     │  ├─ type (manual/auto)                                   │
│     │  ├─ status (pending/sent/failed)                         │
│     │  ├─ errorMessage (string, optional)                      │
│     │  ├─ createdAt (DateTime)                                 │
│     │  └─ sentAt (DateTime, optional)                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Scenario 1: User Sends Manual Notification

```
┌──────────────────────────────────────────────────────────────────┐
│ Frontend (Nuxt)                                                  │
│                                                                  │
│ 1. User clicks "Gửi thông báo" on Alert                        │
│    └─ Open Send Notification Modal                             │
│                                                                  │
│ 2. User fills:                                                  │
│    ├─ Recipients: ["ops@company.com"]                          │
│    ├─ Subject: "Action Required"                               │
│    └─ Body: "Please check..."                                  │
│                                                                  │
│ 3. User clicks "Gửi thông báo"                                 │
│    └─ Call useNotificationHistory.sendNotification()           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
            POST /api/notificationhistory/send
            {
              "alertId": "alert-123",
              "projectId": "proj-456",
              "recipients": ["ops@company.com"],
              "subject": "Action Required",
              "body": "Please check...",
              "type": "manual",
              "channel": "email"
            }
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ Backend (.NET)                                                   │
│                                                                  │
│ NotificationHistoryController.SendNotification()               │
│ 1. Validate request data                                        │
│ 2. Call NotificationHistoryService.SendAndRecordAsync()        │
│                                                                  │
│    ├─ Create NotificationHistory object                        │
│    │  └─ Status: "pending"                                     │
│    │                                                             │
│    ├─ Call EmailService.SendEmailAsync()                       │
│    │  ├─ Connect to SMTP server                                │
│    │  ├─ Build email message                                   │
│    │  └─ Send email                                            │
│    │                                                             │
│    ├─ Update status based on result                            │
│    │  ├─ Success: Status = "sent", SentAt = now               │
│    │  └─ Error: Status = "failed", ErrorMessage = error       │
│    │                                                             │
│    └─ Save to MongoDB notificationHistory collection          │
│                                                                  │
│ 3. Return NotificationHistory object (201 Created)             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ Frontend (Nuxt)                                                  │
│                                                                  │
│ 1. Receive response with NotificationHistory                   │
│ 2. Add to notificationHistory array                            │
│ 3. Show success toast: "Gửi thông báo thành công"             │
│ 4. Close modal                                                  │
│ 5. Reload notification history                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Scenario 2: View Notification History

```
┌──────────────────────────────────────────────────────────────────┐
│ Frontend (Nuxt)                                                  │
│                                                                  │
│ 1. User clicks mail icon on Alert                              │
│    └─ Call loadNotificationsByAlertId(alertId)                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
            GET /api/notificationhistory/alert/alert-123
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ Backend (.NET)                                                   │
│                                                                  │
│ NotificationHistoryController.GetByAlertId()                   │
│ 1. Query MongoDB: notificationHistory.find({alertId: ...})     │
│ 2. Sort by createdAt descending                                │
│ 3. Return List<NotificationHistory>                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ Response                                                         │
│                                                                  │
│ [                                                               │
│   {                                                             │
│     "id": "507f1f...",                                        │
│     "alertId": "alert-123",                                   │
│     "recipients": ["ops@company.com"],                        │
│     "subject": "Action Required",                             │
│     "status": "sent",                                         │
│     "sentAt": "2026-05-08T10:00:05Z"                         │
│   }                                                            │
│ ]                                                              │
│                                                                 │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ Frontend (Nuxt)                                                  │
│                                                                  │
│ 1. Update currentAlertNotifications state                       │
│ 2. Open "Alert Notifications Modal"                            │
│ 3. Display list of notifications:                              │
│    ├─ Subject, Recipients, Status                              │
│    ├─ Type (Manual/Auto), Timestamp                            │
│    └─ Error message (if failed)                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Relationships

```
pages/projects/[id].vue
├─ useErrorStore()
│  └─ Get alerts for project
│
├─ useNotificationHistory() (NEW)
│  ├─ loadByAlertId()
│  ├─ sendNotification()
│  ├─ loadRecent()
│  └─ loadFailed()
│
├─ Computed: projectAlerts
│  └─ Filter alerts by projectId
│
└─ State
   ├─ expandedAlertId (NEW)
   ├─ currentAlertId (NEW)
   ├─ showAlertNotificationsModal (NEW)
   ├─ showSendAlertNotificationModal (NEW)
   ├─ alertNotificationForm (NEW)
   └─ notificationCountByAlert (NEW)
```

---

## Database Indexes

```javascript
// Recommended MongoDB indexes for performance

db.notificationHistory.createIndex({ "alertId": 1 })
db.notificationHistory.createIndex({ "projectId": 1 })
db.notificationHistory.createIndex({ "status": 1 })
db.notificationHistory.createIndex({ "createdAt": -1 })
db.notificationHistory.createIndex({ "alertId": 1, "status": 1 })

// For faster queries in future
db.notificationHistory.createIndex({ 
  "projectId": 1, 
  "createdAt": -1 
})
```

---

## Configuration Flow

```
appsettings.json
└─ EmailSettings
   ├─ SmtpHost: "smtp.gmail.com"
   ├─ SmtpPort: 587
   ├─ SmtpUser: "email@gmail.com"
   ├─ SmtpPassword: "app-password"
   ├─ SenderEmail: "noreply@alertops.com"
   └─ SenderName: "AlertOps"
        │
        ▼
Program.cs
└─ Configuration.GetSection("EmailSettings")
   └─ IConfiguration injected into EmailService
      │
      ▼
EmailService
└─ SmtpClient(host, port)
   ├─ Credentials: (user, password)
   ├─ EnableSsl: true
   └─ SendMailAsync(mailMessage)
      │
      ▼
SMTP Server (Gmail/Office365/SendGrid)
```

---

## Error Handling Flow

```
Frontend (User sends notification)
        │
        ▼
API Call (POST /send)
        │
        ├─ Validation Error
        │  └─ Response: 400 Bad Request
        │     └─ Frontend: Show error toast
        │
        ├─ SMTP Error
        │  └─ EmailService catches exception
        │     └─ Set status: "failed", errorMessage
        │        └─ Save to DB for audit
        │           └─ Frontend: Show error toast
        │
        └─ Success
           └─ Status: "sent", SentAt = now
              └─ Response: 201 Created
                 └─ Frontend: Show success toast
```

---

## Security Considerations

1. **SMTP Credentials**
   - Store in environment variables for production
   - Use app-specific passwords (Gmail)
   - Rotate credentials regularly

2. **Email Validation**
   - Frontend: Basic regex validation
   - Backend: Secondary validation before sending
   - Prevent email injection attacks

3. **Rate Limiting**
   - Implement rate limiting on POST /send endpoint
   - Max X emails per hour per alert
   - Track sending patterns

4. **Audit Trail**
   - All notifications logged to DB
   - Records who sent what and when
   - Error messages preserved for debugging

---

## Performance Metrics

Expected performance:
- **Email send time**: 0.5-2 seconds (depends on SMTP server)
- **Database insert**: ~5-10ms per record
- **API response time**: 1-3 seconds (for send operation)
- **History retrieval**: ~50-100ms for typical projects
- **Throughput**: ~50-100 emails/minute (single instance)

For scaling beyond 100 emails/min:
- Implement queue system (RabbitMQ/Redis)
- Async background jobs
- Batch email sending
