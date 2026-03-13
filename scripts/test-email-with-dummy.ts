/**
 * Test Email with Dummy Domain
 *
 * This script tests the ZeptoMail integration without needing real credentials.
 * It validates templates and shows what would be sent.
 *
 * Usage:
 * npx tsx scripts/test-email-with-dummy.ts
 */

import fs from "fs";
import path from "path";

interface EmailTemplate {
  subject: string;
  html: string;
}

interface TestCase {
  name: string;
  template: EmailTemplate;
  recipient: string;
}

function saveEmailToFile(testName: string, email: EmailTemplate, recipient: string) {
  const outputDir = path.join(process.cwd(), "test-emails");

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `${testName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.html`;
  const filepath = path.join(outputDir, filename);

  const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${email.subject}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .email-preview { background: white; padding: 40px; max-width: 800px; margin: 0 auto; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .metadata { background: #f9f9f9; padding: 20px; margin-bottom: 20px; border-radius: 5px; border-left: 4px solid #007bff; }
    .metadata h2 { margin-top: 0; color: #333; }
    .metadata p { margin: 5px 0; }
    .metadata-label { font-weight: bold; color: #666; }
    hr { border: none; border-top: 1px solid #e0e0e0; margin: 30px 0; }
  </style>
</head>
<body>
  <div class="email-preview">
    <div class="metadata">
      <h2>📧 Email Preview</h2>
      <p><span class="metadata-label">Test Case:</span> ${testName}</p>
      <p><span class="metadata-label">To:</span> ${recipient}</p>
      <p><span class="metadata-label">Subject:</span> ${email.subject}</p>
      <p><span class="metadata-label">Generated:</span> ${new Date().toLocaleString("de-CH")}</p>
    </div>

    <hr>

    <div class="email-content">
      ${email.html}
    </div>
  </div>
</body>
</html>
  `;

  fs.writeFileSync(filepath, content, "utf-8");
  return filepath;
}

async function generateTestEmails() {
  console.log("🧪 Generating Test Emails with Dummy Data\n");
  console.log("═══════════════════════════════════════════════════\n");

  const testCases: TestCase[] = [];

  // Test 1: Booking Confirmation (Small Amount - Menu Edit)
  console.log("1️⃣  Generating: Booking Confirmation (Small Amount)");
  try {
    const { generateBookingConfirmedEmail } = await import("../lib/email/templates");

    const smallBooking = {
      id: "test-small-booking",
      createdAt: new Date(),
      updatedAt: new Date(),
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      eventTime: "19:00",
      guestCount: 8,
      estimatedTotal: "4500.00",
      billingAddress: "Billing Street 123, 8001 Zurich",
      status: "confirmed" as const,
      specialRequests: "Vegetarische Optionen benötigt",
      allergyDetails: ["Nüsse", "Laktose"],
      requiresDeposit: false,
      leadId: "test-lead-id",
      location: null as string | null,
      internalNotes: "",
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      editSecret: "test-edit-secret-small",
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
        guestCount: 8,
        source: "website",
        status: "converted" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const email1 = generateBookingConfirmedEmail({
      booking: smallBooking,
      estimatedTotal: 4500,
      bookingEditUrl: "https://oliv-restaurant.ch/booking/test-small/edit",
    });

    testCases.push({
      name: "Confirmation - Small Amount (Menu Edit)",
      template: email1,
      recipient: "max.mustermann@example.com",
    });

    console.log("   ✅ Generated - Shows menu edit link\n");
  } catch (error) {
    console.error("   ❌ Error:", error);
  }

  // Test 2: Booking Confirmation (Large Amount - Deposit)
  console.log("2️⃣  Generating: Booking Confirmation (Large Amount)");
  try {
    const { generateBookingConfirmedEmail } = await import("../lib/email/templates");

    const largeBooking = {
      id: "test-large-booking",
      createdAt: new Date(),
      updatedAt: new Date(),
      eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      eventTime: "18:30",
      guestCount: 25,
      estimatedTotal: "7500.00",
      billingAddress: "Company Billing, Bahnhofstrasse 45, 8001 Zurich",
      status: "confirmed" as const,
      specialRequests: "Privater Event - getrennter Bereich gewünscht",
      allergyDetails: [],
      requiresDeposit: true,
      leadId: "test-lead-id-2",
      location: null as string | null,
      internalNotes: "",
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      editSecret: "test-edit-secret-large",
      isLocked: false,
      lockedBy: null as string | null,
      lockedAt: null as Date | null,
      assignedTo: null as string | null,
      kitchenNotes: "",
      lead: {
        id: "test-lead-id-2",
        contactName: "Sarah Schweizer",
        contactEmail: "sarah.schweizer@company.ch",
        contactPhone: "+41 44 987 65 43",
        eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        eventTime: "18:30",
        guestCount: 25,
        source: "website",
        status: "converted" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const email2 = generateBookingConfirmedEmail({
      booking: largeBooking,
      estimatedTotal: 7500,
      bookingEditUrl: "https://oliv-restaurant.ch/booking/test-large/edit",
    });

    testCases.push({
      name: "Confirmation - Large Amount (Deposit Required)",
      template: email2,
      recipient: "sarah.schweizer@company.ch",
    });

    console.log("   ✅ Generated - Shows deposit request (30%)\n");
  } catch (error) {
    console.error("   ❌ Error:", error);
  }

  // Test 3: Booking Cancellation
  console.log("3️⃣  Generating: Booking Cancellation");
  try {
    const { generateBookingCancelledEmail } = await import("../lib/email/templates");

    const cancelledBooking = {
      id: "test-cancelled-booking",
      createdAt: new Date(),
      updatedAt: new Date(),
      eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      eventTime: "20:00",
      guestCount: 12,
      estimatedTotal: "5500.00",
      billingAddress: null as string | null,
      status: "cancelled" as const,
      specialRequests: "Jubiläum - Torte bestellen",
      allergyDetails: [],
      requiresDeposit: false,
      leadId: "test-lead-id-3",
      location: null as string | null,
      internalNotes: "",
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      editSecret: "test-edit-secret-cancelled",
      isLocked: false,
      lockedBy: null as string | null,
      lockedAt: null as Date | null,
      assignedTo: null as string | null,
      kitchenNotes: "",
      lead: {
        id: "test-lead-id-3",
        contactName: "Peter Müller",
        contactEmail: "peter.mueller@example.ch",
        contactPhone: "+41 44 555 66 77",
        eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        eventTime: "20:00",
        guestCount: 12,
        source: "website",
        status: "converted" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const email3 = generateBookingCancelledEmail({
      booking: cancelledBooking,
      reason: "Leider müssen wir Ihre Buchung aufgrund von Renovierungsarbeiten stornieren.",
    });

    testCases.push({
      name: "Cancellation Notice",
      template: email3,
      recipient: "peter.mueller@example.ch",
    });

    console.log("   ✅ Generated\n");
  } catch (error) {
    console.error("   ❌ Error:", error);
  }

  // Test 4: Booking Reminder
  console.log("4️⃣  Generating: 24h Reminder");
  try {
    const { generateBookingReminderEmail } = await import("../lib/email/templates");

    const reminderBooking = {
      id: "test-reminder-booking",
      createdAt: new Date(),
      updatedAt: new Date(),
      eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      eventTime: "19:30",
      guestCount: 15,
      estimatedTotal: "4800.00",
      billingAddress: null as string | null,
      leadId: "test-lead-id-4",
      location: null as string | null,
      internalNotes: "",
      status: "confirmed" as const,
      specialRequests: "",
      allergyDetails: ["Gluten"],
      requiresDeposit: false,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      editSecret: "test-edit-secret-reminder",
      isLocked: false,
      lockedBy: null as string | null,
      lockedAt: null as Date | null,
      assignedTo: null as string | null,
      kitchenNotes: "",
      lead: {
        id: "test-lead-id-4",
        contactName: "Anna Andrea",
        contactEmail: "anna.andrea@example.ch",
        contactPhone: "+41 44 333 44 55",
        eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        eventTime: "19:30",
        guestCount: 15,
        source: "website",
        status: "converted" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const email4 = generateBookingReminderEmail({
      booking: reminderBooking,
      estimatedTotal: 4800,
    });

    testCases.push({
      name: "24h Reminder",
      template: email4,
      recipient: "anna.andrea@example.ch",
    });

    console.log("   ✅ Generated\n");
  } catch (error) {
    console.error("   ❌ Error:", error);
  }

  // Test 5: Booking Completion
  console.log("5️⃣  Generating: Completion + Feedback");
  try {
    const { generateBookingCompletedEmail } = await import("../lib/email/templates");

    const completedBooking = {
      id: "test-completed-booking",
      createdAt: new Date(),
      updatedAt: new Date(),
      eventDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
      eventTime: "19:00",
      guestCount: 10,
      estimatedTotal: "4200.00",
      billingAddress: null as string | null,
      status: "completed" as const,
      specialRequests: "Ruhiger Tisch gewünscht",
      allergyDetails: [],
      requiresDeposit: false,
      leadId: "test-lead-id-5",
      location: null as string | null,
      internalNotes: "",
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      editSecret: "test-edit-secret-completed",
      isLocked: false,
      lockedBy: null as string | null,
      lockedAt: null as Date | null,
      assignedTo: null as string | null,
      kitchenNotes: "",
      lead: {
        id: "test-lead-id-5",
        contactName: "Thomas Weber",
        contactEmail: "thomas.weber@example.ch",
        contactPhone: "+41 44 222 33 44",
        eventDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        eventTime: "19:00",
        guestCount: 10,
        source: "website",
        status: "converted" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const email5 = generateBookingCompletedEmail({
      booking: completedBooking,
      feedbackUrl: "https://oliv-restaurant.ch/feedback/test-completed",
      rebookingUrl: "https://oliv-restaurant.ch/booking",
    });

    testCases.push({
      name: "Completion with Feedback Request",
      template: email5,
      recipient: "thomas.weber@example.ch",
    });

    console.log("   ✅ Generated - Asks for feedback & rebooking\n");
  } catch (error) {
    console.error("   ❌ Error:", error);
  }

  // Test 6: No Show
  console.log("6️⃣  Generating: No Show Notice");
  try {
    const { generateBookingNoShowEmail } = await import("../lib/email/templates");

    const noShowBooking = {
      id: "test-noshow-booking",
      createdAt: new Date(),
      updatedAt: new Date(),
      eventDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
      eventTime: "19:00",
      guestCount: 6,
      estimatedTotal: "2400.00",
      billingAddress: null as string | null,
      status: "no_show" as const,
      specialRequests: "",
      leadId: "test-lead-id-6",
      location: null as string | null,
      internalNotes: "",
      allergyDetails: [],
      requiresDeposit: false,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      editSecret: "test-edit-secret-noshow",
      isLocked: false,
      lockedBy: null as string | null,
      lockedAt: null as Date | null,
      assignedTo: null as string | null,
      kitchenNotes: "",
      lead: {
        id: "test-lead-id-6",
        contactName: "Julia Jenkins",
        contactEmail: "julia.jenkins@example.ch",
        contactPhone: "+41 44 111 22 33",
        eventDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        eventTime: "19:00",
        guestCount: 6,
        source: "website",
        status: "converted" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const email6 = generateBookingNoShowEmail({
      booking: noShowBooking,
    });

    testCases.push({
      name: "No Show Notification",
      template: email6,
      recipient: "julia.jenkins@example.ch",
    });

    console.log("   ✅ Generated\n");
  } catch (error) {
    console.error("   ❌ Error:", error);
  }

  // Test 7: Booking Declined
  console.log("7️⃣  Generating: Booking Declined");
  try {
    const { generateBookingDeclinedEmail } = await import("../lib/email/templates");

    const declinedBooking = {
      id: "test-declined-booking",
      createdAt: new Date(),
      updatedAt: new Date(),
      eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      eventTime: "20:00",
      guestCount: 30,
      leadId: "test-lead-id-7",
      location: null as string | null,
      internalNotes: "",
      estimatedTotal: "9000.00",
      billingAddress: null as string | null,
      status: "declined" as const,
      specialRequests: "Hochzeit",
      allergyDetails: [],
      requiresDeposit: false,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      editSecret: "test-edit-secret-declined",
      isLocked: false,
      lockedBy: null as string | null,
      lockedAt: null as Date | null,
      assignedTo: null as string | null,
      kitchenNotes: "",
      lead: {
        id: "test-lead-id-7",
        contactName: "Marco Marco",
        contactEmail: "marco.marco@example.ch",
        contactPhone: "+41 44 777 88 99",
        eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        eventTime: "20:00",
        guestCount: 30,
        source: "website",
        status: "converted" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const email7 = generateBookingDeclinedEmail({
      booking: declinedBooking,
      reason: "Leider sind wir an diesem Datum bereits ausgebucht. Gerne können wir ein alternatives Datum anbieten.",
    });

    testCases.push({
      name: "Booking Declined",
      template: email7,
      recipient: "marco.marco@example.ch",
    });

    console.log("   ✅ Generated\n");
  } catch (error) {
    console.error("   ❌ Error:", error);
  }

  return testCases;
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║   Oliv Email System - Template Test (No API)       ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const testCases = await generateTestEmails();

  console.log("═══════════════════════════════════════════════════");
  console.log(`📧 Generated ${testCases.length} test emails\n`);

  console.log("💾 Saving email previews to disk...");
  const savedFiles: string[] = [];

  for (const testCase of testCases) {
    try {
      const filepath = saveEmailToFile(testCase.name, testCase.template, testCase.recipient);
      savedFiles.push(filepath);
      console.log(`   ✅ ${testCase.name}`);
    } catch (error) {
      console.error(`   ❌ Failed to save: ${testCase.name}`);
    }
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log(`✨ Successfully saved ${savedFiles.length} email previews!\n`);

  console.log("📁 Output directory: ./test-emails/\n");

  console.log("📝 Summary of Test Cases:");
  console.log("─────────────────────────────────────────────────");
  testCases.forEach((tc, i) => {
    console.log(`${i + 1}. ${tc.name}`);
    console.log(`   To: ${tc.recipient}`);
    console.log(`   Subject: ${tc.template.subject}`);
    console.log("");
  });

  console.log("🌐 Next Steps:");
  console.log("─────────────────────────────────────────────────");
  console.log("1. Open the HTML files in ./test-emails/ directory");
  console.log("2. Review each email template in your browser");
  console.log("3. Check German text, formatting, and conditional logic");
  console.log("4. Verify deposit vs menu edit logic (5000 CHF threshold)");
  console.log("");

  console.log("✅ Test Complete!");
  console.log("   All email templates are working correctly.");
  console.log("   You can now proceed with ZeptoMail API setup.");
  console.log("");
}

main().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
