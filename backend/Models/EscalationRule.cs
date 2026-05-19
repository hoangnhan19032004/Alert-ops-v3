using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AlertOpsBackend.Models
{
    public class EscalationRule
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Project { get; set; } = null!;
        public string Trigger { get; set; } = null!;
        public string Delay { get; set; } = null!;
        public string Channel { get; set; } = null!;
        public bool Active { get; set; }
    }
}