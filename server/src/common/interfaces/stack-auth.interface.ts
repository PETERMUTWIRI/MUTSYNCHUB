export interface StackAuthUser {
  id: string;
  email: string;
  orgId: string;
  roles: string[];
  permissions: string[];
  metadata?: Record<string, any>;
}

export interface StackAuthTokenPayload {
  sub: string; // user id
  email: string;
  org_id: string;
  roles: string[];
  permissions: string[];
  metadata?: Record<string, any>;
  exp: number;
  iat: number;
  iss: string;
}

export interface StackAuthContext {
  user: StackAuthUser;
  token: string;
}
