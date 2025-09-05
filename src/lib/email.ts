// src/lib/email.ts
import nodemailer from "nodemailer";

export type SendMailInput = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  from?: string;
};

const GMAIL_USER = process.env.GMAIL_USER || "";
const GMAIL_PASS = process.env.GMAIL_PASS || "";
const DEFAULT_FROM =
  process.env.MAIL_FROM || (GMAIL_USER ? `Voro (Reed) <${GMAIL_USER}>` : "");
const OWNER_TO = process.env.MAIL_TO || GMAIL_USER;

// Reusable transporter (Node / server runtime only)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

export async function sendMail({
  to,
  subject,
  text,
  html,
  replyTo,
  from,
}: SendMailInput) {
  if (!GMAIL_USER || !GMAIL_PASS || !DEFAULT_FROM) {
    const err: any = new Error(
      "Mail not configured. Set GMAIL_USER, GMAIL_PASS (app password), MAIL_FROM."
    );
    err.code = "mail_config_missing";
    throw err;
  }

  return transporter.sendMail({
    from: from || DEFAULT_FROM,
    to,
    subject,
    text: text ?? (html ? html.replace(/<[^>]+>/g, "") : ""),
    html,
    replyTo,
  });
}

/**
 * Sends you a heads-up that someone entered their email on the landing page.
 */
export async function notifyOwner(inquirerEmail: string) {
  if (!OWNER_TO) {
    const err: any = new Error("MAIL_TO not set");
    err.code = "mail_config_missing";
    throw err;
  }

  const subject = `New inquiry — ${inquirerEmail}`;
  const text = `A new inquiry was received.\n\nEmail: ${inquirerEmail}\nTime: ${new Date().toISOString()}`;
  const html = `
    <h2 style="margin:0 0 10px;font-family:Inter,system-ui,Segoe UI,Arial,sans-serif">New inquiry</h2>
    <p style="margin:0 0 8px">Email: <b>${escapeHtml(inquirerEmail)}</b></p>
    <p style="margin:0;color:#666">Time: ${new Date().toISOString()}</p>
  `;

  return sendMail({
    to: OWNER_TO,
    subject,
    text,
    html,
    replyTo: inquirerEmail,
  });
}

/**
 * Sends the submitter a link to the project brief (/i) using a signed token.
 */
export async function autoReply(toEmail: string, token: string, origin: string) {
  const briefUrl = `${origin}/i?email=${encodeURIComponent(
    toEmail
  )}&t=${encodeURIComponent(token)}`;

  const subject = "Thanks — tell us a bit about your project";
  const text = [
    `Thanks for reaching out to Voro!`,
    ``,
    `Please complete a short brief so we can respond quickly:`,
    briefUrl,
    ``,
    `If the link doesn't open, copy/paste it into your browser.`,
    ``,
    `— Voro`,
  ].join("\n");

  const html = `
    <div style="font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;line-height:1.5">
      <p>Thanks for reaching out to <b>Voro</b>!</p>
      <p>Please complete a short brief so we can respond quickly:</p>
      <p><a href="${briefUrl}" style="display:inline-block;background:#111;color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none">Open project brief</a></p>
      <p style="color:#666;margin-top:10px">If the button doesn't open, copy/paste this URL:<br/><a href="${briefUrl}">${briefUrl}</a></p>
      <p>— Voro</p>
    </div>
  `;

  return sendMail({
    to: toEmail,
    subject,
    text,
    html,
  });
}

function escapeHtml(s: string) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

