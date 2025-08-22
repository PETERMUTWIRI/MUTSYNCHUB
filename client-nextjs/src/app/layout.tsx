import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { StackProvider, StackTheme } from '@stackframe/stack';
import { stackServerApp } from '../stack';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MUTSYNCHUB - Data Synchronization and AI-Powered Analytics Platform',
  description: 'Synchronize and analyze your data with ease using MUTSYNCHUB.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StackProvider app={stackServerApp}>
          <StackTheme>
            {children}
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}