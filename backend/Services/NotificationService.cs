using Microsoft.AspNetCore.SignalR;
using AlertOpsBackend.Hubs;

namespace AlertOpsBackend.Services
{
    public class NotificationService
    {
        private readonly IHubContext<AlertOpsHub> _hubContext;

        public NotificationService(IHubContext<AlertOpsHub> hubContext)
        {
            _hubContext = hubContext;
        }

        // Notify all clients on a topic (e.g. "alerts", "projects", "escalation")
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
