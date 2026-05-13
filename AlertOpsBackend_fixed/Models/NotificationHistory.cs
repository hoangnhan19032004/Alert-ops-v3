using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AlertOpsBackend.Models
{
    public class NotificationHistory
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string AlertId { get; set; } = null!;
        public string ProjectId { get; set; } = null!;

        // Email info
        public List<string> Recipients { get; set; } = new();
        public string? Subject { get; set; }
        public string? Body { get; set; }
        
        // Channel: email, slack, teams, webhook, etc
        public string Channel { get; set; } = "email";
        
        // Type: auto (from escalation) or manual (user sent)
        public string Type { get; set; } = "manual";
        
        // Status: pending, sent, failed
        public string Status { get; set; } = "pending";
        public string? ErrorMessage { get; set; }
        
        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SentAt { get; set; }
    }
}
