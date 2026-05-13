# 🔍 Alert Workflow & Escalation Rules - Analysis & Improvements

## Current State Analysis

### **1. Alert Workflow**

#### Current Flow:
```
Create Alert
  ├─ Status: Open
  ├─ Severity: Critical/Error/Warning/Resolved
  └─ Saved to MongoDB

Update Alert Status
  ├─ Open → Acknowledged → Escalated → Resolved
  └─ Emit SignalR notification to all clients

Delete Alert
  └─ Remove from database & notify
```

#### Issues Found:
❌ Không có timestamp tracking cho status changes
❌ Không có history của status transitions
❌ Không có assignment to users/teams
❌ Không có SLA tracking
❌ Không có auto-resolution based on conditions

---

### **2. Escalation Rules**

#### Current Model:
```csharp
public class EscalationRule
{
  public string Project { get; set; }      // Which project
  public string Trigger { get; set; }      // critical, error, warning
  public string Delay { get; set; }        // 5m, 10m, 1h
  public string Channel { get; set; }      // email, slack, webhook
  public bool Active { get; set; }
}
```

#### Issues Found:
❌ Delay field is string (should be TimeSpan)
❌ No recipients specified
❌ No action templates
❌ No condition support (AND/OR logic)
❌ Not integrated with notification system
❌ Manual trigger not implemented

---

## Proposed Improvements

### **Phase 1: Alert Status History** (Quick Win)

#### 1.1 New Model: `AlertStatusHistory`
```csharp
public class AlertStatusHistory
{
  public string Id { get; set; }
  public string AlertId { get; set; }
  public string OldStatus { get; set; }
  public string NewStatus { get; set; }
  public string ChangedBy { get; set; }      // User ID or "system"
  public string Reason { get; set; }
  public DateTime ChangedAt { get; set; }
}
```

#### 1.2 Service: `AlertStatusHistoryService`
```csharp
public class AlertStatusHistoryService
{
  public void RecordStatusChange(string alertId, string oldStatus, string newStatus, string changedBy, string reason)
  public List<AlertStatusHistory> GetHistory(string alertId)
  public List<AlertStatusHistory> GetTodayChanges()
}
```

#### 1.3 Update Alert Model
```csharp
public class Alert
{
  // Existing fields...
  
  // NEW:
  public string? AssignedTo { get; set; }       // User ID or Team ID
  public DateTime? AcknowledgedAt { get; set; }
  public DateTime? ResolvedAt { get; set; }
  public List<string> Tags { get; set; } = new();
  public Dictionary<string, string> CustomFields { get; set; } = new();
}
```

#### 1.4 Update AlertsController
```csharp
[HttpPatch("{id:length(24)}/status")]
public async Task<IActionResult> PatchStatus(string id, [FromBody] StatusChangeRequest req)
{
  // Record old status
  var oldAlert = _alertService.Get(id);
  
  // Update status
  alert.Status = req.Status;
  if (req.Status == "Acknowledged") alert.AcknowledgedAt = DateTime.UtcNow;
  if (req.Status == "Resolved") alert.ResolvedAt = DateTime.UtcNow;
  
  _alertService.Update(id, alert);
  
  // Record status change
  _statusHistoryService.RecordStatusChange(
    id, 
    oldAlert.Status, 
    req.Status,
    req.ChangedBy ?? "system",
    req.Reason
  );
  
  // Trigger escalation rules
  await _escalationService.CheckAndExecuteRules(alert);
  
  return Ok(alert);
}
```

---

### **Phase 2: Enhanced Escalation Rules** (Mid-term)

#### 2.1 New Escalation Model
```csharp
public class EscalationRule
{
  public string Id { get; set; }
  public string ProjectId { get; set; }
  public string Name { get; set; }
  
  // Conditions (ALL must match to trigger)
  public List<EscalationCondition> Conditions { get; set; }
  
  // Actions
  public List<EscalationAction> Actions { get; set; }
  
  public int Priority { get; set; }        // Execute order
  public bool Active { get; set; }
  public DateTime CreatedAt { get; set; }
}

public class EscalationCondition
{
  public string Field { get; set; }        // severity, status, ageMinutes, etc
  public string Operator { get; set; }     // equals, greaterThan, contains, etc
  public string Value { get; set; }
}

public class EscalationAction
{
  public string Type { get; set; }         // notify, assign, changeStatus, etc
  public string Target { get; set; }       // Email, User ID, Team ID
  public string Template { get; set; }     // Message template
}
```

#### 2.2 Example Escalation Rule
```json
{
  "name": "Critical Alert Escalation",
  "projectId": "project-123",
  "priority": 1,
  "conditions": [
    {
      "field": "severity",
      "operator": "equals",
      "value": "Critical"
    },
    {
      "field": "ageMinutes",
      "operator": "greaterThan",
      "value": "5"
    }
  ],
  "actions": [
    {
      "type": "notify",
      "target": "ops-team@company.com",
      "template": "critical-alert-template"
    },
    {
      "type": "assign",
      "target": "user-123"
    },
    {
      "type": "changeStatus",
      "target": "Escalated"
    }
  ],
  "active": true
}
```

#### 2.3 EscalationService Implementation
```csharp
public class EscalationService
{
  public async Task CheckAndExecuteRules(Alert alert)
  {
    var rules = _ruleService.GetActiveRulesForProject(alert.ProjectId)
      .OrderBy(r => r.Priority);
    
    foreach (var rule in rules)
    {
      if (await MatchesConditions(alert, rule.Conditions))
      {
        await ExecuteActions(alert, rule.Actions);
      }
    }
  }
  
  private async Task<bool> MatchesConditions(Alert alert, List<EscalationCondition> conditions)
  {
    return conditions.All(c => EvaluateCondition(alert, c));
  }
  
  private bool EvaluateCondition(Alert alert, EscalationCondition condition)
  {
    return condition.Field switch
    {
      "severity" => EvaluateOperator(alert.Severity, condition.Operator, condition.Value),
      "status" => EvaluateOperator(alert.Status, condition.Operator, condition.Value),
      "ageMinutes" => EvaluateOperator(
        (DateTime.UtcNow - alert.CreatedAt).TotalMinutes.ToString(),
        condition.Operator,
        condition.Value
      ),
      _ => false
    };
  }
  
  private async Task ExecuteActions(Alert alert, List<EscalationAction> actions)
  {
    foreach (var action in actions)
    {
      switch (action.Type)
      {
        case "notify":
          await _notificationService.SendAndRecordAsync(
            alert.Id,
            alert.ProjectId,
            new List<string> { action.Target },
            "Alert Escalation",
            $"Alert {alert.Id} requires attention",
            "auto"
          );
          break;
          
        case "assign":
          alert.AssignedTo = action.Target;
          _alertService.Update(alert.Id, alert);
          break;
          
        case "changeStatus":
          alert.Status = action.Target;
          _alertService.Update(alert.Id, alert);
          break;
      }
    }
  }
}
```

---

### **Phase 3: Project Management & SLA** (Long-term)

#### 3.1 Project Model Enhancement
```csharp
public class Project
{
  // Existing...
  
  // NEW - SLA Settings
  public int? AcknowledgementSLAMinutes { get; set; }    // Must ack within X min
  public int? ResolutionSLAMinutes { get; set; }         // Must resolve within X min
  
  // Auto-escalation
  public bool AutoEscalateOnSLAViolation { get; set; }
  public string? SLAViolationEscalationRuleId { get; set; }
}
```

#### 3.2 SLA Monitoring Service
```csharp
public class SLAService
{
  public async Task CheckSLAViolations()
  {
    // Run every minute
    var projects = _projectService.GetAll();
    
    foreach (var project in projects)
    {
      var alerts = _alertService.GetByProject(project.Id);
      
      foreach (var alert in alerts.Where(a => a.Status != "Resolved"))
      {
        // Check acknowledgement SLA
        if (project.AcknowledgementSLAMinutes.HasValue &&
            alert.AcknowledgedAt == null &&
            (DateTime.UtcNow - alert.CreatedAt).TotalMinutes > project.AcknowledgementSLAMinutes)
        {
          await OnAckSLAViolation(alert, project);
        }
        
        // Check resolution SLA
        if (project.ResolutionSLAMinutes.HasValue &&
            (DateTime.UtcNow - alert.CreatedAt).TotalMinutes > project.ResolutionSLAMinutes)
        {
          await OnResolutionSLAViolation(alert, project);
        }
      }
    }
  }
}
```

---

## Implementation Priority

### **Must Have (v1)**
1. ✅ Email/Notification History (Done)
2. Alert Status History tracking
3. Proper Escalation Rule model
4. Escalation rule execution

### **Should Have (v2)**
1. SLA monitoring
2. Alert assignment
3. Auto-escalation on SLA violation
4. Advanced condition support

### **Nice to Have (v3)**
1. Webhook integration
2. Slack/Teams integration
3. Email templates
4. Bulk operations

---

## Testing Plan

### **Phase 1 Tests**
```csharp
[Test]
public void TestAlertStatusHistoryRecording()
{
  var alertId = "test-alert-123";
  var alert = new Alert { Id = alertId, Status = "Open" };
  
  _alertService.Update(alertId, alert with { Status = "Acknowledged" });
  
  var history = _statusHistoryService.GetHistory(alertId);
  
  Assert.AreEqual(1, history.Count);
  Assert.AreEqual("Open", history[0].OldStatus);
  Assert.AreEqual("Acknowledged", history[0].NewStatus);
}

[Test]
public async Task TestEscalationRuleExecution()
{
  var alert = new Alert 
  { 
    ProjectId = "proj-1",
    Severity = "Critical",
    Status = "Open",
    CreatedAt = DateTime.UtcNow.AddMinutes(-10)
  };
  
  var rule = new EscalationRule
  {
    Conditions = new[] { new EscalationCondition { Field = "severity", Operator = "equals", Value = "Critical" } },
    Actions = new[] { new EscalationAction { Type = "notify", Target = "ops@company.com" } }
  };
  
  await _escalationService.CheckAndExecuteRules(alert);
  
  // Verify notification was sent
  var notifications = _notificationService.GetByAlertId(alert.Id);
  Assert.AreEqual(1, notifications.Count);
  Assert.AreEqual("ops@company.com", notifications[0].Recipients[0]);
}
```

---

## Database Schema Updates

### Migration SQL (MongoDB style)

```javascript
// Create indexes
db.notificationHistory.createIndex({ "alertId": 1 })
db.notificationHistory.createIndex({ "projectId": 1 })
db.notificationHistory.createIndex({ "status": 1 })
db.notificationHistory.createIndex({ "createdAt": -1 })

// Add fields to existing alerts
db.Alerts.updateMany({}, {
  $set: {
    "tags": [],
    "customFields": {},
    "assignedTo": null,
    "acknowledgedAt": null,
    "resolvedAt": null
  }
})

// Create alert status history collection
db.createCollection("AlertStatusHistory")
db.AlertStatusHistory.createIndex({ "alertId": 1 })
db.AlertStatusHistory.createIndex({ "changedAt": -1 })

// Create enhanced escalation rules collection
db.createCollection("EscalationRulesV2")
db.EscalationRulesV2.createIndex({ "projectId": 1 })
db.EscalationRulesV2.createIndex({ "priority": 1 })
```

---

## Deployment Notes

1. **Backward Compatibility**: Keep old EscalationRule model, add migration path
2. **Database**: Run migration script before deployment
3. **Feature Flags**: Use feature flags for gradual rollout
4. **Monitoring**: Monitor escalation rule execution and failures

---

## Documentation to Create

- [ ] API documentation for new endpoints
- [ ] User guide for escalation rules
- [ ] Administrator guide for SLA setup
- [ ] Troubleshooting guide
- [ ] Performance tuning guide
