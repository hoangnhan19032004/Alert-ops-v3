namespace AlertOpsBackend.DTOs
{
    public class AuthResponse
    {
        //Token dùng để xác thực các request sau này
        public string AccessToken { get; set; } = null!;

        //Token dùng để lấy lại access token khi hết hạn
        public string RefreshToken { get; set; } = null!;

        //Thông tin người dùng
        public object User { get; set; } = null!;
    }
}