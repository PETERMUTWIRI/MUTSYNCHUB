// src/app/layout.tsx
import { StackProvider, StackTheme } from '@stackframe/stack';
import { stackClientApp } from '@/lib/stack.client';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <TooltipProvider>
              {children}
              <Toaster position="top-right" />
            </TooltipProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}