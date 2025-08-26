// Test script for Email Notification Service
import EmailNotificationService from "../lib/services/email-notification-service.js";

// Sample notification data (based on our AP test data)
const sampleNotificationData = {
  recipientEmail: "test@example.com", // Change this to a real email to receive test notifications
  supplierName: "Beauty Supply Co.",
  amount: 1250.5,
  dueDate: "2025-01-26",
  invoiceNumber: "NF-001",
  paymentId: "pay_123456",
  companyName: "NeonPro Clinic",
};

async function testEmailNotificationService() {
  try {
    // Create notification service with custom config
    const notificationService = new EmailNotificationService({
      enableEmail: true,
      enableSMS: false,
      fromEmail: "NeonPro System <noreply@neonpro.com>",
      companyName: "NeonPro Clinic",
      supportEmail: "suporte@neonpro.com",
    });
    const connectionTest = await notificationService.testConnection();

    if (!connectionTest) {
      return;
    }
    const dueSoonData = {
      ...sampleNotificationData,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 3 days from now
    };
    const dueSoonResult =
      await notificationService.sendDueSoonNotification(dueSoonData);

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay between sends
    const dueTodayData = {
      ...sampleNotificationData,
      dueDate: new Date().toISOString().split("T")[0], // Today
    };
    const dueTodayResult =
      await notificationService.sendDueTodayNotification(dueTodayData);

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay between sends
    const overdueData = {
      ...sampleNotificationData,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 2 days ago
    };
    const overdueResult =
      await notificationService.sendOverduePaymentNotification(overdueData);

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay between sends
    const completedData = {
      ...sampleNotificationData,
      paymentId: `pay_${Date.now()}`,
    };
    const completedResult =
      await notificationService.sendPaymentCompletedNotification(completedData);
    const batchNotifications = [
      {
        type: "dueSoon",
        data: {
          ...sampleNotificationData,
          supplierName: "Supplier A",
          amount: 500,
        },
      },
      {
        type: "dueToday",
        data: {
          ...sampleNotificationData,
          supplierName: "Supplier B",
          amount: 750,
        },
      },
    ];

    const batchResults =
      await notificationService.sendBatchNotifications(batchNotifications);
    const allResults = [
      dueSoonResult,
      dueTodayResult,
      overdueResult,
      completedResult,
      ...batchResults,
    ];
    const successCount = allResults.filter((r) => r).length;
    const totalCount = allResults.length;

    if (successCount === totalCount) {
    } else {
    }

    const mockAccountsPayable = {
      id: "ap_123",
      supplier_name: "Test Supplier",
      amount: "999.99",
      due_date: "2025-01-30",
      invoice_number: "INV-TEST-001",
    };

    const _helperData = EmailNotificationService.createNotificationData(
      mockAccountsPayable,
      "test@example.com",
      "+5511999999999",
    );
  } catch (_error) {}
}

// Run tests
testEmailNotificationService()
  .then(() => {})
  .catch((_error) => {
    process.exit(1);
  });
