/**
 * Provider abstraction for Email and SMS delivery.
 * Currently uses DevStubProvider in development with a plug-and-play architecture
 * ready for one-line configuration to SendGrid, AWS SES, or Twilio.
 */

class BaseNotificationProvider {
  async sendEmail({ to, subject, html, text }) {
    throw new Error("sendEmail must be implemented by provider");
  }

  async sendSms({ to, message }) {
    throw new Error("sendSms must be implemented by provider");
  }

  async sendBulkSms(recipients) {
    throw new Error("sendBulkSms must be implemented by provider");
  }
}

class DevStubNotificationProvider extends BaseNotificationProvider {
  async sendEmail({ to, subject, html, text }) {
    const messageId = `email-stub-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log(`\n📧 [NOTIFICATION PROVIDER - EMAIL STUB]`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Content: ${text || (html ? html.replace(/<[^>]*>/g, "").slice(0, 80) : "N/A")}...`);
    console.log(`   MessageId: ${messageId}\n`);
    return { success: true, messageId, provider: "DevStub-SendGrid" };
  }

  async sendSms({ to, message }) {
    const messageId = `sms-stub-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log(`\n📱 [NOTIFICATION PROVIDER - SMS STUB]`);
    console.log(`   To: ${to}`);
    console.log(`   Message: ${message}`);
    console.log(`   MessageId: ${messageId}\n`);
    return { success: true, messageId, provider: "DevStub-Twilio" };
  }

  async sendBulkSms(recipients) {
    console.log(`\n📲 [NOTIFICATION PROVIDER - BULK SMS STUB] Batch of ${recipients.length} messages`);
    const results = [];
    for (const item of recipients) {
      const res = await this.sendSms(item);
      results.push(res);
    }
    return results;
  }
}

// Instantiate active provider (easily swapped via environment config)
const activeProvider = new DevStubNotificationProvider();

export const sendEmailNotice = async (payload) => activeProvider.sendEmail(payload);
export const sendSmsNotice = async (payload) => activeProvider.sendSms(payload);
export const sendBulkSmsNotices = async (recipients) => activeProvider.sendBulkSms(recipients);

export default activeProvider;
