namespace AlertOpsBackend.DTOs
{
    // DTO dùng để nhận dữ liệu đăng nhập
    public class LoginRequest
    {
        // Email người dùng
        public string Email { get; set; } = null!;

        // Mật khẩu người dùng
        public string Password { get; set; } = null!;
    }
}