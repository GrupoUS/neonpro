export class PushProvider {
  async sendPush(deviceToken: string, title: string, body: string) {
    console.log(`Sending push to ${deviceToken}: ${title}`);
    return { success: true, messageId: 'push-' + Date.now() };
  }
}
