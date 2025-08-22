// app/(main)/layout.tsx
'use client';

import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import FloatingHomeButton from '@/components/ui/FloatingHomeButton';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log('MainLayout rendering');
  return (
    <div className="bg-neutral-950 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex-col">
        {children}
      </div>
      <FloatingHomeButton />
      <Footer />
    </div>
  );
}