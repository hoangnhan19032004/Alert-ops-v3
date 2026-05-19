using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace AlertOpsBackend.Hubs
{
    [Authorize]
    public class AlertOpsHub : Hub
    {
        // ─────────────────────────────────────
        // CONNECT
        // ─────────────────────────────────────
        public override async Task OnConnectedAsync()
        {
            var userId =
                Context.User?.FindFirst(
                    ClaimTypes.NameIdentifier
                )?.Value;

            var email =
                Context.User?.FindFirst(
                    ClaimTypes.Email
                )?.Value;

            var role =
                Context.User?.FindFirst(
                    ClaimTypes.Role
                )?.Value;

            Console.WriteLine(
                $"🔌 Connected: {email} ({role})"
            );

            // Join personal group
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(
                    Context.ConnectionId,
                    $"user:{userId}"
                );
            }

            // Join role group
            if (!string.IsNullOrEmpty(role))
            {
                await Groups.AddToGroupAsync(
                    Context.ConnectionId,
                    $"role:{role}"
                );
            }

            await Clients.Caller.SendAsync(
                "connected",
                new
                {
                    message = "Connected to AlertOps realtime server"
                }
            );

            await base.OnConnectedAsync();
        }

        // ─────────────────────────────────────
        // DISCONNECT
        // ─────────────────────────────────────
        public override async Task OnDisconnectedAsync(
            Exception? exception)
        {
            var email =
                Context.User?.FindFirst(
                    ClaimTypes.Email
                )?.Value;

            Console.WriteLine(
                $"❌ Disconnected: {email}"
            );

            await base.OnDisconnectedAsync(
                exception
            );
        }

        // ─────────────────────────────────────
        // JOIN PROJECT ROOM
        // ─────────────────────────────────────
        public async Task JoinProject(
            string projectId)
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"project:{projectId}"
            );

            await Clients.Caller.SendAsync(
                "joined:project",
                projectId
            );
        }

        // ─────────────────────────────────────
        // LEAVE PROJECT ROOM
        // ─────────────────────────────────────
        public async Task LeaveProject(
            string projectId)
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                $"project:{projectId}"
            );

            await Clients.Caller.SendAsync(
                "left:project",
                projectId
            );
        }

        // ─────────────────────────────────────
        // ADMIN BROADCAST
        // ─────────────────────────────────────
        [Authorize(Roles = "Admin")]
        public async Task BroadcastAdminMessage(
            string message)
        {
            await Clients.All.SendAsync(
                "admin:broadcast",
                new
                {
                    message,
                    time = DateTime.UtcNow
                }
            );
        }
    }
}