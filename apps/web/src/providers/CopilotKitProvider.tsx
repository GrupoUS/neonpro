import { CopilotKit } from '@copilotkit/react-core';
import { ReactNode } from 'react';

export const CopilotKitProvider = ({ children }: { children: ReactNode }) => {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      chatApiEndpoint="/api/copilotkit/chat"
      agent="healthcare-assistant"
      // @ts-ignore - CopilotKit types may not be fully updated
      categories={['healthcare', 'scheduling', 'patient-management']}
      instructions="You are a healthcare assistant for aesthetic clinics. Help professionals manage appointments, patient communication, and clinic operations while ensuring LGPD compliance and professional healthcare standards."
    >
      {children}
    </CopilotKit>
  );
};