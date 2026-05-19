using System.Net;
using System.Net.Mail;

namespace AlertOpsBackend.Services
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(List<string> recipients, string subject, string body);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(List<string> recipients, string subject, string body)
        {
            try
            {
                var smtpHost = _config["EmailSettings:SmtpHost"] ?? "localhost";
                var smtpPort = int.Parse(_config["EmailSettings:SmtpPort"] ?? "587");
                var smtpUser = _config["EmailSettings:SmtpUser"];
                var smtpPassword = _config["EmailSettings:SmtpPassword"];
                var senderEmail = _config["EmailSettings:SenderEmail"] ?? "noreply@alertops.com";
                var senderName = _config["EmailSettings:SenderName"] ?? "AlertOps";

                // Nếu không có SMTP config, log warning và return true (để không block)
                if (string.IsNullOrEmpty(smtpUser) || string.IsNullOrEmpty(smtpPassword))
                {
                    _logger.LogWarning("SMTP configuration not set. Email would be sent to: {recipients}", 
                        string.Join(", ", recipients));
                    return true; // Assume success in dev mode
                }

                using (var client = new SmtpClient(smtpHost, smtpPort))
                {
                    client.EnableSsl = true;
                    client.Credentials = new NetworkCredential(smtpUser, smtpPassword);

                    using (var mailMessage = new MailMessage())
                    {
                        mailMessage.From = new MailAddress(senderEmail, senderName);
                        foreach (var recipient in recipients)
                        {
                            mailMessage.To.Add(recipient);
                        }

                        mailMessage.Subject = subject;
                        mailMessage.Body = body;
                        mailMessage.IsBodyHtml = true;

                        await client.SendMailAsync(mailMessage);
                        _logger.LogInformation("Email sent successfully to {recipients}", 
                            string.Join(", ", recipients));
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {recipients}", 
                    string.Join(", ", recipients));
                return false;
            }
        }
    }
}
