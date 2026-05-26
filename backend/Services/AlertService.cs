using AlertOpsBackend.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace AlertOpsBackend.Services
{
    public class AlertService
    {
        // Collection MongoDB để lưu trữ thông tin alerts
        private readonly IMongoCollection<Alert> _alerts;

        public AlertService(AlertOpsDatabaseSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            _alerts = database.GetCollection<Alert>(settings.AlertsCollectionName);
        }

        // Lấy tất cả alerts
        public List<Alert> Get() =>
            _alerts.Find(_ => true).ToList();
        
        // Lấy alert theo id
        public Alert? Get(string id) =>
            _alerts.Find(a => a.Id == id).FirstOrDefault();

        // Tạo alert mới
        public Alert Create(Alert alert)
        {
            _alerts.InsertOne(alert);
            return alert;
        }

        // Update alert
        public void Update(string id, Alert alertIn) =>
            _alerts.ReplaceOne(a => a.Id == id, alertIn);

        // Xóa alert
        public void Remove(string id) =>
            _alerts.DeleteOne(a => a.Id == id);

        // Bulk delete by list of IDs using MongoDB $in operator
        public long BulkDelete(List<string> ids)
        {
            var filter = Builders<Alert>.Filter.In(a => a.Id, ids);
            var result = _alerts.DeleteMany(filter);
            return result.DeletedCount;
        }

        // Bulk update status by list of IDs using MongoDB $in + $set
        public long BulkUpdateStatus(List<string> ids, string status)
        {
            var filter = Builders<Alert>.Filter.In(a => a.Id, ids);
            var update = Builders<Alert>.Update.Set(a => a.Status, status);
            var result = _alerts.UpdateMany(filter, update);
            return result.ModifiedCount;
        }
    }
}
