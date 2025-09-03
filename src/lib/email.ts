import nodemailer from "nodemailer";

const FROM = process.env.MAIL_FROM || `Voro (Reed) <${process.env.GMAIL_USER}>`;
const GMAIL_USER = process.env.GMAIL_USER!;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD!;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
});

export async function notifyOwner(email: string) {
  await transporter.sendMail({
    from: FROM,
    to: process.env.NOTIFY_TO_EMAIL || GMAIL_USER,
    subject: "New inquiry",
    html: `<p>New inquiry from <strong>${email}</strong></p>`,
  });
}

export function intakeLink(token: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/i?token=${encodeURIComponent(token)}`;
}

export async function autoReply(email: string, token?: string) {
  const link = token ? intakeLink(token) : "";
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Quick intake form - Reed",
    html: `
      <p>Thanks for reaching out!</p>
      <p>To help me reply with the right plan and estimate, please answer a few quick questions.</p>
      ${link ? `<p><a href="${link}" style="display:inline-block;padding:12px 16px;border-radius:10px;background:#111;color:#fff;text-decoration:none">Open quick intake form</a></p>` : ""}
      ${link ? `<p>If the button doesn’t work, copy this link:<br>${link}</p>` : ""}
      <p>— Reed</p>
    `,
    replyTo: FROM,
  });
}

export async function sendIntakeToOwner(email: string, fields: Record<string,string|undefined>) {
  const rows = Object.entries(fields)
    .filter(([,v]) => v && String(v).trim().length)
    .map(([k,v]) => `<tr><td style="padding:4px 8px;"><strong>${k}</strong></td><td style="padding:4px 8px;">${v}</td></tr>`)
    .join("");
  await transporter.sendMail({
    from: FROM,
    to: process.env.NOTIFY_TO_EMAIL || GMAIL_USER,
    subject: `Intake submitted — ${email}`,
    html: `<p>Intake submitted by <strong>${email}</strong>:</p><table>${rows}</table>`,
  });
}
