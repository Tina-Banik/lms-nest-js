import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendVerificationEmail(email: string, verificationToken: string) {
    const verificationEmailUrl = `http://localhost:3000/api/v1/auth/verify-email?token=${verificationToken}`;
    console.log('The verification url =>', verificationEmailUrl);

    await this.transporter.sendMail({
      from: process.env.SMTP_EMAIL_FROM,
      to: email,
      subject: 'Verify your email address',
      html: `
                <h2>Verify Your Email</h2>
                <p>Thank ypu for registering with our LMS</p>
                <p>Please click the button below to verify the email address</p>
                <a href-${verificationEmailUrl}>Verify Your Email</a>
                <p>This email verification link will expire in 15 minutes</p>
            `,
    });
  }
}
