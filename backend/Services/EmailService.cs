using System.Net;
using System.Net.Mail;
using System.Text;

namespace AlertOpsBackend.Services
{
    // Interface IEmailService
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(
            List<string> recipients,
            string subject,
            string body
        );
    }

    // Class EmailService kế thừa interface IEmailService
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(
            IConfiguration config,
            ILogger<EmailService> logger
        )
        {
            _config = config;
            _logger = logger;
        }

        // Hàm gửi email
        public async Task<bool> SendEmailAsync(
            List<string> recipients,
            string subject,
            string body
        )
        {
            try
            {
                // SMTP config
                var smtpHost =
                    _config["EmailSettings:SmtpHost"]
                    ?? "localhost";

                var smtpPort = int.Parse(
                    _config["EmailSettings:SmtpPort"]
                    ?? "587"
                );

                var smtpUser =
                    _config["EmailSettings:SmtpUser"];

                var smtpPassword =
                    _config["EmailSettings:SmtpPassword"];

                var senderEmail =
                    _config["EmailSettings:SenderEmail"]
                    ?? "noreply@alertops.com";

                var senderName =
                    _config["EmailSettings:SenderName"]
                    ?? "AlertOps";

                // Nếu chưa cấu hình SMTP
                if (
                    string.IsNullOrWhiteSpace(smtpUser)
                    || string.IsNullOrWhiteSpace(smtpPassword)
                )
                {
                    _logger.LogWarning(
                        "SMTP configuration not set. Email would be sent to: {recipients}",
                        string.Join(", ", recipients)
                    );

                    return true;
                }

                // Convert xuống dòng thành <br>    
                var formattedBody = (body ?? string.Empty)
                    .Split(new[] { "\r\n", "\n" }, StringSplitOptions.None)
                    .Select(line => line.Trim())   // ← Trim() thay vì TrimStart()
                    .Aggregate((a, b) => a + "<br>" + b);

                // HTML email body
                var htmlBody =
                    $"<div style='font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;'>{formattedBody}</div>";

                using (var client = new SmtpClient(
                    smtpHost,
                    smtpPort
                ))
                {
                    client.EnableSsl = true;

                    client.Credentials =
                        new NetworkCredential(
                            smtpUser,
                            smtpPassword
                        );

                    using (var mailMessage = new MailMessage())
                    {
                        // Sender
                        mailMessage.From = new MailAddress(
                            senderEmail,
                            senderName
                        );

                        // Recipients
                        foreach (var recipient in recipients)
                        {
                            if (
                                !string.IsNullOrWhiteSpace(
                                    recipient
                                )
                            )
                            {
                                mailMessage.To.Add(recipient);
                            }
                        }

                        // Subject
                        mailMessage.Subject = subject;

                        // Body
                        mailMessage.Body = htmlBody;

                        // HTML enabled
                        mailMessage.IsBodyHtml = true;

                        // UTF8
                        mailMessage.BodyEncoding =
                            Encoding.UTF8;

                        mailMessage.SubjectEncoding =
                            Encoding.UTF8;

                        // Send
                        await client.SendMailAsync(
                            mailMessage
                        );

                        _logger.LogInformation(
                            "Email sent successfully to {recipients}",
                            string.Join(", ", recipients)
                        );

                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to send email to {recipients}",
                    string.Join(", ", recipients)
                );

                return false;
            }
        }
    }
}