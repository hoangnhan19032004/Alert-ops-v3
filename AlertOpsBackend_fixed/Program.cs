using AlertOpsBackend.Models;
using AlertOpsBackend.Services;
using AlertOpsBackend.Hubs;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Controllers — thêm camelCase JSON để frontend nhận đúng field name
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// MongoDB Settings
builder.Services.Configure<AlertOpsDatabaseSettings>(
    builder.Configuration.GetSection("AlertOpsDatabase"));

builder.Services.AddSingleton<AlertOpsDatabaseSettings>(sp =>
    sp.GetRequiredService<IOptions<AlertOpsDatabaseSettings>>().Value);

// Domain Services
builder.Services.AddSingleton<AlertService>();
builder.Services.AddSingleton<ProjectService>();
builder.Services.AddSingleton<EscalationRuleService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<NotificationHistoryService>();

// Background worker: tự động gửi mail theo Escalation Rules
builder.Services.AddHostedService<EscalationWorker>();

// SignalR
builder.Services.AddSignalR();

// NotificationService — Scoped because IHubContext is Scoped
builder.Services.AddScoped<NotificationService>();

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

// SignalR Hub endpoint
app.MapHub<AlertOpsHub>("/hubs/alertops");

app.Run();