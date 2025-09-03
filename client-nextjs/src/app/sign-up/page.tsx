'use client';

import { CredentialSignUp, OAuthButton } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PostLoginRedirect } from '@/components/PostLoginRedirect';
import { useUser } from '@stackframe/stack';

export default function SignUpPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const user = useUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (user) {
    return <PostLoginRedirect />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] dark:bg-[#1E2A44]">
      <Card className="w-full max-w-md border-[#E2E8F0] dark:border-[#2E7D7D]/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#1E2A44] dark:text-[#E2E8F0] text-center">
            Sign Up for MutSyncHub
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google OAuth Sign-up Button */}
          {isClient && <OAuthButton provider="google" type="sign-up" />}
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#E2E8F0] dark:border-[#2E7D7D]/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#F7FAFC] dark:bg-[#1E2A44] px-2 text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Credential Sign-up Form */}
          {isClient && (
            <CredentialSignUp
              noPasswordRepeat
            />
          )}
          <span
            className="underline text-blue-600 cursor-pointer"
            onClick={() => router.replace('/sign-in')}
          >
            Go to Sign In
          </span>
        </CardContent>
      </Card>
    </div>
  );
}