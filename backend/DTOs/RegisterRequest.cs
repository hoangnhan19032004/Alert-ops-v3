namespace AlertOpsBackend.DTOs
{
    // DTO dùng để nhận dữ liệu đăng ký
    public class RegisterRequest
    {
        // Tên người dùng
        public string Name { get; set; } = null!;

        // Email người dùng
        public string Email { get; set; } = null!;

        // Mật khẩu người dùng
        public string Password { get; set; } = null!;

        // Vai trò người dùng
        public string? Role { get; set; }
    }
}