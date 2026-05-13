using AlertOpsBackend.Models;
using MongoDB.Driver;

namespace AlertOpsBackend.Services
{
    public class EscalationRuleService
    {
        private readonly IMongoCollection<EscalationRule> _rules;

        public EscalationRuleService(AlertOpsDatabaseSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            _rules = database.GetCollection<EscalationRule>(settings.EscalationRulesCollectionName);
        }

        public List<EscalationRule> Get() =>
            _rules.Find(_ => true).ToList();

        public EscalationRule? Get(string id) =>
            _rules.Find(r => r.Id == id).FirstOrDefault();

        public EscalationRule Create(EscalationRule rule)
        {
            _rules.InsertOne(rule);
            return rule;
        }

        public void Update(string id, EscalationRule ruleIn) =>
            _rules.ReplaceOne(r => r.Id == id, ruleIn);

        public void Remove(string id) =>
            _rules.DeleteOne(r => r.Id == id);
    }
}
