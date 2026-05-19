using AlertOpsBackend.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace AlertOpsBackend.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _users;

        public UserService(IOptions<AlertOpsDatabaseSettings> settings)
        {
            var mongoClient = new MongoClient(settings.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(settings.Value.DatabaseName);

            _users = mongoDatabase.GetCollection<User>("Users");
        }

        // ─────────────────────────────
        // GET ALL
        // ─────────────────────────────
        public async Task<List<User>> GetAsync() =>
            await _users.Find(_ => true).ToListAsync();

        // ─────────────────────────────
        // GET BY EMAIL
        // ─────────────────────────────
        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _users
                .Find(x => x.Email == email)
                .FirstOrDefaultAsync();
        }

        // ─────────────────────────────
        // GET BY REFRESH TOKEN (FIX LỖI CỦA BẠN)
        // ─────────────────────────────
        public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
        {
            return await _users
                .Find(x => x.RefreshToken == refreshToken)
                .FirstOrDefaultAsync();
        }

        // ─────────────────────────────
        // CREATE USER
        // ─────────────────────────────
        public async Task CreateAsync(User user)
        {
            await _users.InsertOneAsync(user);
        }

        // ─────────────────────────────
        // UPDATE USER
        // ─────────────────────────────
        public async Task UpdateAsync(string id, User user)
        {
            await _users.ReplaceOneAsync(x => x.Id == id, user);
        }
    }
}