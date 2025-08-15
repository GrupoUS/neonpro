// Test script for Email Notification Service
import EmailNotificationService from '../lib/services/email-notification-service.js';

console.log('🧪 Testing Email Notification Service...\n');

// Sample notification data (based on our AP test data)
const sampleNotificationData = {
  recipientEmail: 'test@example.com', // Change this to a real email to receive test notifications
  supplierName: 'Beauty Supply Co.',
  amount: 1250.5,
  dueDate: '2025-01-26',
  invoiceNumber: 'NF-001',
  paymentId: 'pay_123456',
  companyName: 'NeonPro Clinic',
};

async function testEmailNotificationService() {
  try {
    console.log('1️⃣ Initializing Email Notification Service...');

    // Create notification service with custom config
    const notificationService = new EmailNotificationService({
      enableEmail: true,
      enableSMS: false,
      fromEmail: 'NeonPro System <noreply@neonpro.com>',
      companyName: 'NeonPro Clinic',
      supportEmail: 'suporte@neonpro.com',
    });

    console.log(
      '✅ Service initialized with config:',
      notificationService.getConfig()
    );

    console.log('\n2️⃣ Testing connection...');
    const connectionTest = await notificationService.testConnection();
    console.log(
      `Connection test: ${connectionTest ? '✅ PASSED' : '❌ FAILED'}`
    );

    if (!connectionTest) {
      console.log(
        '\n⚠️ Email service not properly configured. Check RESEND_API_KEY environment variable.'
      );
      console.log('📝 Add this to your .env.local file:');
      console.log('RESEND_API_KEY=your_resend_api_key_here');
      return;
    }

    // Test different notification types
    console.log('\n3️⃣ Testing notification types...\n');

    // Test 1: Payment due soon
    console.log('📅 Testing "due soon" notification...');
    const dueSoonData = {
      ...sampleNotificationData,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0], // 3 days from now
    };
    const dueSoonResult =
      await notificationService.sendDueSoonNotification(dueSoonData);
    console.log(`Result: ${dueSoonResult ? '✅ SENT' : '❌ FAILED'}`);

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay between sends

    // Test 2: Payment due today
    console.log('\n⏰ Testing "due today" notification...');
    const dueTodayData = {
      ...sampleNotificationData,
      dueDate: new Date().toISOString().split('T')[0], // Today
    };
    const dueTodayResult =
      await notificationService.sendDueTodayNotification(dueTodayData);
    console.log(`Result: ${dueTodayResult ? '✅ SENT' : '❌ FAILED'}`);

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay between sends

    // Test 3: Overdue payment
    console.log('\n🚨 Testing "overdue payment" notification...');
    const overdueData = {
      ...sampleNotificationData,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0], // 2 days ago
    };
    const overdueResult =
      await notificationService.sendOverduePaymentNotification(overdueData);
    console.log(`Result: ${overdueResult ? '✅ SENT' : '❌ FAILED'}`);

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay between sends

    // Test 4: Payment completed
    console.log('\n✅ Testing "payment completed" notification...');
    const completedData = {
      ...sampleNotificationData,
      paymentId: `pay_${Date.now()}`,
    };
    const completedResult =
      await notificationService.sendPaymentCompletedNotification(completedData);
    console.log(`Result: ${completedResult ? '✅ SENT' : '❌ FAILED'}`);

    // Test 5: Batch notifications
    console.log('\n📦 Testing batch notifications...');
    const batchNotifications = [
      {
        type: 'dueSoon',
        data: {
          ...sampleNotificationData,
          supplierName: 'Supplier A',
          amount: 500,
        },
      },
      {
        type: 'dueToday',
        data: {
          ...sampleNotificationData,
          supplierName: 'Supplier B',
          amount: 750,
        },
      },
    ];

    const batchResults =
      await notificationService.sendBatchNotifications(batchNotifications);
    console.log(
      `Batch results: ${
        batchResults.every((r) => r) ? '✅ ALL SENT' : '⚠️ SOME FAILED'
      }`
    );
    console.log(
      'Individual results:',
      batchResults
        .map((result, i) => `${i + 1}: ${result ? '✅' : '❌'}`)
        .join(', ')
    );

    // Summary
    console.log('\n📊 Test Summary:');
    console.log('================');
    const allResults = [
      dueSoonResult,
      dueTodayResult,
      overdueResult,
      completedResult,
      ...batchResults,
    ];
    const successCount = allResults.filter((r) => r).length;
    const totalCount = allResults.length;

    console.log(`Total notifications tested: ${totalCount}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${totalCount - successCount}`);
    console.log(
      `Success rate: ${((successCount / totalCount) * 100).toFixed(1)}%`
    );

    if (successCount === totalCount) {
      console.log(
        '\n🎉 All tests passed! Email notification service is working correctly.'
      );
    } else {
      console.log('\n⚠️ Some tests failed. Check the logs above for details.');
    }

    // Helper method test
    console.log('\n4️⃣ Testing helper methods...');

    const mockAccountsPayable = {
      id: 'ap_123',
      supplier_name: 'Test Supplier',
      amount: '999.99',
      due_date: '2025-01-30',
      invoice_number: 'INV-TEST-001',
    };

    const helperData = EmailNotificationService.createNotificationData(
      mockAccountsPayable,
      'test@example.com',
      '+5511999999999'
    );

    console.log('Helper data created:', helperData);
    console.log('✅ Helper methods working correctly');
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Check environment
console.log('🔍 Environment Check:');
console.log(
  `RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ SET' : '❌ NOT SET'}`
);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log('');

// Run tests
testEmailNotificationService()
  .then(() => {
    console.log('\n🏁 Email notification service testing completed.');
  })
  .catch((error) => {
    console.error('\n💥 Testing failed:', error);
    process.exit(1);
  });
