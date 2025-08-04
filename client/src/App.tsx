// src/App.tsx
import { Outlet } from 'react-router-dom';
import { StackProvider, StackTheme } from '@stackframe/react';
import { stackClientApp } from './lib/stack-auth';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import AIFloatingWidget from './components/ui/AIFloatingWidget';

export default function App() {
  return (
    <StackProvider app={stackClientApp}>
      <StackTheme>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
          <AIFloatingWidget />
        </div>
      </StackTheme>
    </StackProvider>
  );
}