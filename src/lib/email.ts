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

/* ------------------------------------------------------------------ */
/* Legacy + new API: sendIntakeToOwner supports 1 or 2 arguments.     */
/*  - sendIntakeToOwner(intakeObj)                                    */
/*  - sendIntakeToOwner(email, fieldsObj)                             */
/* ------------------------------------------------------------------ */
export function sendIntakeToOwner(
  intake: any
): Promise<unknown>;
export function sendIntakeToOwner(
  email: string,
  fields: Record<string, any>
): Promise<unknown>;
export async function sendIntakeToOwner(
  a: any,
  b?: Record<string, any>
) {
  if (!OWNER_TO) {
    const err: any = new Error("Owner email not configured (MAIL_TO/NOTIFY_TO_EMAIL).");
    err.code = "mail_config_missing";
    throw err;
  }

  // Normalize args to a single intake object
  const intake =
    typeof a === "string" ? { email: a, ...(b || {}) } : (a || {});

  const subject =
    "New brief — " +
    (safeString((intake as any)?.company) ||
      safeString((intake as any)?.email) ||
      "Incoming");

  const entries = Object.entries(intake);
  const rowsHtml = entries
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 10px;"><b>${escapeHtml(
          k
        )}</b></td><td style="padding:6px 10px;">${escapeHtml(
          safeString(v)
        )}</td></tr>`
    )
    .join("");

  const html = `
    <h2 style="margin:0 0 12px;font-family:Inter,system-ui,Segoe UI,Arial,sans-serif">New brief</h2>
    <table cellpadding="0" cellspacing="0" style="font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;border-collapse:collapse;border:1px solid #eee;">
      ${rowsHtml}
    </table>
  `;

  const text =
    entries.map(([k, v]) => `${k}: ${safeString(v)}`).join("\n") ||
    "No fields provided.";

  const replyTo =
    typeof (intake as any)?.email === "string" ? (intake as any).email : undefined;

  return sendMail({
    to: OWNER_TO,
    subject,
    text,
    html,
    replyTo,
  });
}

/* You still have the newer helpers available */
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

/* utils */
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



