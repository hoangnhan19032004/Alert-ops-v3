using AlertOpsBackend.Models;
using AlertOpsBackend.Services;
using Microsoft.AspNetCore.Mvc;

namespace AlertOpsBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationHistoryController : ControllerBase
    {
        private readonly NotificationHistoryService _notificationService;

        public NotificationHistoryController(NotificationHistoryService notificationService)
        {
            _notificationService = notificationService;
        }

        // GET /api/notificationhistory/alert/{alertId}
        [HttpGet("alert/{alertId}")]
        public ActionResult<List<NotificationHistory>> GetByAlertId(string alertId)
        {
            var notifications = _notificationService.GetByAlertId(alertId);
            return Ok(notifications);
        }

        // GET /api/notificationhistory/project/{projectId}
        [HttpGet("project/{projectId}")]
        public ActionResult<List<NotificationHistory>> GetByProjectId(string projectId)
        {
            var notifications = _notificationService.GetByProjectId(projectId);
            return Ok(notifications);
        }

        // GET /api/notificationhistory/{id}
        [HttpGet("{id:length(24)}")]
        public ActionResult<NotificationHistory> Get(string id)
        {
            var notification = _notificationService.Get(id);
            if (notification == null) return NotFound();
            return Ok(notification);
        }

        // GET /api/notificationhistory/recent?limit=20
        [HttpGet("recent")]
        public ActionResult<List<NotificationHistory>> GetRecent([FromQuery] int limit = 20)
        {
            var notifications = _notificationService.GetRecent(Math.Min(limit, 100));
            return Ok(notifications);
        }

        // GET /api/notificationhistory/failed
        [HttpGet("failed")]
        public ActionResult<List<NotificationHistory>> GetFailed()
        {
            var notifications = _notificationService.GetFailed();
            return Ok(notifications);
        }

        // POST /api/notificationhistory/send
        // Body: { alertId, projectId, recipients, subject, body, type?, channel? }
        [HttpPost("send")]
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
                    req.Type ?? "manual",
                    req.Channel ?? "email"
                );

                return CreatedAtAction(nameof(Get), new { id = notification.Id }, notification);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/notificationhistory/{id}
        [HttpDelete("{id:length(24)}")]
        public IActionResult Delete(string id)
        {
            var notification = _notificationService.Get(id);
            if (notification == null) return NotFound();

            _notificationService.Remove(id);
            return NoContent();
        }
    }

    public class SendNotificationRequest
    {
        public string? AlertId { get; set; }
        public string ProjectId { get; set; } = null!;
        public List<string> Recipients { get; set; } = new();
        public string Subject { get; set; } = null!;
        public string Body { get; set; } = null!;
        public string? Type { get; set; } // auto or manual
        public string? Channel { get; set; } // email, slack, teams, webhook
    }
}
