namespace AlertOpsBackend.Models
{
    // Interface này để map với file appsettings.json -> Kết nối database
    public class AlertOpsDatabaseSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
        public string AlertsCollectionName { get; set; } = null!;
        public string ProjectsCollectionName { get; set; } = null!;
        public string EscalationRulesCollectionName { get; set; } = null!;
        public string NotificationHistoryCollectionName { get; set; } = "notificationHistory";
    }
}