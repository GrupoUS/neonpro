export class SMSProvider {
  async sendSMS(to: string, message: string) {
    console.log(`Sending SMS to ${to}: ${message}`);
    return { success: true, messageId: "sms-" + Date.now() };
  }
}
