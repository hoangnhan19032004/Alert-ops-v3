using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AlertOpsBackend.Models
{
    [BsonIgnoreExtraElements]
    public class NotificationHistory
    {
        // Mongo ObjectId
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        // Optional alert reference
        [BsonIgnoreIfNull]
        public string? AlertId { get; set; }

        // Required project reference
        [BsonRequired]
        public string ProjectId { get; set; } = string.Empty;

        // Email recipients
        [BsonRequired]
        public List<string> Recipients { get; set; } = new();

        // Email content
        [BsonIgnoreIfNull]
        public string? Subject { get; set; }

        [BsonIgnoreIfNull]
        public string? Body { get; set; }

        // email, slack, teams, webhook...
        public string Channel { get; set; } = "email";

        // manual / auto
        public string Type { get; set; } = "manual";

        // pending / sent / failed
        public string Status { get; set; } = "pending";

        // SMTP or processing error
        [BsonIgnoreIfNull]
        public string? ErrorMessage { get; set; }

        // Created timestamp
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Sent timestamp
        [BsonIgnoreIfNull]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? SentAt { get; set; }
    }
}