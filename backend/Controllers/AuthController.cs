using AlertOpsBackend.DTOs;
using AlertOpsBackend.Models;
using AlertOpsBackend.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace AlertOpsBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _users;
        private readonly IConfiguration _config;

        public AuthController(UserService users, IConfiguration config)
        {
            _users = users;
            _config = config;
        }

        // ─────────────────────────────
        // REGISTER
        // ─────────────────────────────
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest dto)
        {
            var existing = await _users.GetByEmailAsync(dto.Email);

            if (existing != null)
            {
                return BadRequest(new { message = "Email already exists" });
            }

            var user = new User
            {
                Name         = dto.Name,
                Email        = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role         = string.IsNullOrWhiteSpace(dto.Role) ? "Operator" : dto.Role
            };

            await _users.CreateAsync(user);

            return Ok(new { message = "Register success" });
        }

        // ─────────────────────────────
        // LOGIN
        // ─────────────────────────────
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest dto)
        {
            var user = await _users.GetByEmailAsync(dto.Email);

            if (user == null ||
                !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var token        = GenerateJwt(user);
            var refreshToken = GenerateRefreshToken();

            user.RefreshToken       = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

            await _users.UpdateAsync(user.Id!, user);

            return Ok(new AuthResponse
            {
                AccessToken  = token,
                RefreshToken = refreshToken,
                User = new
                {
                    user.Id,
                    user.Name,
                    user.Email,
                    user.Role
                }
            });
        }

        // ─────────────────────────────
        // REFRESH TOKEN
        // ─────────────────────────────
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest dto)
        {
            var user = await _users.GetByRefreshTokenAsync(dto.RefreshToken);

            if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
            {
                return Unauthorized(new { message = "Invalid or expired refresh token" });
            }

            var newAccessToken  = GenerateJwt(user);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken       = newRefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

            await _users.UpdateAsync(user.Id!, user);

            return Ok(new AuthResponse
            {
                AccessToken  = newAccessToken,
                RefreshToken = newRefreshToken,
                User = new
                {
                    user.Id,
                    user.Name,
                    user.Email,
                    user.Role
                }
            });
        }

        // ─────────────────────────────
        // LOGOUT — FIX #2: xóa refresh token trên DB
        // ─────────────────────────────
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest dto)
        {
            var user = await _users.GetByRefreshTokenAsync(dto.RefreshToken);

            if (user != null)
            {
                user.RefreshToken       = null;
                user.RefreshTokenExpiry = null;
                await _users.UpdateAsync(user.Id!, user);
            }

            // Trả về 200 dù token không tìm thấy (idempotent logout)
            return Ok(new { message = "Logged out" });
        }

        // ─────────────────────────────
        // ME — lấy thông tin user hiện tại
        // ─────────────────────────────
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null) return Unauthorized();

            var user = await _users.GetByEmailAsync(email);
            if (user == null) return NotFound();

            return Ok(new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Role
            });
        }

        // ─────────────────────────────
        // PRIVATE HELPERS
        // ─────────────────────────────
        private string GenerateJwt(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id!),
                new Claim(ClaimTypes.Name,           user.Name),
                new Claim(ClaimTypes.Email,          user.Email),
                new Claim(ClaimTypes.Role,           user.Role)
            };

            var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expireMinutes = int.TryParse(_config["Jwt:ExpireMinutes"], out var m) ? m : 60;

            var token = new JwtSecurityToken(
                issuer:             _config["Jwt:Issuer"],
                audience:           _config["Jwt:Audience"],
                claims:             claims,
                expires:            DateTime.UtcNow.AddMinutes(expireMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateRefreshToken() =>
            Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }
}
