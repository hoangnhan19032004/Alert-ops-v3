using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace AlertOpsBackend.Hubs
{
    // SignalR Hub - WebSocket realtime server 
    // Cần authorize để đảm bảo chỉ user đã đăng nhập mới có thể kết nối
    [Authorize]
    public class AlertOpsHub : Hub
    {
        // ─────────────────────────────────────
        // CONNECT - Xử lý khi user kết nối tới SignalR server
        // ─────────────────────────────────────
        public override async Task OnConnectedAsync()
        {
            // Lấy thông tin user từ token
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
            ); // Log debug ở backend

            // Tham gia nhóm cá nhân (Personal Group)
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(
                    Context.ConnectionId,
                    $"user:{userId}"
                );
            }

            // Tham gia nhóm theo Vai trò (Role Group)
            if (!string.IsNullOrEmpty(role))
            {
                await Groups.AddToGroupAsync(
                    Context.ConnectionId,
                    $"role:{role}"
                );
            }

            // Gửi lời chào chào mừng lại cho riêng client đó
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
        // DISCONNECT - Xử lí ngắt kết nối 
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
            ); // Ghi log debug ở backend

            await base.OnDisconnectedAsync(
                exception
            );
        }

        // ─────────────────────────────────────
        // JOIN PROJECT ROOM - Tham gia vào room của dự án 
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
        // LEAVE PROJECT ROOM - Rời khỏi room của dự án 
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
        // ADMIN BROADCAST - Gửi tin nhắn đến tất cả mọi người (chỉ Admin)
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