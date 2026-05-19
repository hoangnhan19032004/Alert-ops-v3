using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace AlertOpsBackend.Models
{
    public class ProjectMember
    {
        public string  Id     { get; set; } = string.Empty;
        public string  Name   { get; set; } = string.Empty;
        public string  Email  { get; set; } = string.Empty;
        public string  Role   { get; set; } = string.Empty;
        public string? Avatar { get; set; }
    }

    public class Project
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Sev  { get; set; } = string.Empty;
        public string Desc { get; set; } = string.Empty;

        [BsonElement("Owner")]
        [JsonIgnore]
        public BsonValue? OwnerRaw { get; set; }

        [BsonIgnore]
        public ProjectMember? Owner
        {
            get => NormalizeMember(OwnerRaw, "Owner");
            set => OwnerRaw = MemberToBsonValue(value);
        }

        [BsonElement("Managers")]
        [JsonIgnore]
        public BsonArray ManagersRaw { get; set; } = new();

        [BsonIgnore]
        public List<ProjectMember> Managers
        {
            get => NormalizeMembers(ManagersRaw, "Manager").ToList();
            set => ManagersRaw = MembersToBsonArray(value);
        }

        [BsonElement("Members")]
        [JsonIgnore]
        public BsonArray MembersRaw { get; set; } = new();

        [BsonIgnore]
        public List<ProjectMember> Members
        {
            get => NormalizeMembers(MembersRaw, "Member").ToList();
            set => MembersRaw = MembersToBsonArray(value);
        }

        public List<string> Avatars    { get; set; } = new();
        public int          AlertCount { get; set; }

        private static BsonValue? MemberToBsonValue(ProjectMember? member) =>
            member == null ? BsonNull.Value : member.ToBsonDocument();

        private static BsonArray MembersToBsonArray(IEnumerable<ProjectMember>? members) =>
            new(members?.Select(m => (BsonValue)m.ToBsonDocument()) ?? Enumerable.Empty<BsonValue>());

        private static ProjectMember? NormalizeMember(BsonValue? raw, string role)
        {
            if (raw == null || raw.IsBsonNull) return null;
            if (raw.IsString) return CreateMemberFromEmail(raw.AsString, role);
            if (raw.IsBsonDocument) return BsonSerializer.Deserialize<ProjectMember>(raw.AsBsonDocument);
            return null;
        }

        private static IEnumerable<ProjectMember> NormalizeMembers(BsonArray raw, string role)
        {
            if (raw == null)
            {
                yield break;
            }

            foreach (var value in raw)
            {
                if (value.IsString)
                {
                    yield return CreateMemberFromEmail(value.AsString, role);
                }
                else if (value.IsBsonDocument)
                {
                    yield return BsonSerializer.Deserialize<ProjectMember>(value.AsBsonDocument);
                }
            }
        }

        private static ProjectMember CreateMemberFromEmail(string email, string role)
        {
            var username = email.Split('@')[0];
            return new ProjectMember
            {
                Id = email,
                Name = string.IsNullOrWhiteSpace(username) ? "User" : username,
                Email = email,
                Role = role,
                Avatar = string.IsNullOrWhiteSpace(username) ? null : username[0].ToString().ToUpper()
            };
        }
    }
}