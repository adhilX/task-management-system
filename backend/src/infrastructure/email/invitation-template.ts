export const getInvitationTemplate = (name: string, inviteLink: string) => {
  const subject = 'Invitation to TaskFlow';
  const text = `Hello ${name},\n\nYou have been invited to TaskFlow.\n\nClick the link below to activate your account:\n\n${inviteLink}\n\nThis invitation expires in 24 hours.`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 40px auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #334155; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
      <!-- Header / Logo -->
      <div style="margin-bottom: 32px; text-align: center;">
        <div style="display: inline-block; padding: 8px 16px; background-color: #f1f5f9; border-radius: 9999px; font-size: 12px; font-weight: 600; color: #6366f1; letter-spacing: 0.05em; text-transform: uppercase;">
          TaskFlow Portal
        </div>
      </div>

      <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; margin: 0 0 16px 0; text-align: center;">
        Activate Your Account
      </h1>
      
      <p style="font-size: 15px; line-height: 24px; color: #334155; margin: 0 0 24px 0;">
        Hello <strong>${name}</strong>,
      </p>
      
      <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 24px 0;">
        You have been invited to join the <strong>TaskFlow</strong> Task & Project Management platform as an employee. To initialize your profile and set up your password, click the button below:
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${inviteLink}" style="background-color: #6366f1; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);">
          Set Password & Activate
        </a>
      </div>
      
      <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 32px 0 0 0; text-align: center;">
        If the button doesn't work, copy and paste this URL into your web browser:
        <br />
        <a href="${inviteLink}" style="color: #6366f1; text-decoration: none; word-break: break-all; font-weight: 500; display: inline-block; margin-top: 8px;">
          ${inviteLink}
        </a>
      </p>
      
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
      
      <div style="text-align: center;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0 0 4px 0;">
          This activation link will automatically expire in 24 hours.
        </p>
        <p style="font-size: 12px; color: #cbd5e1; margin: 0;">
          &copy; ${new Date().getFullYear()} TaskFlow Inc. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return { subject, text, html };
};
