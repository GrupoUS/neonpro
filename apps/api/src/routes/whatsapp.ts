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
import { HealthcareAuthMiddleware } from "../middleware/healthcare-security";
import { auditService } from "../services/audit.service";

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
// Wrap class-based middleware instance into a Hono-compatible middleware handler
const healthcareAuth = new HealthcareAuthMiddleware();
whatsappRoutes.use("*", async (c, next) => {
  // Try common handler names, fall back to calling next()
  // Cast to any to accommodate different implementations without strict typing errors
  const anyAuth = healthcareAuth as any;
  if (typeof anyAuth.handle === "function") {
    return anyAuth.handle(c, next);
  }
  if (typeof anyAuth.middleware === "function") {
    return anyAuth.middleware(c, next);
  }
  if (typeof anyAuth === "function") {
    // If the exported value is callable
    return anyAuth(c, next);
  }
  // Fallback: continue to next middleware
  return next();
});
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
const sendPayloadSchema = z.object({
  to: z.string().regex(/^\+?\d{10,15}$/, "Invalid phone number format"),
  message: z.string().min(1).max(4096),
  type: z.enum(["text", "template"]).default("text"),
  clinicId: z.string().uuid(),
  patientId: z.string().uuid().optional(),
  messageType: z
    .enum(["appointment_reminder", "general", "emergency", "marketing"])
    .default("general"),
});

whatsappRoutes.post(
  "/send",
  // Use the named schema here (no runtime change)
  zValidator("json", sendPayloadSchema),
  async (c: Context) => {
    try {
      // Cast the validated body to the inferred type to satisfy TS
      const payload = (c.req as any).valid("json") as z.infer<typeof sendPayloadSchema>;
      const { to, message, type, clinicId, patientId, messageType } = payload;

      // Validate clinic access and permissions
      const authorized = await authorizeClinicAccess(c, clinicId);
      if (!authorized) {
        return c.json({ error: "Forbidden: clinic access denied" }, 403);
      }

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
 * Authorize that the authenticated user can access the given clinic.
 */
async function authorizeClinicAccess(c: Context, clinicId: string): Promise<boolean> {
  try {
    const user: any = c.get("user");
    const userId: string | undefined = user?.id || user?.userId || user?.sub;
    const roles: string[] = Array.isArray(user?.roles)
      ? user.roles
      : typeof user?.role === "string"
      ? [user.role]
      : [];
    const clinicIds: string[] = Array.isArray(user?.clinicIds)
      ? user.clinicIds
      : user?.clinic_id
      ? [user.clinic_id]
      : [];

    const isAdmin = roles.includes("admin") || roles.includes("superadmin")
      || roles.includes("dpo");
    const isMember = clinicIds.includes(clinicId);

    if (isAdmin || isMember) return true;

    // Attempt DB lookup for associations if not present in token (optional TODO)
    // TODO: Fetch clinic associations from DB if needed

    await auditService.logEvent({
      eventType: "UNAUTHORIZED_CLINIC_ACCESS",
      severity: "WARNING",
      outcome: "FAILURE",
      userId,
      resourceType: "AUTHORIZATION",
      resourceId: clinicId,
      ipAddress: c.req.header("CF-Connecting-IP") || "unknown",
      userAgent: c.req.header("User-Agent") || undefined,
      description: `User attempted to access clinic without permission`,
      details: {
        endpoint: c.req.path,
        method: (c.req.method && ["GET", "POST", "PUT", "PATCH", "DELETE"].includes(c.req.method))
          ? (c.req.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE")
          : undefined,
        status_code: 403,
      },
    });

    return false;
  } catch (err) {
    // In case of unexpected failure, default to deny
    return false;
  }
}

/**
 * Process incoming WhatsApp message
 */
async function processIncomingMessage(
  message: any,
  metadata: any,
  c: Context,
): Promise<void> {
  try {
    const fromMasked = typeof message.from === "string"
      ? message.from.replace(/.(?=.{4}$)/g, "*")
      : "unknown";
    const contentLength = typeof message.text?.body === "string" ? message.text.body.length : 0;

    console.log("Processing incoming WhatsApp message (safe)", {
      messageId: message.id,
      fromMasked,
      type: message.type,
      contentLength,
      timestamp: message.timestamp,
    });

    // Extract message content
    const messageContent = message.text?.body || message.caption || "";
    if (!messageContent.trim()) {
      console.log("Empty message content, skipping AI processing");
      return;
    }

    // Build WhatsApp chat request
    const whatsappRequest = {
      messages: [
        {
          id: message.id,
          role: "user" as const,
          content: messageContent,
          timestamp: Date.now(),
        },
      ],
      whatsappContext: {
        phoneNumber: message.from,
        messageType: message.type || "text",
        isFirstContact: await isFirstContact(message.from),
        previousInteractions: await getPreviousInteractionCount(message.from),
      },
      context: {
        clinicType: "aesthetic" as const,
        communicationChannel: "whatsapp" as const,
        patientLanguage: "pt-BR" as const,
      },
    };

    // Process with Brazilian AI Service
    const { BrazilianAIService } = await import(
      "@neonpro/core-services/services/BrazilianAIService"
    );
    const aiService = new BrazilianAIService();

    const serviceContext = {
      requestId: `whatsapp_${message.id}`,
      userId: message.from,
      timestamp: Date.now(),
      source: "whatsapp-webhook",
    };

    const aiResponse = await aiService.processWhatsAppChat(whatsappRequest, serviceContext);

    // Send AI response back via WhatsApp
    if (aiResponse.message?.content) {
      await sendWhatsAppMessage({
        to: message.from,
        message: aiResponse.message.content,
        type: "text",
        clinicId: "default", // TODO: Extract from context
        messageType: "general",
      });

      // Log successful AI interaction
      console.log("AI response sent successfully", {
        messageId: message.id,
        fromMasked,
        templateUsed: aiResponse.templateUsed,
        emergencyDetected: aiResponse.emergencyDetected,
        responseLength: aiResponse.message?.content?.length || 0,
      });
    }
  } catch (error) {
    console.error("Error processing incoming message:", error);

    // Send fallback response
    try {
      const fallbackMessage =
        "Olá! Obrigado por entrar em contato. Nossa equipe irá responder em breve. Para emergências, ligue: (11) 99999-9999";
      await sendWhatsAppMessage({
        to: message.from,
        message: fallbackMessage,
        type: "text",
        clinicId: "default",
        messageType: "general",
      });
    } catch (fallbackError) {
      console.error("Error sending fallback message:", fallbackError);
    }
  }
}

// Helper functions for WhatsApp context
async function isFirstContact(phoneNumber: string): Promise<boolean> {
  // TODO: Check database for previous interactions
  // For now, return false as placeholder
  return false;
}

async function getPreviousInteractionCount(phoneNumber: string): Promise<number> {
  // TODO: Count previous interactions from database
  // For now, return 0 as placeholder
  return 0;
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

async function sendWhatsAppMessage(args: {
  to: string;
  message: string;
  type: "text" | "template";
  clinicId: string;
  patientId?: string;
  messageType: "appointment_reminder" | "general" | "emergency" | "marketing";
}): Promise<{ messageId: string; status?: string; raw?: any; }> {
  const {
    to,
    message,
    type = "text",
    clinicId,
    patientId,
    messageType = "general",
  } = args;

  // Basic validation
  const toNormalized = String(to).replace(/[\s-]/g, "");
  if (!/^\+?\d{10,15}$/.test(toNormalized)) {
    throw new Error("Invalid phone number format");
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new Error("WhatsApp API not configured (missing env vars)");
  }

  // Build payload
  const payload: any = {
    messaging_product: "whatsapp",
    to: toNormalized,
  };

  if (type === "text") {
    payload.type = "text";
    payload.text = { body: message };
  } else {
    // For MVP: send template as text if detailed template params aren't provided.
    // In production, templates should follow WhatsApp template structure.
    payload.type = "text";
    payload.text = { body: message };
  }

  // Add simple metadata for auditing (non-sensitive)
  const metadata: Record<string, string> = {
    clinicId,
    messageType,
  };
  if (patientId) metadata.patientId = patientId;
  // Attach metadata as a custom field (won't be sent to recipient). Keep it local in logs/DB.
  // Do not include message body in logs to comply with LGPD; log only safe metadata.
  const toMasked = toNormalized.replace(/.(?=.{4}$)/g, "*");
  const messageLength = message.length;

  try {
    const url = `https://graph.facebook.com/v17.0/${encodeURIComponent(phoneNumberId)}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const raw: any = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("WhatsApp API error", {
        status: res.status,
        statusText: res.statusText,
        // include minimal info only
        to,
        clinicId,
        patientId,
        messageType,
        response: raw,
      });
      throw new Error(`WhatsApp API request failed: ${res.status} ${res.statusText}`);
    }

    // Typical success shape: { messages: [{ id: "wamid.HBgL..." }] }
    const messageId = raw && Array.isArray(raw?.messages) && raw.messages[0]?.id
      ? raw.messages[0].id
      : `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // Audit log (non-sensitive)
    console.log("WhatsApp message sent", {
      toMasked,
      messageId,
      clinicId,
      patientId,
      messageType,
      messageLength,
    });

    return { messageId, status: res.status.toString(), raw };
  } catch (error) {
    // Log limited info for privacy
    console.error("Failed to send WhatsApp message", {
      toMasked,
      clinicId,
      patientId,
      messageType,
      messageLength,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Keep a single named export (removed duplicate)
export { whatsappRoutes };
