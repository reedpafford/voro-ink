import nodemailer from "nodemailer";

/**
 * Gmail SMTP transport
 * - Uses your env: GMAIL_USER, GMAIL_APP_PASSWORD, MAIL_FROM
 * - We keep things light on typing because the build runs fine without @types/nodemailer
 */
const FROM = process.env.MAIL_FROM || `Voro (Reed) <${process.env.GMAIL_USER}>`;
const GMAIL_USER = process.env.GMAIL_USER!;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD!;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
});

/**
 * Build the intake link. Priority:
 *  1) explicitly passed base (from the incoming Request origin)
 *  2) NEXT_PUBLIC_SITE_URL (env per environment: Preview/Production)
 *  3) localhost (dev fallback)
 */
export function intakeLink(token: string, base?: string) {
  const fallback = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const b = (base || fallback).replace(/\/$/, "");
  return `${b}/i?token=${encodeURIComponent(token)}`;
}

/** Email Reed when a new inquiry hits */
export async function notifyOwner(email: string) {
  await transporter.sendMail({
    from: FROM,
    to: process.env.NOTIFY_TO_EMAIL || GMAIL_USER,
    subject: "New inquiry",
    html: `<p>New inquiry from <strong>${email}</strong></p>`,
  });
}

/** Auto-reply to the visitor with the intake link */
export async function autoReply(email: string, token?: string, base?: string) {
  const link = token ? intakeLink(token, base) : "";
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Quick intake form — Voro",
    html: `
      <p>Thanks for reaching out to Voro!</p>
      <p>To help us reply with the right plan and estimate, please answer a few quick questions.</p>
      ${link ? `<p><a href="${link}" style="display:inline-block;padding:12px 16px;border-radius:10px;background:#111;color:#fff;text-decoration:none">Open quick intake form</a></p>` : ""}
      ${link ? `<p>If the button doesn’t work, copy this link:<br>${link}</p>` : ""}
      <p>— Voro (Reed)</p>
    `,
    replyTo: FROM,
  });
}

/** Send the submitted intake answers to Reed */
export async function sendIntakeToOwner(
  email: string,
  fields: Record<string, string | undefined>
) {
  const rows = Object.entries(fields)
    .filter(([, v]) => v && String(v).trim().length)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 8px;"><strong>${k}</strong></td><td style="padding:4px 8px;">${v}</td></tr>`
    )
    .join("");

  await transporter.sendMail({
    from: FROM,
    to: process.env.NOTIFY_TO_EMAIL || GMAIL_USER,
    subject: `Intake submitted — ${email}`,
    html: `<p>Intake submitted by <strong>${email}</strong>:</p><table>${rows}</table>`,
  });
}

