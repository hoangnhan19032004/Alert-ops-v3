using AlertOpsBackend.Models;
using AlertOpsBackend.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlertOpsBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]                     // FIX: yêu cầu JWT cho toàn bộ controller
    public class ProjectsController : ControllerBase
    {
        private readonly ProjectService _projectService;
        private readonly NotificationService _notification;

        public ProjectsController(ProjectService projectService, NotificationService notification)
        {
            _projectService = projectService;
            _notification   = notification;
        }

        // GET: api/projects
        [HttpGet]
        public ActionResult<List<Project>> Get() => _projectService.Get();

        // GET: api/projects/{id}
        [HttpGet("{id:length(24)}")]
        public ActionResult<Project> Get(string id)
        {
            var project = _projectService.Get(id);
            if (project == null) return NotFound();
            return project;
        }

        // POST: api/projects — chỉ Manager trở lên
        [HttpPost]
        [Authorize(Policy = "ManagerUp")]
        public async Task<ActionResult<Project>> Create(Project project)
        {
            _projectService.Create(project);
            await _notification.SendAsync("projects");
            return CreatedAtAction(nameof(Get), new { id = project.Id }, project);
        }

        // PUT: api/projects/{id} — chỉ Manager trở lên
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

        // DELETE: api/projects/{id} — chỉ Admin
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
