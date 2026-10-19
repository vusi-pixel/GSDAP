import nodemailer from 'nodemailer';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: MailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@onemillioncoders.io',
      to,
      subject,
      html,
    });
    logger.info({ messageId: info.messageId, to }, 'Email sent');
    return info;
  } catch (error) {
    logger.error({ error, to, subject }, 'Failed to send email');
    throw error;
  }
}

export function verificationEmailHtml(name: string, url: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">GSDAP</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Your learning journey starts here</p>
      </div>
      <h2>Welcome, ${name}! 🎉</h2>
      <p>Please verify your email address to activate your account and start learning.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    </body>
    </html>
  `;
}

export function resetPasswordEmailHtml(name: string, url: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0;">GSDAP</h1>
      </div>
      <h2>Reset Your Password</h2>
      <p>Hi ${name}, we received a request to reset your password.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </body>
    </html>
  `;
}
