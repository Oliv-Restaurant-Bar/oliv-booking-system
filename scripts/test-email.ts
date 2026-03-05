/**
 * Test Email Script
 *
 * Run this script to test your ZeptoMail integration:
 * npx tsx scripts/test-email.ts
 *
 * Make sure to set up your .env with ZEPTOMAIL_API_TOKEN first
 */

import { validateEmailConfig, sendEmail } from "../lib/email/zeptomail";

async function testEmailConfiguration() {
  console.log("🧪 Testing ZeptoMail Email Configuration\n");

  // Check environment configuration
  console.log("1️⃣ Checking environment variables...");
  const config = validateEmailConfig();

  if (!config.valid) {
    console.error("❌ Configuration invalid. Missing variables:");
    config.missing.forEach((missing) => {
      console.error(`   - ${missing}`);
    });
    console.log("\nPlease add these to your .env file");
    return false;
  }

  console.log("✅ Environment variables configured\n");

  // Send test email
  console.log("2️⃣ Sending test email...");

  const testEmail = process.env.TEST_EMAIL || "test@example.com";

  const result = await sendEmail({
    to: testEmail,
    subject: "🧪 Test Email - Oliv Booking System",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { color: #28a745; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✅ Test Successful!</h1>
          </div>
          <div class="content">
            <p>Hallo!</p>
            <p>Dies ist eine Test-E-Mail vom <span class="success">Oliv Booking System</span>.</p>
            <p><strong>Wenn Sie diese E-Mail erhalten haben, ist Ihre ZeptoMail-Konfiguration korrekt!</strong></p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 14px; color: #666;">
              <strong>Konfiguration Details:</strong><br>
              • ZeptoMail API: Verbunden<br>
              • Absender: ${process.env.ZEPTOMAIL_FROM_EMAIL}<br>
              • Sendezeit: ${new Date().toLocaleString("de-CH")}
            </p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p>Mit freundlichen Grüßen,<br>Ihr Oliv-Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  if (!result.success) {
    console.error("❌ Failed to send test email");
    console.error(`   Error: ${result.error}`);
    console.log("\nTroubleshooting:");
    console.log("1. Check if ZEPTOMAIL_API_TOKEN is correct");
    console.log("2. Verify your domain is confirmed in ZeptoMail");
    console.log("3. Check ZeptoMail dashboard for any issues");
    return false;
  }

  console.log("✅ Test email sent successfully!");
  console.log(`   To: ${testEmail}`);
  console.log(`   Message ID: ${result.messageId}`);
  console.log("\n📬 Please check your inbox (and spam folder) for the test email.");

  return true;
}

async function testBookingEmail() {
  console.log("\n3️⃣ Testing booking email templates...");

  // Import booking email functions
  const { generateBookingConfirmedEmail } = await import("../lib/email/templates");

  const testBooking = {
    id: "test-booking-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    eventTime: "19:00",
    guestCount: 10,
    estimatedTotal: "4500.00",
    status: "confirmed" as const,
    specialRequests: "Vegetarische Optionen benötigt",
    allergyDetails: ["Nüsse", "Laktose"],
    requiresDeposit: false,
    leadId: "test-lead-id",
    location: null as string | null,
    internalNotes: "",
    termsAccepted: true,
    termsAcceptedAt: new Date(),
    editSecret: "test-edit-secret",
    isLocked: false,
    lockedBy: null as string | null,
    lockedAt: null as Date | null,
    assignedTo: null as string | null,
    kitchenNotes: "",
    lead: {
      id: "test-lead-id",
      contactName: "Max Mustermann",
      contactEmail: "max.mustermann@example.com",
      contactPhone: "+41 44 123 45 67",
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      eventTime: "19:00",
      guestCount: 10,
      source: "website",
      status: "converted" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const email = generateBookingConfirmedEmail({
    booking: testBooking,
    estimatedTotal: 4500,
    bookingEditUrl: "https://oliv-restaurant.ch/booking/test/edit",
  });

  console.log("✅ Booking confirmation email template generated");
  console.log(`   Subject: ${email.subject}`);
  console.log(`   HTML length: ${email.html.length} characters`);

  return true;
}

async function main() {
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║  Oliv Booking System - Email Configuration Test   ║");
  console.log("╚════════════════════════════════════════════════════╝\n");

  const configOk = await testEmailConfiguration();
  if (!configOk) {
    process.exit(1);
  }

  await testBookingEmail();

  console.log("\n✨ All tests completed!");
  console.log("\n📝 Next Steps:");
  console.log("   1. Check your email inbox");
  console.log("   2. Update account details in email templates");
  console.log("   3. Set up cron job for automatic reminders");
  console.log("   4. Test with real booking status changes");
}

// Run tests
main().catch((error) => {
  console.error("❌ Test failed with error:", error);
  process.exit(1);
});
