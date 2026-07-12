export const getInvitationTemplate = (name: string, inviteLink: string) => {
  const subject = 'Invitation to TaskFlow';
  const text = `Hello ${name},\n\nYou have been invited to TaskFlow.\n\nClick the link below to activate your account:\n\n${inviteLink}\n\nThis invitation expires in 24 hours.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1e293b;">
      <h2 style="color: #4f46e5; margin-bottom: 24px; font-size: 20px; font-weight: bold;">Welcome to TaskFlow!</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>You have been invited to join the TaskFlow Task & Project Management System.</p>
      <p style="margin: 24px 0;">
        <a href="${inviteLink}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Activate Account</a>
      </p>
      <p style="font-size: 12px; color: #64748b; line-height: 1.5;">Or copy and paste this link in your browser: <br/> 
        <a href="${inviteLink}" style="color: #4f46e5; word-break: break-all;">${inviteLink}</a>
      </p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #64748b;">This invitation link will expire in 24 hours.</p>
    </div>
  `;

  return { subject, text, html };
};
