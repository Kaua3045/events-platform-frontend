export interface AuthSession {
  frontendSession?: AuthSessionType;
  userSession?: AuthSessionType;
}

export type AuthSessionType = {
  id: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: string;
};

declare module "h3" {
  interface H3EventContext {
    authSession: AuthSession;
  }
}
