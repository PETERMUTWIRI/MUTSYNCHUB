import { UserProfile } from '@prisma/client';

export type EnrichedUserProfile = {
  id: string;
  userId: string;
  orgId: string;
  role: string;
  status: string;
  firstName: string | null;
  lastName: string | null;
  mfaEnabled: boolean;
  mfaSecret: string | null;
  mfaPendingSecret: string | null;
  mfaBackupCodes: string | null;
  failedLoginAttempts: number;
  refreshTokenHash: string | null;
  resetTokenHash: string | null;
  resetTokenExpiresAt: Date | null;
  featureFlags: any | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Auth sync fields
  auth_user_id: string;
  auth_user_name: string | null;
  auth_user_email: string | null;
};

// Type for request with enriched user
export interface RequestWithUser extends Request {
  user: EnrichedUserProfile;
}
