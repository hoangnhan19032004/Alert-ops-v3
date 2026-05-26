namespace AlertOpsBackend.DTOs
{
    // DTO dùng để nhận token refresh
    public class RefreshTokenRequest
    {
        // Token refresh
        public string RefreshToken { get; set; } = null!;
    }
}