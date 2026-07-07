import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify your Waya Account',
    html: `
      <div style="font-family: sans-serif; padding: 24px; max-width: 600px;">
        <h2>Welcome to Waya!</h2>
        <p>Please verify your email address to unlock your interactive study companion.</p>
        <a href="${verificationUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 16px 0;">Verify Email</a>
        <p style="font-size: 12px; color: #64748b;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}
