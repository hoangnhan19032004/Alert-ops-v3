namespace AlertOpsBackend.DTOs
{
    public class UpdateProfileRequest
    {
        public string Name  { get; set; } = null!;
        public string? Phone { get; set; }
        public string? Bio   { get; set; }
    }
}