export class EmailProvider {
  async sendEmail(to: string, subject: string, content: string) {
    // Implementation stub
    console.log(`Sending email to ${to}: ${subject}`);
    return { success: true, messageId: "email-" + Date.now() };
  }
}
