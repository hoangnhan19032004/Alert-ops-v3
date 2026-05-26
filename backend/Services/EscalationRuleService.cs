using AlertOpsBackend.Models;
using MongoDB.Driver;

namespace AlertOpsBackend.Services
{
    // Class EscalationRuleService dùng để map với collection 'escalationrules' trong MongoDB
    public class EscalationRuleService
    {
        // Collection MongoDB để lưu trữ thông tin escalation rules
        private readonly IMongoCollection<EscalationRule> _rules;

        public EscalationRuleService(AlertOpsDatabaseSettings settings)
        {
            // Kết nối đến MongoDB
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            _rules = database.GetCollection<EscalationRule>(settings.EscalationRulesCollectionName);
        }

        // Lấy tất cả escalation rules
        public List<EscalationRule> Get() =>
            _rules.Find(_ => true).ToList();

        // Lấy escalation rule theo id
        public EscalationRule? Get(string id) =>
            _rules.Find(r => r.Id == id).FirstOrDefault();

        // Tạo escalation rule mới
        public EscalationRule Create(EscalationRule rule)
        {
            _rules.InsertOne(rule);
            return rule;
        }

        // Update escalation rule
        public void Update(string id, EscalationRule ruleIn) =>
            _rules.ReplaceOne(r => r.Id == id, ruleIn);

        // Xóa escalation rule
        public void Remove(string id) =>
            _rules.DeleteOne(r => r.Id == id);
    }
}
