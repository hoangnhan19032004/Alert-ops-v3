using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace AlertOpsBackend.Models
{
    // Class này dùng để đại diện cho 1 thành viên trong dự án (dùng cho các API liên quan đến project)
    public class ProjectMember
    {
        public string  Id     { get; set; } = string.Empty;
        public string  Name   { get; set; } = string.Empty;
        public string  Email  { get; set; } = string.Empty;
        public string  Role   { get; set; } = string.Empty;
        public string? Avatar { get; set; }
    }

    // Class Project dùng để map với collection 'projects' trong MongoDB
    public class Project
    {
        // [BsonIgnore] -> Bất kỳ trường nào trong C# mà bạn không muốn MongoDB lưu vào database
        // [BsonElement("Name")] -> Đặt tên cho field trong database
        // [BsonRepresentation(BsonType.ObjectId)] -> Để map với ObjectId trong MongoDB
        // [JsonIgnore] -> Bỏ qua field này khi return JSON response
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

        // =====================================
        // CÁC HÀM PHỤ TRỢ CHO PROJECT MEMBER
        // =====================================
        // Hàm này dùng để convert ProjectMember thành BsonValue để lưu vào MongoDB
        private static BsonValue? MemberToBsonValue(ProjectMember? member) =>
            member == null ? BsonNull.Value : member.ToBsonDocument();

        // Hàm này dùng để convert IEnumerable<ProjectMember> thành BsonArray để lưu vào MongoDB
        private static BsonArray MembersToBsonArray(IEnumerable<ProjectMember>? members) =>
            new(members?.Select(m => (BsonValue)m.ToBsonDocument()) ?? Enumerable.Empty<BsonValue>());
        
        // Hàm này dùng để convert BsonValue thành ProjectMember để lấy dữ liệu từ MongoDB
        private static ProjectMember? NormalizeMember(BsonValue? raw, string role)
        {
            if (raw == null || raw.IsBsonNull) return null;
            if (raw.IsString) return CreateMemberFromEmail(raw.AsString, role);
            if (raw.IsBsonDocument) return BsonSerializer.Deserialize<ProjectMember>(raw.AsBsonDocument);
            return null;
        }

        // Hàm này dùng để convert BsonArray thành IEnumerable<ProjectMember> để lấy dữ liệu từ MongoDB
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

        // Hàm này dùng để tạo ProjectMember từ email
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