using AlertOpsBackend.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace AlertOpsBackend.Services
{
    public class AlertService
    {
        private readonly IMongoCollection<Alert> _alerts;

        public AlertService(AlertOpsDatabaseSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            _alerts = database.GetCollection<Alert>(settings.AlertsCollectionName);
        }

        public List<Alert> Get() =>
            _alerts.Find(_ => true).ToList();

        public Alert? Get(string id) =>
            _alerts.Find(a => a.Id == id).FirstOrDefault();

        public Alert Create(Alert alert)
        {
            _alerts.InsertOne(alert);
            return alert;
        }

        public void Update(string id, Alert alertIn) =>
            _alerts.ReplaceOne(a => a.Id == id, alertIn);

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
