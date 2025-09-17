'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

export function MFAGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState('');
  const verify = async () => {
    const res = await fetch('/api/profile/mfa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const { valid } = await res.json();
    if (valid) { onSuccess(); setCode(''); } else toast.error('Invalid code');
  };
  return (
    <div className="rounded-xl bg-black/30 border border-teal-500/50 p-4">
      <Label className="text-teal-300">Enter 6-digit authenticator code</Label>
      <div className="flex gap-2 mt-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          maxLength={6}
          className="bg-black/30 border-teal-500/50"
        />
        <Button onClick={verify} disabled={code.length !== 6} className="bg-teal-600 hover:bg-teal-500 text-white">
          Verify
        </Button>
      </div>
    </div>
  );
}
