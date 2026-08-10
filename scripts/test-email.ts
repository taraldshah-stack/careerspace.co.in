// One-off test send to verify Zoho SMTP + deliverability.
// Run:  bun --env-file=.env scripts/test-email.ts
import { sendEmail } from "../src/lib/email.server";

const to = process.env["TEST_EMAIL_TO"] ?? "yatharthchauhan2024@gmail.com";

const text = `Hi,

This is a test email from Career Space (contact@careerspace.co.in).

It's sent to confirm that emails from our site are delivered properly and land in the inbox rather than spam. If you can see this, Zoho SMTP is working.

Reply if you didn't expect this or want to unsubscribe.

Thanks,
The Career Space team`;

const html = `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #151e33;">
    <h2 style="color: #151e33;">Career Space</h2>
    <p>Hi,</p>
    <p>This is a test email from <strong>contact@careerspace.co.in</strong>.</p>
    <p>It's sent to confirm that emails from our site are delivered properly and land in the inbox rather than spam. If you can see this, Zoho SMTP is working.</p>
    <p style="color:#666;">Reply if you didn't expect this or want to unsubscribe.</p>
    <p style="color:#666;">Thanks,<br/>The Career Space team</p>
  </div>`;

try {
  await sendEmail({
    to,
    subject: "Test email from Career Space — please check your inbox",
    text,
    html,
    listUnsubscribe: "<mailto:contact@careerspace.co.in?subject=unsubscribe>",
  });
  console.log("SUCCESS: email sent to", to);
} catch (err) {
  console.error("FAILED to send:", err instanceof Error ? err.message : err);
  process.exit(1);
}
