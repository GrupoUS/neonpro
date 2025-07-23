import { serve } from "@trigger.dev/nextjs";

// Import all background job tasks
import { 
  appointmentConfirmationEmail,
  appointmentReminderEmail 
} from "@/trigger/jobs/appointment-emails";

import {
  invoiceEmailDelivery,
  paymentReminderEmail
} from "@/trigger/jobs/billing-emails";

/**
 * 🚀 Trigger.dev API Route for Next.js 15 + Vercel
 * 
 * Esta rota integra todos os background jobs do NeonPro com o Trigger.dev
 * Funciona perfeitamente no Vercel Edge Functions
 */

export const { GET, POST, PUT } = serve({
  id: "neonpro-clinic-automation",
  
  // Registrar todos os jobs de automação
  tasks: [
    // 📧 Email automation jobs (maior impacto)
    appointmentConfirmationEmail,
    appointmentReminderEmail,
    
    // 💰 Billing automation jobs  
    invoiceEmailDelivery,
    paymentReminderEmail,
  ],

  // Configurações para Vercel deployment
  verbose: process.env.NODE_ENV === "development",
  
  // Error handling customizado para NeonPro
  onTaskError: (error, task) => {
    console.error(`❌ Job failed: ${task.id}`, {
      error: error.message,
      stack: error.stack,
      taskId: task.id,
      timestamp: new Date().toISOString(),
    });
  },

  onTaskSuccess: (task, output) => {
    console.log(`✅ Job completed: ${task.id}`, {
      taskId: task.id,
      output,
      timestamp: new Date().toISOString(),
    });
  },
});