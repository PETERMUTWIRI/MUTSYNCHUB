// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { StackTheme } from '@stackframe/stack';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MUTSYNCHUB - Data Synchronization and AI-Powered Analytics Platform',
  description: 'Synchronize and analyze your data with ease using MUTSYNCHUB.',
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import './globals.css';
// import MainLayout from './(main)/layout';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'MUTSYNCHUB - Data Synchronization and AI-Powered Analytics Platform',
//   description: 'Synchronize and analyze your data with ease using MUTSYNCHUB.',
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         {children}
//       </body>
//     </html>
//   );
// }