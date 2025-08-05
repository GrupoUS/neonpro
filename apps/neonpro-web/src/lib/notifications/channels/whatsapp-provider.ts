export class WhatsAppProvider {
  async sendWhatsApp(to: string, message: string) {
    console.log(`Sending WhatsApp to ${to}: ${message}`);
    return { success: true, messageId: 'whatsapp-' + Date.now() };
  }
}
