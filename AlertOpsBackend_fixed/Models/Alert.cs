using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AlertOpsBackend.Models
{
    public class Alert
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string? ProjectId { get; set; }

        public string Message { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string Severity { get; set; } = null!;
        public string Service { get; set; } = null!;
        public string Env { get; set; } = null!;
        public string Time { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
