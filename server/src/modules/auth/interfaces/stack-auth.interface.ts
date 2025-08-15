export interface StackAuthConfig {
  projectId: string;
  serverKey: string;
}

export interface StackAuthUser {
  userId: string;
  email: string;
  name: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}
