/**
 * WhatsApp Business API Routes for NeonPro Healthcare
 * Handles webhook verification, message processing, and patient communication
 * Healthcare compliance: LGPD + ANVISA + CFM + Message audit logging
 */

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// Import middleware
import { auditMiddleware } from "../middleware/audit.middleware";
import { healthcareSecurityMiddleware } from "../middleware/healthcare-security";

// Import types
import type { Context } from "hono";

// WhatsApp webhook verification schema
const webhookVerificationSchema = z.object({
  "hub.mode": z.literal("subscribe"),
  "hub.challenge": z.string(),
  "hub.verify_token": z.string(),
});

// WhatsApp message webhook schema
const messageWebhookSchema = z.object({
  object: z.literal("whatsapp_business_account"),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messaging_product: z.literal("whatsapp"),
            metadata: z.object({
              display_phone_number: z.string(),
              phone_number_id: z.string(),
            }),
            contacts: z.array(
              z.object({
                profile: z.object({
                  name: z.string(),
                }),
                wa_id: z.string(),
              }),
            ).optional(),
            messages: z.array(
              z.object({
                from: z.string(),
                id: z.string(),
                timestamp: z.string(),
                text: z.object({
                  body: z.string(),
                }).optional(),
                type: z.enum(["text", "image", "document", "audio", "video"]),
              }),
            ).optional(),
            statuses: z.array(
              z.object({
                id: z.string(),
                status: z.enum(["sent", "delivered", "read", "failed"]),
                timestamp: z.string(),
                recipient_id: z.string(),
              }),
            ).optional(),
          }),
          field: z.literal("messages"),
        }),
      ),
    }),
  ),
});

// Create WhatsApp routes instance
const whatsappRoutes = new Hono();

// Apply middleware
whatsappRoutes.use("*", healthcareSecurityMiddleware());
whatsappRoutes.use("*", auditMiddleware());

/**
 * WhatsApp Webhook Verification Endpoint
 * GET /whatsapp/webhook
 * Verifies webhook subscription with WhatsApp Business API
 */
whatsappRoutes.get(
  "/webhook",
  zValidator("query", webhookVerificationSchema),
  async (c: Context) => {
    try {
      const { "hub.mode": mode, "hub.challenge": challenge, "hub.verify_token": verifyToken } =
        (c.req as any).valid("query");

      // Verify the token matches our configured verify token
      const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;
      if (!expectedToken) {
        console.error("WHATSAPP_VERIFY_TOKEN not configured");
        return c.json({ error: "Webhook verification not configured" }, 500);
      }

      if (verifyToken !== expectedToken) {
        console.error("Invalid verify token received:", verifyToken);
        return c.json({ error: "Invalid verify token" }, 403);
      }

      // Log successful verification for audit
      console.log("WhatsApp webhook verification successful");

      // Return the challenge to complete verification
      return c.text(challenge);
    } catch (error) {
      console.error("WhatsApp webhook verification error:", error);
      return c.json({ error: "Webhook verification failed" }, 500);
    }
  },
);

/**
 * WhatsApp Message Webhook Endpoint
 * POST /whatsapp/webhook
 * Processes incoming messages and status updates from WhatsApp
 */
whatsappRoutes.post(
  "/webhook",
  zValidator("json", messageWebhookSchema),
  async (c: Context) => {
    try {
      const webhookData = (c.req as any).valid("json");

      // Process each entry in the webhook
      for (const entry of webhookData.entry) {
        for (const change of entry.changes) {
          const { value } = change;

          // Process incoming messages
          if (value.messages && value.messages.length > 0) {
            for (const message of value.messages) {
              await processIncomingMessage(message, value.metadata, c);
            }
          }

          // Process message status updates
          if (value.statuses && value.statuses.length > 0) {
            for (const status of value.statuses) {
              await processMessageStatus(status, value.metadata, c);
            }
          }
        }
      }

      // Return success response
      return c.json({ status: "success", message: "Webhook processed successfully" });
    } catch (error) {
      console.error("WhatsApp webhook processing error:", error);
      return c.json({ error: "Webhook processing failed" }, 500);
    }
  },
);

/**
 * Send WhatsApp Message Endpoint
 * POST /whatsapp/send
 * Sends messages to patients via WhatsApp Business API
 */
whatsappRoutes.post(
  "/send",
  zValidator(
    "json",
    z.object({
      to: z.string().regex(/^\d{10,15}$/, "Invalid phone number format"),
      message: z.string().min(1).max(4096),
      type: z.enum(["text", "template"]).default("text"),
      clinicId: z.string().uuid(),
      patientId: z.string().uuid().optional(),
      messageType: z.enum(["appointment_reminder", "general", "emergency", "marketing"]).default(
        "general",
      ),
    }),
  ),
  async (c: Context) => {
    try {
      const { to, message, type, clinicId, patientId, messageType } = (c.req as any).valid("json");

      // Validate clinic access and permissions
      // TODO: Implement clinic authorization check

      // Send message via WhatsApp Business API
      const result = await sendWhatsAppMessage({
        to,
        message,
        type,
        clinicId,
        patientId,
        messageType,
      });

      return c.json({
        status: "success",
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("WhatsApp send message error:", error);
      return c.json({
        error: "Failed to send message",
        details: error instanceof Error ? error.message : "Unknown error",
      }, 500);
    }
  },
);

/**
 * WhatsApp Health Check Endpoint
 * GET /whatsapp/health
 * Checks WhatsApp Business API connectivity and configuration
 */
whatsappRoutes.get("/health", async (c: Context) => {
  try {
    const requiredEnvVars = [
      "WHATSAPP_ACCESS_TOKEN",
      "WHATSAPP_PHONE_NUMBER_ID",
      "WHATSAPP_VERIFY_TOKEN",
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      return c.json({
        status: "unhealthy",
        error: "Missing required environment variables",
        missing: missingVars,
      }, 500);
    }

    // TODO: Add actual WhatsApp API connectivity test
    return c.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      configuration: {
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        webhookConfigured: !!process.env.WHATSAPP_VERIFY_TOKEN,
      },
    });
  } catch (error) {
    console.error("WhatsApp health check error:", error);
    return c.json({
      status: "unhealthy",
      error: "Health check failed",
    }, 500);
  }
});

// Helper functions (to be implemented)

/**
 * Process incoming WhatsApp message
 */
async function processIncomingMessage(
  message: any,
  metadata: any,
  c: Context,
): Promise<void> {
  try {
    console.log("Processing incoming WhatsApp message:", {
      messageId: message.id,
      from: message.from,
      type: message.type,
      timestamp: message.timestamp,
    });

    // TODO: Implement message processing logic
    // 1. Store message in database
    // 2. Identify patient/clinic
    // 3. Process with AI if needed
    // 4. Send response if required

    // For MVP: Basic message logging
    console.log("Message content:", message.text?.body || `[${message.type} message]`);
  } catch (error) {
    console.error("Error processing incoming message:", error);
  }
}

/**
 * Process WhatsApp message status update
 */
async function processMessageStatus(
  status: any,
  metadata: any,
  c: Context,
): Promise<void> {
  try {
    console.log("Processing WhatsApp message status:", {
      messageId: status.id,
      status: status.status,
      recipientId: status.recipient_id,
      timestamp: status.timestamp,
    });

    // TODO: Implement status update logic
    // 1. Update message status in database
    // 2. Trigger notifications if needed
    // 3. Update delivery metrics
  } catch (error) {
    console.error("Error processing message status:", error);
  }
}

/**
 * Send message via WhatsApp Business API
 */
async function sendWhatsAppMessage(params: {
  to: string;
  message: string;
  type: string;
  clinicId: string;
  patientId?: string;
  messageType: string;
}): Promise<{ messageId: string; }> {
  const { to, message, type } = params;

  // TODO: Implement actual WhatsApp API call
  // For MVP: Mock implementation
  console.log("Sending WhatsApp message:", {
    to,
    message: message.slice(0, 100) + (message.length > 100 ? "..." : ""),
    type,
  });

  // Mock response
  return {
    messageId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
  };
}

export { whatsappRoutes };
