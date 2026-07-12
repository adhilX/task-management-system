export interface IEmailService {
  sendInvitation(email: string, name: string, token: string): Promise<void>;
}
