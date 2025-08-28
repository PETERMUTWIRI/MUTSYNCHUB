// app/(main)/layout.tsx
'use client';

import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import FloatingHomeButton from '@/components/ui/FloatingHomeButton';
import { useEffect, useState } from 'react';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('MainLayout rendering');
  }, []);

  if (error) {
    return (
      <div className="bg-neutral-950 min-h-screen flex items-center justify-center">
        <p className="text-red-400">Error in layout: {error}</p>
      </div>
    );
  }

  try {
    return (
      <div className="bg-neutral-950 min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex-col">{children}</div>
        <FloatingHomeButton />
        <Footer />
      </div>
    );
  } catch (err) {
    if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
      setError((err as { message: string }).message);
    } else {
      setError('An unknown error occurred.');
    }
    return null;
  }
}