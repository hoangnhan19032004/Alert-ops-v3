using AlertOpsBackend.Models;
using AlertOpsBackend.Services;
using AlertOpsBackend.Hubs;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ─────────────────────────────────────────────
// JWT KEY — đọc từ config (appsettings / env var / User Secrets)
// Production: set env var  Jwt__Key=<strong-random-key>
// ─────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is not configured.");

// ─────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;

        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// ─────────────────────────────────────────────
// SWAGGER — FIX #4: thêm Bearer security definition
// ─────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "AlertOps API",
        Version = "v1"
    });

    // Định nghĩa scheme Bearer
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT token. Ví dụ: Bearer eyJhbGci..."
    });

    // Yêu cầu Bearer cho tất cả endpoint
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ─────────────────────────────────────────────
// CORS (SignalR + API)
// ─────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "http://127.0.0.1:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ─────────────────────────────────────────────
// DATABASE SETTINGS
// ─────────────────────────────────────────────
builder.Services.Configure<AlertOpsDatabaseSettings>(
    builder.Configuration.GetSection("AlertOpsDatabase")
);

builder.Services.AddSingleton(sp =>
    sp.GetRequiredService<IOptions<AlertOpsDatabaseSettings>>().Value
);

// ─────────────────────────────────────────────
// SERVICES (DI)
// ─────────────────────────────────────────────
builder.Services.AddSingleton<AlertService>();
builder.Services.AddSingleton<ProjectService>();
builder.Services.AddSingleton<EscalationRuleService>();
builder.Services.AddSingleton<UserService>();

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<NotificationHistoryService>();
builder.Services.AddScoped<NotificationService>();

builder.Services.AddHostedService<EscalationWorker>();

// ─────────────────────────────────────────────
// SIGNALR
// ─────────────────────────────────────────────
builder.Services.AddSignalR();

// ─────────────────────────────────────────────
// JWT AUTHENTICATION (API + SIGNALR)
// ─────────────────────────────────────────────
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            ),

            // Clock skew = 0 để token hết hạn đúng giờ
            ClockSkew = TimeSpan.Zero
        };

        // ─────────────────────────────
        // SIGNALR JWT SUPPORT
        // ─────────────────────────────
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) &&
                    (path.StartsWithSegments("/hubs/alertops") ||
                     path.StartsWithSegments("/alertOpsHub")))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

// ─────────────────────────────────────────────
// AUTHORIZATION — FIX #12: role-based policies
// ─────────────────────────────────────────────
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly",    p => p.RequireRole("Admin"));
    options.AddPolicy("ManagerUp",    p => p.RequireRole("Admin", "Manager"));
    options.AddPolicy("OperatorUp",   p => p.RequireRole("Admin", "Manager", "Operator"));
});

// ─────────────────────────────────────────────
// BUILD APP
// ─────────────────────────────────────────────
var app = builder.Build();

// ─────────────────────────────────────────────
// MIDDLEWARE PIPELINE
// ─────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

// CORS FIRST
app.UseCors("AllowFrontend");

// JWT
app.UseAuthentication();
app.UseAuthorization();

// CONTROLLERS
app.MapControllers();

// SIGNALR HUB
app.MapHub<AlertOpsHub>("/hubs/alertops");

// RUN
app.Run();
