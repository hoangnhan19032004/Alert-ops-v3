using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AlertOpsBackend.Models
{
    public class Project
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Sev { get; set; } = string.Empty;

        public string Desc { get; set; } = string.Empty;

        public string Owner { get; set; } = string.Empty;

        public List<string> Managers { get; set; } = new();

        public List<string> Members { get; set; } = new();

        public List<string> Avatars { get; set; } = new();

        public int AlertCount { get; set; }
    }
}