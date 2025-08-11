import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import "./globals.css";
// Removed Navbar, FloatingHomeButton, and Footer imports
// Removed AuthProvider import
// Removed Navbar import

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 min-h-screen flex flex-col">
        <StackProvider app={stackServerApp}>
          <StackTheme>
            
            {children}
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
