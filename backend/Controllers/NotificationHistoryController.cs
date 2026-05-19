using AlertOpsBackend.Models;
using AlertOpsBackend.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlertOpsBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]                     // FIX: yêu cầu JWT cho toàn bộ controller
    public class NotificationHistoryController : ControllerBase
    {
        private readonly NotificationHistoryService _notificationService;

        public NotificationHistoryController(NotificationHistoryService notificationService)
        {
            _notificationService = notificationService;
        }

        // GET BY ALERT ID
        [HttpGet("alert/{alertId}")]
        public async Task<IActionResult> GetByAlertId(string alertId)
        {
            var notifications = await _notificationService.GetByAlertIdAsync(alertId);
            return Ok(notifications);
        }

        // GET BY PROJECT ID
        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetByProjectId(string projectId)
        {
            var notifications = await _notificationService.GetByProjectIdAsync(projectId);
            return Ok(notifications);
        }

        // GET BY ID
        [HttpGet("{id:length(24)}")]
        public async Task<IActionResult> Get(string id)
        {
            var notification = await _notificationService.GetAsync(id);
            if (notification == null) return NotFound();
            return Ok(notification);
        }

        // GET RECENT
        [HttpGet("recent")]
        public async Task<IActionResult> GetRecent([FromQuery] int limit = 20)
        {
            var notifications = await _notificationService.GetRecentAsync(Math.Min(limit, 100));
            return Ok(notifications);
        }

        // GET FAILED
        [HttpGet("failed")]
        public async Task<IActionResult> GetFailed()
        {
            var notifications = await _notificationService.GetFailedAsync();
            return Ok(notifications);
        }

        // SEND NOTIFICATION — chỉ Manager trở lên
        [HttpPost("send")]
        [Authorize(Policy = "ManagerUp")]
        public async Task<IActionResult> SendNotification([FromBody] SendNotificationRequest req)
        {
            if (string.IsNullOrEmpty(req.ProjectId) ||
                req.Recipients == null || req.Recipients.Count == 0 ||
                string.IsNullOrEmpty(req.Subject) ||
                string.IsNullOrEmpty(req.Body))
            {
                return BadRequest(new { message = "Missing required fields" });
            }

            try
            {
                var notification = await _notificationService.SendAndRecordAsync(
                    req.AlertId,
                    req.ProjectId,
                    req.Recipients,
                    req.Subject,
                    req.Body,
                    req.Type    ?? "manual",
                    req.Channel ?? "email"
                );

                return CreatedAtAction(nameof(Get), new { id = notification.Id }, notification);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE — chỉ Admin
        [HttpDelete("{id:length(24)}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(string id)
        {
            var notification = await _notificationService.GetAsync(id);
            if (notification == null) return NotFound();

            await _notificationService.RemoveAsync(id);
            return NoContent();
        }
    }

    // DTO request
    public class SendNotificationRequest
    {
        public string?       AlertId    { get; set; }
        public string        ProjectId  { get; set; } = null!;
        public List<string>  Recipients { get; set; } = new();
        public string        Subject    { get; set; } = null!;
        public string        Body       { get; set; } = null!;
        public string?       Type       { get; set; }
        public string?       Channel    { get; set; }
    }
}
