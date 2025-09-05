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

// Accept either naming scheme for envs
const GMAIL_USER = process.env.GMAIL_USER || "";
const GMAIL_PASS =
  process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD || "";
const DEFAULT_FROM =
  process.env.MAIL_FROM || (GMAIL_USER ? `Voro (Reed) <${GMAIL_USER}>` : "");
const OWNER_TO =
  process.env.MAIL_TO || process.env.NOTIFY_TO_EMAIL || GMAIL_USER || "";

// One reusable transporter (server runtime only)
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
      "Mail configuration missing: GMAIL_USER / GMAIL_PASS (or GMAIL_APP_PASSWORD) / MAIL_FROM"
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
 * Legacy/back-compat helper expected by older /api/intake code.
 * Accepts any intake payload and emails it to the owner.
 */
export async function sendIntakeToOwner(intake: any) {
  if (!OWNER_TO) {
    const err: any = new Error("Owner email not configured (MAIL_TO/NOTIFY_TO_EMAIL).");
    err.code = "mail_config_missing";
    throw err;
  }

  // Flatten object into key/value rows
  const entries = Object.entries(intake || {});
  const subject =
    "New brief — " +
    (safeString(intake?.company) ||
      safeString(intake?.email) ||
      "Incoming");

  const rowsHtml = entries
    .map(([k, v]) => {
      const key = escapeHtml(k);
      const val = escapeHtml(safeString(v));
      return `<tr><td style="padding:6px 10px;"><b>${key}</b></td><td style="padding:6px 10px;">${val}</td></tr>`;
    })
    .join("");

  const html = `
    <h2 style="margin:0 0 12px;font-family:Inter,system-ui,Segoe UI,Arial,sans-serif">New brief</h2>
    <table cellpadding="0" cellspacing="0" style="font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;border-collapse:collapse;border:1px solid #eee;">
      ${rowsHtml}
    </table>
  `;

  const text =
    entries
      .map(([k, v]) => `${k}: ${safeString(v)}`)
      .join("\n") || "No fields provided.";

  // Prefer the submitter as reply-to if present
  const replyTo = safeString(intake?.email) || undefined;

  return sendMail({
    to: OWNER_TO,
    subject,
    text,
    html,
    replyTo,
  });
}

/**
 * You can still use these in newer routes.
 */
export async function notifyOwner(inquirerEmail: string) {
  if (!OWNER_TO) {
    const err: any = new Error("Owner email not configured.");
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
  return sendMail({ to: OWNER_TO, subject, text, html, replyTo: inquirerEmail });
}

export async function autoReply(toEmail: string, token: string, origin: string) {
  const briefUrl = `${origin}/i?email=${encodeURIComponent(
    toEmail
  )}&t=${encodeURIComponent(token)}`;
  const subject = "Thanks — tell us a bit about your project";
  const text =
    `Thanks for reaching out to Voro!\n\n` +
    `Please complete a short brief so we can respond quickly:\n${briefUrl}\n\n` +
    `If the link doesn't open, copy/paste it into your browser.\n\n— Voro`;
  const html = `
    <div style="font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;line-height:1.5">
      <p>Thanks for reaching out to <b>Voro</b>!</p>
      <p>Please complete a short brief so we can respond quickly:</p>
      <p><a href="${briefUrl}" style="display:inline-block;background:#111;color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none">Open project brief</a></p>
      <p style="color:#666;margin-top:10px">If the button doesn't open, copy/paste this URL:<br/><a href="${briefUrl}">${briefUrl}</a></p>
      <p>— Voro</p>
    </div>
  `;
  return sendMail({ to: toEmail, subject, text, html });
}

// ---------- utils ----------
function escapeHtml(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function safeString(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}


