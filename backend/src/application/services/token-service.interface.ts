export interface ITokenService {
  sign(payload: any, options?: { expiresIn?: string }): string;
  signRefresh(payload: any, options?: { expiresIn?: string }): string;
  verify(token: string): any;
  verifyRefresh(token: string): any;
}
