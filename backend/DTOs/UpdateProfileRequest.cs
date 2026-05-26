namespace AlertOpsBackend.DTOs
{
    // DTO dùng để nhận dữ liệu cập nhật thông tin cá nhân
    public class UpdateProfileRequest
    {
        // Tên người dùng
        public string Name  { get; set; } = null!;

        // Số điện thoại người dùng
        public string? Phone { get; set; }

        // Giới thiệu bản thân người dùng
        public string? Bio   { get; set; }
    }
}