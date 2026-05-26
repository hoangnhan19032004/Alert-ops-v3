namespace AlertOpsBackend.Models
{
    // Interface này để map với file appsettings.json -> Kết nối database
    public interface IAlertOpsDatabaseSettings
    {
        string ConnectionString { get; set; }
        string DatabaseName { get; set; }
        string AlertsCollectionName { get; set; }
        string ProjectsCollectionName { get; set; }
        string EscalationRulesCollectionName { get; set; }
    }
}