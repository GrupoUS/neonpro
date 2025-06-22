import { WhatsAppTest } from '@/components/whatsapp/whatsapp-test';

export default function WhatsAppTestPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Teste WhatsApp Business</h1>
        <p className="text-muted-foreground">
          Teste a integração com WhatsApp Business API
        </p>
      </div>
      
      <WhatsAppTest />
    </div>
  );
}
