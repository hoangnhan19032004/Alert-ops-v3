using Microsoft.AspNetCore.SignalR;
using AlertOpsBackend.Hubs;

namespace AlertOpsBackend.Services
{
    // Service này để gửi thông báo đến client
    public class NotificationService
    {
        // Interface để gửi thông báo đến client
        private readonly IHubContext<AlertOpsHub> _hubContext;

        // Constructor
        public NotificationService(IHubContext<AlertOpsHub> hubContext)
        {
            _hubContext = hubContext;
        }

        // Gửi thông báo đến client
        public async Task SendAsync(string topic, long count = 1)
        {
            await _hubContext.Clients.All.SendAsync("Notify", new
            {
                topic,
                count,
                timestamp = DateTime.UtcNow
            });
        }
    }
}
