import nodemailer from 'nodemailer';
import { getInvitationTemplate } from './invitation-template';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
    }
  }

  async sendInvitation(email: string, name: string, token: string): Promise<void> {
    const inviteLink = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/invite/${token}`;
    const { subject, text, html } = getInvitationTemplate(name, inviteLink);

    console.log('====================================');
    console.log(`Sending Invitation to: ${email}`);
    console.log(`Invite Link: ${inviteLink}`);
    console.log('====================================');

    if (this.transporter) {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"TaskFlow" <no-reply@taskflow.com>',
        to: email,
        subject,
        text,
        html,
      });
    } else {
      console.log('SMTP not fully configured. Email invitation print to logs above.');
    }
  }
}
