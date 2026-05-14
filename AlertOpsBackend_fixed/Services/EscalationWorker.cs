using AlertOpsBackend.Models;
using AlertOpsBackend.Services;

namespace AlertOpsBackend.Services
{
    /// <summary>
    /// Background service chạy mỗi 30 giây.
    /// Với mỗi EscalationRule đang Active, tìm các Alert phù hợp
    /// (đúng project, đúng severity/trigger, đã tồn tại đủ thời gian Delay,
    /// chưa từng được gửi mail auto bởi rule này) rồi tự động gửi mail.
    /// </summary>
    public class EscalationWorker : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<EscalationWorker> _logger;

        // Tránh gửi trùng: lưu cặp (ruleId, alertId) đã xử lý trong memory.
        private readonly HashSet<string> _sent = new();

        public EscalationWorker(IServiceProvider services, ILogger<EscalationWorker> logger)
        {
            _services = services;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("EscalationWorker started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await RunAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "EscalationWorker encountered an error.");
                }

                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }

        private async Task RunAsync()
        {
            using var scope = _services.CreateScope();
            var ruleService    = scope.ServiceProvider.GetRequiredService<EscalationRuleService>();
            var alertService   = scope.ServiceProvider.GetRequiredService<AlertService>();
            var projectService = scope.ServiceProvider.GetRequiredService<ProjectService>();
            var notifService   = scope.ServiceProvider.GetRequiredService<NotificationHistoryService>();

            var rules  = ruleService.Get().Where(r => r.Active).ToList();
            var alerts = alertService.Get();
            var now    = DateTime.UtcNow;

            foreach (var rule in rules)
            {
                var delay = ParseDelay(rule.Delay);

                var project = projectService.Get()
                    .FirstOrDefault(p => p.Name == rule.Project || p.Id == rule.Project);
                if (project == null) continue;

                var recipients = BuildRecipients(project);
                if (recipients.Count == 0)
                {
                    _logger.LogWarning(
                        "No recipients found for project {Project}. Skipping rule {RuleId}.",
                        rule.Project, rule.Id);
                    continue;
                }

                var matchedAlerts = alerts.Where(a =>
                    MatchesProject(a, project) &&
                    MatchesTrigger(a, rule.Trigger) &&
                    a.Status != "Resolved" &&
                    (now - a.CreatedAt) >= delay
                ).ToList();

                foreach (var alert in matchedAlerts)
                {
                    // Guard: bỏ qua alert không có Id hợp lệ
                    if (string.IsNullOrEmpty(alert.Id))
                    {
                        _logger.LogWarning(
                            "Skipping alert with null/empty Id in project {Project}", rule.Project);
                        continue;
                    }

                    var key = $"{rule.Id}:{alert.Id}";
                    if (_sent.Contains(key)) continue;

                    var subject = BuildSubject(rule, alert);
                    var body    = BuildBody(rule, alert, project);

                    try
                    {
                        await notifService.SendAndRecordAsync(
                            alertId:    alert.Id,
                            projectId:  project.Id ?? "",
                            recipients: recipients,
                            subject:    subject,
                            body:       body,
                            type:       "auto",
                            channel:    rule.Channel
                        );

                        _sent.Add(key);
                        _logger.LogInformation(
                            "Auto-notification sent: rule={RuleId}, alert={AlertId}, recipients={Recipients}",
                            rule.Id, alert.Id, string.Join(",", recipients));
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex,
                            "Failed to send auto-notification for rule={RuleId}, alert={AlertId}",
                            rule.Id, alert.Id);
                    }
                }
            }
        }

        // ─── Helpers ─────────────────────────────────────────────

        private static TimeSpan ParseDelay(string delay) => delay?.Trim().ToLower() switch
        {
            null or "" or "immediate" => TimeSpan.Zero,
            "30 sec"  => TimeSpan.FromSeconds(30),
            "1 min"   => TimeSpan.FromMinutes(1),
            "2 min"   => TimeSpan.FromMinutes(2),
            "5 min"   => TimeSpan.FromMinutes(5),
            "10 min"  => TimeSpan.FromMinutes(10),
            "15 min"  => TimeSpan.FromMinutes(15),
            "30 min"  => TimeSpan.FromMinutes(30),
            "1 hour"  => TimeSpan.FromHours(1),
            _         => TryParseGeneric(delay)
        };

        private static TimeSpan TryParseGeneric(string delay)
        {
            var parts = delay.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 2 && int.TryParse(parts[0], out var n))
            {
                return parts[1].StartsWith("min")  ? TimeSpan.FromMinutes(n)
                     : parts[1].StartsWith("hour") ? TimeSpan.FromHours(n)
                     : parts[1].StartsWith("sec")  ? TimeSpan.FromSeconds(n)
                     : TimeSpan.FromMinutes(n);
            }
            return TimeSpan.FromMinutes(5);
        }

        private static bool MatchesProject(Alert alert, Project project) =>
            !string.IsNullOrEmpty(alert.ProjectId) &&
            (alert.ProjectId == project.Id || alert.ProjectId == project.Name);

        private static bool MatchesTrigger(Alert alert, string trigger)
        {
            if (string.IsNullOrEmpty(trigger)) return true;

            var parts        = trigger.Split('×', StringSplitOptions.RemoveEmptyEntries);
            var triggerValue = parts[0].Trim().ToLower();
            var severity     = alert.Severity?.ToLower() ?? "";

            if (severity == triggerValue) return true;

            if (triggerValue.EndsWith("xx"))
            {
                var prefix = triggerValue[0];
                if (alert.Message?.Contains(prefix + "0") == true ||
                    alert.Service?.Contains(triggerValue) == true)
                    return true;
            }

            if (alert.Message?.ToLower().Contains(triggerValue) == true) return true;
            if (alert.Service?.ToLower().Contains(triggerValue) == true) return true;

            return false;
        }

        /// <summary>
        /// Lấy email từ ProjectMember objects (owner + managers + members)
        /// </summary>
        private static List<string> BuildRecipients(Project project)
        {
            var list = new List<string>();

            if (!string.IsNullOrWhiteSpace(project.Owner?.Email))
                list.Add(project.Owner.Email);

            foreach (var m in project.Managers ?? new())
                if (!string.IsNullOrWhiteSpace(m.Email))
                    list.Add(m.Email);

            foreach (var m in project.Members ?? new())
                if (!string.IsNullOrWhiteSpace(m.Email))
                    list.Add(m.Email);

            return list.Distinct().ToList();
        }

        private static string BuildSubject(EscalationRule rule, Alert alert) =>
            $"[AlertOps] 🚨 Auto-escalation: {alert.Severity} alert in {rule.Project}";

        private static string BuildBody(EscalationRule rule, Alert alert, Project project) => $"""
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e4e8; border-radius: 8px; overflow: hidden;">
              <div style="background: #161b22; padding: 20px 24px; border-bottom: 1px solid #30363d;">
                <h2 style="color: #f85149; margin: 0; font-size: 18px;">🚨 Auto-Escalation Triggered</h2>
                <p style="color: #8b949e; margin: 4px 0 0; font-size: 13px;">Rule: {rule.Trigger} — Delay: {rule.Delay}</p>
              </div>
              <div style="background: #0d1117; padding: 20px 24px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #c9d1d9;">
                  <tr><td style="padding: 6px 0; color: #8b949e; width: 120px;">Project</td><td style="color: #f0f6fc; font-weight: 600;">{project.Name}</td></tr>
                  <tr><td style="padding: 6px 0; color: #8b949e;">Alert ID</td><td style="color: #f0f6fc; font-family: monospace;">{alert.Id}</td></tr>
                  <tr><td style="padding: 6px 0; color: #8b949e;">Severity</td><td><span style="background: #f851491a; color: #f85149; padding: 2px 8px; border-radius: 4px; font-weight: 600;">{alert.Severity}</span></td></tr>
                  <tr><td style="padding: 6px 0; color: #8b949e;">Status</td><td style="color: #f0f6fc;">{alert.Status}</td></tr>
                  <tr><td style="padding: 6px 0; color: #8b949e;">Service</td><td style="color: #f0f6fc;">{alert.Service}</td></tr>
                  <tr><td style="padding: 6px 0; color: #8b949e;">Environment</td><td style="color: #f0f6fc;">{alert.Env}</td></tr>
                  <tr><td style="padding: 6px 0; color: #8b949e;">Message</td><td style="color: #f0f6fc;">{alert.Message}</td></tr>
                  <tr><td style="padding: 6px 0; color: #8b949e;">Created At</td><td style="color: #f0f6fc;">{alert.CreatedAt:yyyy-MM-dd HH:mm:ss} UTC</td></tr>
                  <tr><td style="padding: 6px 0; color: #8b949e;">Channel</td><td style="color: #f0f6fc;">{rule.Channel}</td></tr>
                </table>
              </div>
              <div style="background: #161b22; padding: 12px 24px; text-align: center; border-top: 1px solid #30363d;">
                <p style="color: #8b949e; font-size: 12px; margin: 0;">This is an automated notification from AlertOps. Do not reply to this email.</p>
              </div>
            </div>
            """;
    }
}