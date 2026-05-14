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

        public List<NotificationHistory> GetByAlertId(string alertId) =>
            _notifications.Find(n => n.AlertId == alertId)
                .SortByDescending(n => n.CreatedAt)
                .ToList();

        public List<NotificationHistory> GetByProjectId(string projectId) =>
            _notifications.Find(n => n.ProjectId == projectId)
                .SortByDescending(n => n.CreatedAt)
                .ToList();

        public NotificationHistory? Get(string id) =>
            _notifications.Find(n => n.Id == id).FirstOrDefault();

        public NotificationHistory Create(NotificationHistory notification)
        {
            notification.CreatedAt = DateTime.UtcNow;
            _notifications.InsertOne(notification);
            return notification;
        }

        public async Task<NotificationHistory> SendAndRecordAsync(
            string? alertId,
            string projectId,
            List<string> recipients,
            string subject,
            string body,
            string type = "manual",
            string channel = "email")
        {
            // Guard: cảnh báo rõ nếu alertId null thay vì log "(null)" khó hiểu
            if (string.IsNullOrEmpty(alertId))
                _logger.LogWarning("SendAndRecordAsync called with null/empty alertId for project {ProjectId}", projectId);

            var notification = new NotificationHistory
            {
                AlertId    = alertId,
                ProjectId  = projectId,
                Recipients = recipients,
                Subject    = subject,
                Body       = body,
                Type       = type,
                Channel    = channel,
                Status     = "pending",
                CreatedAt  = DateTime.UtcNow
            };

            try
            {
                var success = await _emailService.SendEmailAsync(recipients, subject, body);

                if (success)
                {
                    notification.Status = "sent";
                    notification.SentAt = DateTime.UtcNow;
                    _logger.LogInformation(
                        "Notification sent successfully for alert {AlertId}", alertId ?? "(no alertId)");
                }
                else
                {
                    notification.Status       = "failed";
                    notification.ErrorMessage = "Email service returned false";
                    _logger.LogWarning("Email send failed for alert {AlertId}", alertId ?? "(no alertId)");
                }
            }
            catch (Exception ex)
            {
                notification.Status       = "failed";
                notification.ErrorMessage = ex.Message;
                _logger.LogError(ex, "Exception sending notification for alert {AlertId}", alertId ?? "(no alertId)");
            }

            _notifications.InsertOne(notification);
            return notification;
        }

        public void Update(string id, NotificationHistory notificationIn) =>
            _notifications.ReplaceOne(n => n.Id == id, notificationIn);

        public void Remove(string id) =>
            _notifications.DeleteOne(n => n.Id == id);

        public List<NotificationHistory> GetRecent(int limit = 20) =>
            _notifications.Find(_ => true)
                .SortByDescending(n => n.CreatedAt)
                .Limit(limit)
                .ToList();

        public List<NotificationHistory> GetFailed() =>
            _notifications.Find(n => n.Status == "failed")
                .SortByDescending(n => n.CreatedAt)
                .ToList();
    }
}