using AlertOpsBackend.Models;
using AlertOpsBackend.Services;
using Microsoft.AspNetCore.Mvc;

namespace AlertOpsBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlertsController : ControllerBase
    {
        private readonly AlertService _alertService;
        private readonly NotificationService _notification;

        public AlertsController(AlertService alertService, NotificationService notification)
        {
            _alertService = alertService;
            _notification = notification;
        }

        // GET /api/alerts
        [HttpGet]
        public ActionResult<List<Alert>> Get() => _alertService.Get();

        // GET /api/alerts/stats
        [HttpGet("stats")]
        public ActionResult<AlertStats> GetStats()
        {
            var all = _alertService.Get();
            var today = DateTime.UtcNow.Date;

            return Ok(new AlertStats
            {
                Total = all.Count,
                Open = all.Count(a => a.Status == "Open"),
                Acknowledged = all.Count(a => a.Status == "Acknowledged"),
                Escalated = all.Count(a => a.Status == "Escalated"),
                Resolved = all.Count(a => a.Status == "Resolved"),
                Critical = all.Count(a => a.Severity == "Critical"),
                ResolvedToday = all.Count(a => a.Status == "Resolved" && a.CreatedAt.Date == today)
            });
        }

        // GET /api/alerts/{id}
        [HttpGet("{id:length(24)}")]
        public ActionResult<Alert> Get(string id)
        {
            var alert = _alertService.Get(id);
            if (alert == null) return NotFound();
            return alert;
        }

        // POST /api/alerts
        [HttpPost]
        public async Task<ActionResult<Alert>> Create(Alert alert)
        {
            alert.CreatedAt = DateTime.UtcNow;
            _alertService.Create(alert);
            await _notification.SendAsync("alerts");
            return CreatedAtAction(nameof(Get), new { id = alert.Id }, alert);
        }

        // PUT /api/alerts/{id}
        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> Update(string id, Alert alertIn)
        {
            var alert = _alertService.Get(id);
            if (alert == null) return NotFound();

            alertIn.Id = id;
            alertIn.CreatedAt = alert.CreatedAt; // preserve original timestamp
            _alertService.Update(id, alertIn);
            await _notification.SendAsync("alerts");
            return NoContent();
        }

        // PATCH /api/alerts/{id}/status
        [HttpPatch("{id:length(24)}/status")]
        public async Task<IActionResult> PatchStatus(string id, [FromBody] StatusUpdateRequest req)
        {
            var alert = _alertService.Get(id);
            if (alert == null) return NotFound();

            if (!IsValidStatus(req.Status))
                return BadRequest(new { message = "Invalid status value" });

            alert.Status = req.Status;
            _alertService.Update(id, alert);
            await _notification.SendAsync("alerts");
            return Ok(alert);
        }

        // DELETE /api/alerts/{id}
        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var alert = _alertService.Get(id);
            if (alert == null) return NotFound();

            _alertService.Remove(id);
            await _notification.SendAsync("alerts");
            return NoContent();
        }

        // POST /api/alerts/bulk-delete
        [HttpPost("bulk-delete")]
        public async Task<IActionResult> BulkDelete([FromBody] BulkIdsRequest req)
        {
            if (req.Ids == null || req.Ids.Count == 0)
                return BadRequest(new { message = "No IDs provided" });

            var deleted = _alertService.BulkDelete(req.Ids);

            if (deleted > 0)
                await _notification.SendAsync("alerts", deleted);

            return Ok(new { deleted, message = $"{deleted} alert(s) deleted" });
        }

        // POST /api/alerts/bulk-status
        [HttpPost("bulk-status")]
        public async Task<IActionResult> BulkStatus([FromBody] BulkStatusRequest req)
        {
            if (req.Ids == null || req.Ids.Count == 0)
                return BadRequest(new { message = "No IDs provided" });

            if (!IsValidStatus(req.Status))
                return BadRequest(new { message = "Invalid status value" });

            var updated = _alertService.BulkUpdateStatus(req.Ids, req.Status);

            if (updated > 0)
                await _notification.SendAsync("alerts", updated);

            return Ok(new { updated, message = $"{updated} alert(s) updated to {req.Status}" });
        }

        private static bool IsValidStatus(string status) =>
            new[] { "Open", "Acknowledged", "Escalated", "Resolved" }.Contains(status);
    }

    public class StatusUpdateRequest
    {
        public string Status { get; set; } = null!;
    }

    public class BulkIdsRequest
    {
        public List<string> Ids { get; set; } = new();
    }

    public class BulkStatusRequest
    {
        public List<string> Ids { get; set; } = new();
        public string Status { get; set; } = null!;
    }

    public class AlertStats
    {
        public int Total { get; set; }
        public int Open { get; set; }
        public int Acknowledged { get; set; }
        public int Escalated { get; set; }
        public int Resolved { get; set; }
        public int Critical { get; set; }
        public int ResolvedToday { get; set; }
    }
}
