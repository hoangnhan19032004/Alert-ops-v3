using AlertOpsBackend.Models;
using MongoDB.Driver;

namespace AlertOpsBackend.Services
{
    public class NotificationHistoryService
    {
        private readonly IMongoCollection<NotificationHistory> _notifications;
        private readonly IEmailService _emailService;
        private readonly ILogger<NotificationHistoryService> _logger;

        public NotificationHistoryService(
            AlertOpsDatabaseSettings settings, 
            IEmailService emailService,
            ILogger<NotificationHistoryService> logger)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            _notifications = database.GetCollection<NotificationHistory>(
                settings.NotificationHistoryCollectionName ?? "notificationHistory");
            _emailService = emailService;
            _logger = logger;
        }

        // Get all notifications for an alert
        public List<NotificationHistory> GetByAlertId(string alertId) =>
            _notifications.Find(n => n.AlertId == alertId)
                .SortByDescending(n => n.CreatedAt)
                .ToList();

        // Get all notifications for a project
        public List<NotificationHistory> GetByProjectId(string projectId) =>
            _notifications.Find(n => n.ProjectId == projectId)
                .SortByDescending(n => n.CreatedAt)
                .ToList();

        // Get single notification
        public NotificationHistory? Get(string id) =>
            _notifications.Find(n => n.Id == id).FirstOrDefault();

        // Create new notification record (without sending)
        public NotificationHistory Create(NotificationHistory notification)
        {
            notification.CreatedAt = DateTime.UtcNow;
            _notifications.InsertOne(notification);
            return notification;
        }

        // Send email and save to history
        public async Task<NotificationHistory> SendAndRecordAsync(
            string? alertId, 
            string projectId,
            List<string> recipients, 
            string subject, 
            string body,
            string type = "manual",
            string channel = "email")
        {
            var notification = new NotificationHistory
            {
                AlertId = alertId,
                ProjectId = projectId,
                Recipients = recipients,
                Subject = subject,
                Body = body,
                Type = type,
                Channel = channel,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                // Send email
                var success = await _emailService.SendEmailAsync(recipients, subject, body);
                
                if (success)
                {
                    notification.Status = "sent";
                    notification.SentAt = DateTime.UtcNow;
                    _logger.LogInformation("Notification sent successfully for alert {alertId}", alertId);
                }
                else
                {
                    notification.Status = "failed";
                    notification.ErrorMessage = "Email service returned false";
                    _logger.LogWarning("Email send failed for alert {alertId}", alertId);
                }
            }
            catch (Exception ex)
            {
                notification.Status = "failed";
                notification.ErrorMessage = ex.Message;
                _logger.LogError(ex, "Exception sending notification for alert {alertId}", alertId);
            }

            // Save to database
            _notifications.InsertOne(notification);
            return notification;
        }

        // Update notification status
        public void Update(string id, NotificationHistory notificationIn) =>
            _notifications.ReplaceOne(n => n.Id == id, notificationIn);

        // Delete notification
        public void Remove(string id) =>
            _notifications.DeleteOne(n => n.Id == id);

        // Get recent notifications (for dashboard)
        public List<NotificationHistory> GetRecent(int limit = 20) =>
            _notifications.Find(_ => true)
                .SortByDescending(n => n.CreatedAt)
                .Limit(limit)
                .ToList();

        // Get failed notifications
        public List<NotificationHistory> GetFailed() =>
            _notifications.Find(n => n.Status == "failed")
                .SortByDescending(n => n.CreatedAt)
                .ToList();
    }
}
