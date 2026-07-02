import nodemailer from 'nodemailer';

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[email] SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('[email] Skipping send — SMTP not configured.');
    return;
  }

  const fromName = process.env.SMTP_FROM_NAME ?? 'Waya';
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? (process.env.SMTP_USER || 'noreply@waya.app');

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html ?? params.text,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  await sendEmail({
    to: email,
    subject: 'Welcome to Waya!',
    text: `Hi ${name},\n\nWelcome to Waya! Your knowledge map is ready.\n\nStart your first synthesis at ${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/study\n\n— The Waya team`,
    html: `<p>Hi ${name},</p><p>Welcome to Waya! Your knowledge map is ready.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/study">Start your first synthesis →</a></p><p>— The Waya team</p>`,
  });
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  await sendEmail({
    to: email,
    subject: 'Reset your Waya password',
    text: `Reset your password here: ${resetLink}`,
    html: `<p><a href="${resetLink}">Reset your password</a></p><p>If you didn't request this, you can ignore this email.</p>`,
  });
}
