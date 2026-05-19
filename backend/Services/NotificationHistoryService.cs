using AlertOpsBackend.Models;
using Microsoft.Extensions.Logging;
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
                settings.NotificationHistoryCollectionName
                    ?? "NotificationHistory"
            );

            _emailService = emailService;
            _logger = logger;

            _logger.LogInformation(
                "NotificationHistoryService initialized. DB={Database}, Collection={Collection}",
                settings.DatabaseName,
                settings.NotificationHistoryCollectionName
            );
        }

        // ─────────────────────────────
        // GET BY ALERT ID
        // ─────────────────────────────
        public async Task<List<NotificationHistory>> GetByAlertIdAsync(string alertId)
        {
            return await _notifications
                .Find(n => n.AlertId == alertId)
                .SortByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        // ─────────────────────────────
        // GET BY PROJECT ID
        // ─────────────────────────────
        public async Task<List<NotificationHistory>> GetByProjectIdAsync(string projectId)
        {
            return await _notifications
                .Find(n => n.ProjectId == projectId)
                .SortByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        // ─────────────────────────────
        // GET BY ID
        // ─────────────────────────────
        public async Task<NotificationHistory?> GetAsync(string id)
        {
            return await _notifications
                .Find(n => n.Id == id)
                .FirstOrDefaultAsync();
        }

        // ─────────────────────────────
        // CREATE ONLY
        // ─────────────────────────────
        public async Task<NotificationHistory> CreateAsync(
            NotificationHistory notification)
        {
            try
            {
                notification.CreatedAt = DateTime.UtcNow;

                await _notifications.InsertOneAsync(notification);

                _logger.LogInformation(
                    "Notification created successfully. Id={Id}",
                    notification.Id
                );

                return notification;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "FAILED TO CREATE NotificationHistory"
                );

                throw;
            }
        }

        // ─────────────────────────────
        // SEND + RECORD NOTIFICATION
        // ─────────────────────────────
        public async Task<NotificationHistory> SendAndRecordAsync(
            string? alertId,
            string projectId,
            List<string> recipients,
            string subject,
            string body,
            string type = "manual",
            string channel = "email")
        {
            if (string.IsNullOrWhiteSpace(projectId))
            {
                throw new ArgumentException(
                    "ProjectId is required"
                );
            }

            if (recipients == null || !recipients.Any())
            {
                throw new ArgumentException(
                    "Recipients list cannot be empty"
                );
            }

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
                _logger.LogInformation(
                    "Sending notification to {Count} recipient(s)",
                    recipients.Count
                );

                var success = await _emailService.SendEmailAsync(
                    recipients,
                    subject,
                    body
                );

                if (success)
                {
                    notification.Status = "sent";
                    notification.SentAt = DateTime.UtcNow;

                    _logger.LogInformation(
                        "Email sent successfully"
                    );
                }
                else
                {
                    notification.Status = "failed";
                    notification.ErrorMessage =
                        "Email service returned false";

                    _logger.LogWarning(
                        "Email service returned false"
                    );
                }
            }
            catch (Exception ex)
            {
                notification.Status = "failed";
                notification.ErrorMessage = ex.Message;

                _logger.LogError(
                    ex,
                    "Exception while sending email"
                );
            }

            // SAVE TO MONGODB
            try
            {
                await _notifications.InsertOneAsync(notification);

                _logger.LogInformation(
                    "NotificationHistory saved successfully to MongoDB"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "FAILED TO SAVE NotificationHistory TO MONGODB"
                );

                throw;
            }

            return notification;
        }

        // ─────────────────────────────
        // UPDATE
        // ─────────────────────────────
        public async Task UpdateAsync(
            string id,
            NotificationHistory notification)
        {
            try
            {
                await _notifications.ReplaceOneAsync(
                    n => n.Id == id,
                    notification
                );

                _logger.LogInformation(
                    "Notification updated. Id={Id}",
                    id
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "FAILED TO UPDATE NotificationHistory"
                );

                throw;
            }
        }

        // ─────────────────────────────
        // DELETE
        // ─────────────────────────────
        public async Task RemoveAsync(string id)
        {
            try
            {
                await _notifications.DeleteOneAsync(
                    n => n.Id == id
                );

                _logger.LogInformation(
                    "Notification deleted. Id={Id}",
                    id
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "FAILED TO DELETE NotificationHistory"
                );

                throw;
            }
        }

        // ─────────────────────────────
        // GET RECENT
        // ─────────────────────────────
        public async Task<List<NotificationHistory>> GetRecentAsync(
            int limit = 20)
        {
            return await _notifications
                .Find(_ => true)
                .SortByDescending(n => n.CreatedAt)
                .Limit(limit)
                .ToListAsync();
        }

        // ─────────────────────────────
        // GET FAILED
        // ─────────────────────────────
        public async Task<List<NotificationHistory>> GetFailedAsync()
        {
            return await _notifications
                .Find(n => n.Status == "failed")
                .SortByDescending(n => n.CreatedAt)
                .ToListAsync();
        }
    }
}