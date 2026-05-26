using AlertOpsBackend.Models;
using MongoDB.Driver;

namespace AlertOpsBackend.Services
{
    public class ProjectService
    {
        // Collection để lưu trữ thông tin project
        private readonly IMongoCollection<Project> _projects;

        // Constructor
        public ProjectService(AlertOpsDatabaseSettings settings)
        {
            // Tạo kết nối đến MongoDB
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            _projects = database.GetCollection<Project>(settings.ProjectsCollectionName);
        }

        // Lấy tất cả thông tin project
        public List<Project> Get() =>
            _projects.Find(_ => true).ToList();

        // Lấy thông tin project theo id
        public Project? Get(string id) =>
            _projects.Find(p => p.Id == id).FirstOrDefault();

        // Tạo thông tin project
        public Project Create(Project project)
        {
            _projects.InsertOne(project);
            return project;
        }

        // Cập nhật thông tin project
        public void Update(string id, Project projectIn) =>
            _projects.ReplaceOne(p => p.Id == id, projectIn);

        // Xóa thông tin project
        public void Remove(string id) =>
            _projects.DeleteOne(p => p.Id == id);

        // Tăng alertCount khi có alert mới thuộc project này
        public void IncrementAlertCount(string projectId)
        {
            if (string.IsNullOrEmpty(projectId)) return;
            var filter = Builders<Project>.Filter.Eq(p => p.Id, projectId);
            var update = Builders<Project>.Update.Inc(p => p.AlertCount, 1);
            _projects.UpdateOne(filter, update);
        }

        // Giảm alertCount khi alert bị xóa (không xuống dưới 0)
        public void DecrementAlertCount(string projectId, int amount = 1)
        {
            if (string.IsNullOrEmpty(projectId)) return;
            var filter = Builders<Project>.Filter.And(
                Builders<Project>.Filter.Eq(p => p.Id, projectId),
                Builders<Project>.Filter.Gt(p => p.AlertCount, 0)
            );
            var update = Builders<Project>.Update.Inc(p => p.AlertCount, -amount);
            _projects.UpdateOne(filter, update);
        }
    }
}
