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
    public class ProjectsController : ControllerBase
    {
        private readonly ProjectService _projectService;
        private readonly NotificationService _notification;

        public ProjectsController(ProjectService projectService, NotificationService notification)
        {
            _projectService = projectService;
            _notification   = notification;
        }

        // GET: api/projects - Lấy danh sách tất cả các dự án
        [HttpGet]
        public ActionResult<List<Project>> Get() => _projectService.Get();

        // GET: api/projects/{id} - Lấy thông tin chi tiết dự án theo ID
        [HttpGet("{id:length(24)}")]
        public ActionResult<Project> Get(string id)
        {
            var project = _projectService.Get(id);
            if (project == null) return NotFound();
            return project;
        }

        // POST: api/projects - Tạo mới dự án (chỉ Manager)
        [HttpPost]
        [Authorize(Policy = "ManagerUp")]
        public async Task<ActionResult<Project>> Create(Project project)
        {
            _projectService.Create(project);
            await _notification.SendAsync("projects");
            return CreatedAtAction(nameof(Get), new { id = project.Id }, project);
        }

        // PUT: api/projects/{id} - Cập nhật dự án (chỉ Manager)
        [HttpPut("{id:length(24)}")]
        [Authorize(Policy = "ManagerUp")]
        public async Task<IActionResult> Update(string id, Project projectIn)
        {
            var project = _projectService.Get(id);
            if (project == null) return NotFound();

            projectIn.Id = id;
            _projectService.Update(id, projectIn);
            await _notification.SendAsync("projects");
            return NoContent();
        }

        // DELETE: api/projects/{id} - Xóa dự án (chỉ Admin)
        [HttpDelete("{id:length(24)}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(string id)
        {
            var project = _projectService.Get(id);
            if (project == null) return NotFound();

            _projectService.Remove(id);
            await _notification.SendAsync("projects");
            return NoContent();
        }
    }
}
