"use client";
import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';

export default function CallBackendOnAuth({ endpoint = '/api/users/me' }: { endpoint?: string }) {
  const user = useUser({ or: 'redirect' } as any);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    async function callBackend() {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const { accessToken } = await (user as any).getAuthJson();
        console.log('CallBackendOnAuth: accessToken', accessToken);
        const res = await fetch(endpoint, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'x-stack-access-token': accessToken,
            'Authorization': `Bearer ${accessToken}`, // Add for compatibility
            'Accept': 'application/json',
          },
        });
        const responseText = await res.text();
        console.debug('CallBackendOnAuth:', endpoint, 'status=', res.status, 'response=', responseText);
        if (!mounted) return;
        if (!res.ok) {
          setError(`Backend error ${res.status}: ${responseText}`);
          setLoading(false);
          return;
        }
        const ct = res.headers.get('content-type') || '';
        let json: any = null;
        if (ct.includes('application/json')) {
          json = JSON.parse(responseText);
        } else {
          json = responseText;
        }
        setData(json);
      } catch (err: any) {
        console.error('Error:', err);
        setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (user) callBackend();

    return () => {
      mounted = false;
    };
  }, [user, endpoint]);

  return null;
}