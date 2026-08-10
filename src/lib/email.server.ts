import nodemailer from "nodemailer";

// Server-only email sending via Zoho SMTP (contact@careerspace.co.in).
// Never import this module from client code — it uses Node SMTP.

const config = {
  host: process.env["ZOHO_SMTP_HOST"] ?? "smtp.zoho.in",
  port: Number(process.env["ZOHO_SMTP_PORT"] ?? 465),
  secure: true,
  user: process.env["ZOHO_SMTP_USER"] ?? "contact@careerspace.co.in",
  pass: process.env["ZOHO_SMTP_PASS"] ?? "",
};

function transporter() {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });
}

export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  /** Optional List-Unsubscribe header value — helps Gmail/Outlook classify as a newsletter, not spam. */
  listUnsubscribe?: string;
};

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!config.pass) throw new Error("ZOHO_SMTP_PASS is not set. Add your Zoho app-specific password.");
  const transport = transporter();
  await transport.sendMail({
    from: `"Career Space" <${config.user}>`,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html ?? payload.text,
    replyTo: config.user,
    headers: payload.listUnsubscribe
      ? { "List-Unsubscribe": payload.listUnsubscribe }
      : undefined,
  });
}
