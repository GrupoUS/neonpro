import { EmailProvider } from './email-provider';
import { SMSProvider } from './sms-provider';
import { PushProvider } from './push-provider';
import { WhatsAppProvider } from './whatsapp-provider';

export class ChannelOrchestrator {
  private emailProvider = new EmailProvider();
  private smsProvider = new SMSProvider();
  private pushProvider = new PushProvider();
  private whatsappProvider = new WhatsAppProvider();

  async sendMultiChannel(message: any) {
    const results = [];
    
    if (message.channels.includes('email')) {
      results.push(await this.emailProvider.sendEmail(message.to, message.subject, message.content));
    }
    
    if (message.channels.includes('sms')) {
      results.push(await this.smsProvider.sendSMS(message.to, message.content));
    }
    
    return results;
  }
}
