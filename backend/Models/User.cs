using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AlertOpsBackend.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Name { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string PasswordHash { get; set; } = null!;

        public string Role { get; set; } = "Operator";

        public string? RefreshToken { get; set; }

        public DateTime? RefreshTokenExpiry { get; set; }

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;
    }
}