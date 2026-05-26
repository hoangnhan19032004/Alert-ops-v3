using AlertOpsBackend.Models;
using AlertOpsBackend.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlertOpsBackend.Controllers
{
    //Cấu hình chung cho API controller
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EscalationRulesController : ControllerBase
    {
        private readonly EscalationRuleService _escalationRuleService;
        private readonly NotificationService   _notification;

        public EscalationRulesController(
            EscalationRuleService escalationRuleService,
            NotificationService   notification)
        {
            _escalationRuleService = escalationRuleService;
            _notification          = notification;
        }

        // GET /api/escalationrules - Lấy danh sách các quy tắc leo thang
        [HttpGet]
        public ActionResult<List<EscalationRule>> Get() =>
            _escalationRuleService.Get();

        // GET /api/escalationrules/{id} - Lấy chi tiết quy tắc leo thang theo ID 
        [HttpGet("{id:length(24)}")]
        public ActionResult<EscalationRule> Get(string id)
        {
            var rule = _escalationRuleService.Get(id);
            if (rule == null) return NotFound();
            return rule;
        }

        // POST /api/escalationrules - Tạo quy tắc leo thang mới
        [HttpPost]
        [Authorize(Policy = "ManagerUp")]
        public async Task<ActionResult<EscalationRule>> Create(EscalationRule rule)
        {
            _escalationRuleService.Create(rule);
            await _notification.SendAsync("escalation");
            return CreatedAtAction(nameof(Get), new { id = rule.Id }, rule);
        }

        // PUT /api/escalationrules/{id} - Cập nhật quy tắc leo thang
        [HttpPut("{id:length(24)}")]
        [Authorize(Policy = "ManagerUp")]
        public async Task<IActionResult> Update(string id, EscalationRule ruleIn)
        {
            var rule = _escalationRuleService.Get(id);
            if (rule == null) return NotFound();

            ruleIn.Id = id;
            _escalationRuleService.Update(id, ruleIn);
            await _notification.SendAsync("escalation");
            return NoContent();
        }

        // DELETE /api/escalationrules/{id} - Xóa quy tắc leo thang
        [HttpDelete("{id:length(24)}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(string id)
        {
            var rule = _escalationRuleService.Get(id);
            if (rule == null) return NotFound();

            _escalationRuleService.Remove(id);
            await _notification.SendAsync("escalation");
            return NoContent();
        }
    }
}
