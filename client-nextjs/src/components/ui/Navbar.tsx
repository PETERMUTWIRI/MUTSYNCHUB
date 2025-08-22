// src/components/ui/Navbar.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sun, Moon, Menu, ChevronDown } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import HomeSidebar from '@/components/ui/HomeSidebar';
import { useRoleRedirect } from '@/context/useRoleRedirect';

declare global {
  interface Window {
    __dropdownTimeout?: ReturnType<typeof setTimeout>;
  }
}

const Navbar: React.FC = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, loading, isAuthenticated, isAdmin } = useRoleRedirect();

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const handleMouseLeave = () => {
      dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 300);
    };
    const ref = dropdownRef.current;
    if (ref) {
      ref.addEventListener('mouseleave', handleMouseLeave);
      return () => ref.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, []);

  const handleLogout = async () => {
    try {
      if (user) {
        await user.signOut();
      }
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#1E2A44]/90 dark:bg-[#1E2A44] border-b border-[#2E7D7D]/20 transition-all duration-300 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="rounded-full p-2 text-[#2E7D7D] hover:bg-[#2E7D7D]/10 hover:text-white transition-colors duration-200"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/" className="flex items-center space-x-3">
            <img src="/assets/images/mutsynchub-logo.png" alt="MutSyncHub Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold text-white font-inter">MutSyncHub</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center flex-1 gap-6">
          <div className="relative">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      'group px-4 py-2 rounded-lg text-sm font-medium text-white hover:text-[#2E7D7D] hover:bg-[#2E7D7D]/10 transition-all duration-200',
                      pathname === '/' || pathname.startsWith('/solutions')
                        ? 'bg-[#2E7D7D]/20 text-white'
                        : ''
                    )}
                    onMouseEnter={() => {
                      if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
                      setDropdownOpen(true);
                    }}
                  >
                    What We Do <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent
                    ref={dropdownRef}
                    className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-[1100px] rounded-xl bg-[#1E2A44]/90 border border-[#2E7D7D]/20 shadow-xl p-6 animate-fade-in"
                    onMouseEnter={() => {
                      if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
                      setDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                      dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 300);
                    }}
                  >
                    <div className="grid grid-cols-3 gap-8">
                      <div>
                        <h4 className="text-[#A3BFFA] font-medium text-sm uppercase tracking-wider mb-4">What We Do</h4>
                        <Link href="/solutions#ai-agents" className="block text-white hover:text-[#2E7D7D] py-2 font-medium text-base leading-relaxed transition-colors flex items-center gap-3">
                          <span><svg width="20" height="20" fill="none"><path d="M10 2a8 8 0 1 1 0 16A8 8 0 0 1 10 2Zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 10 4Z" fill="#A3BFFA"/></svg></span>AI Agent Ecosystems
                        </Link>
                        <Link href="/solutions#cloud-architecture" className="block text-white hover:text-[#2E7D7D] py-2 font-medium text-base leading-relaxed transition-colors flex items-center gap-3">
                          <span><svg width="20" height="20" fill="none"><path d="M16 10a4 4 0 1 0-8 0H4a6 6 0 1 1 12 0h-2Z" fill="#A3BFFA"/></svg></span>Cloud-Native Architecture
                        </Link>
                        <Link href="/solutions#data-engineering" className="block text-white hover:text-[#2E7D7D] py-2 font-medium text-base leading-relaxed transition-colors flex items-center gap-3">
                          <span><svg width="20" height="20" fill="none"><rect x="4" y="4" width="12" height="12" rx="3" fill="#A3BFFA"/></svg></span>Data Engineering
                        </Link>
                        <Link href="/solutions#enterprise-chatbots" className="block text-white hover:text-[#2E7D7D] py-2 font-medium text-base leading-relaxed transition-colors flex items-center gap-3">
                          <span><svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="8" fill="#A3BFFA"/><rect x="7" y="7" width="6" height="6" rx="2" fill="#fff"/></svg></span>Enterprise Chatbot Systems
                        </Link>
                      </div>
                      <div>
                        <h4 className="text-[#A3BFFA] font-medium text-sm uppercase tracking-wider mb-4">More Services</h4>
                        <Link href="/solutions#fullstack" className="block text-white hover:text-[#2E7D7D] py-2 font-medium text-base leading-relaxed transition-colors flex items-center gap-3">
                          <span><svg width="20" height="20" fill="none"><rect x="3" y="3" width="14" height="14" rx="4" fill="#A3BFFA"/></svg></span>Full-Stack Development
                        </Link>
                        <Link href="/solutions#api-integrations" className="block text-white hover:text-[#2E7D7D] py-2 font-medium text-base leading-relaxed transition-colors flex items-center gap-3">
                          <span><svg width="20" height="20" fill="none"><rect x="5" y="5" width="10" height="10" rx="2" fill="#A3BFFA"/></svg></span>Enterprise API Integrations
                        </Link>
                        <Link href="/solutions#iot-cloud" className="block text-white hover:text-[#2E7D7D] py-2 font-medium text-base leading-relaxed transition-colors flex items-center gap-3">
                          <span><svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="8" fill="#A3BFFA"/><rect x="8" y="8" width="4" height="4" rx="1" fill="#fff"/></svg></span>IoT Cloud Platforms
                        </Link>
                        <Link href="/solutions#blockchain" className="block text-white hover:text-[#2E7D7D] py-2 font-medium text-base leading-relaxed transition-colors flex items-center gap-3">
                          <span><svg width="20" height="20" fill="none"><rect x="6" y="6" width="8" height="8" rx="2" fill="#A3BFFA"/></svg></span>Blockchain Integration
                        </Link>
                      </div>
                      <div>
                        <h4 className="text-[#A3BFFA] font-medium text-sm uppercase tracking-wider mb-4">Resources</h4>
                        <Link href="/resources?category=documentation" className="block text-white hover:text-[#2E7D7D] py-2 font-medium text-base leading-relaxed transition-colors">Documentation</Link>
                        <Link href="/resources?category=api" className="block text-white hover:text-[#2E7D7D] py-2 font-medium text-base leading-relaxed transition-colors">API Reference</Link>
                        <Link href="/resources?category=guides" className="block text-white hover:text-[#2E7D7D] py-2 font-medium text-base leading-relaxed transition-colors">Guides & Tutorials</Link>
                        <h4 className="text-[#A3BFFA] font-medium text-sm uppercase tracking-wider mt-6 mb-4">Support</h4>
                        <Link href="/what-we-do-support" className="block text-white hover:text-[#2E7D7D] py-2 font-medium text-base leading-relaxed transition-colors">Support Center</Link>
                        <Link href="/what-we-do-support" className="block text-white hover:text-[#2E7D7D] py-2 font-medium text-base leading-relaxed transition-colors">Help Center</Link>
                        <Link href="/what-we-do-support" className="block text-white hover:text-[#2E7D7D] py-2 font-medium text-base leading-relaxed transition-colors">Contact Us</Link>
                        <Link href="/what-we-do-support" className="block text-white hover:text-[#2E7D7D] py-2 font-medium text-base leading-relaxed transition-colors">Community Forum</Link>
                        <Link href="/what-we-do-support" className="block text-white hover:text-[#2E7D7D] py-2 font-medium text-base leading-relaxed transition-colors">System Status</Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <Button
            onClick={() => router.push(isAdmin ? '/admin-dashboard' : '/user-dashboard-main')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium text-white hover:text-[#2E7D7D] hover:bg-[#2E7D7D]/10 transition-all duration-200',
              pathname.startsWith('/admin-dashboard') || pathname.startsWith('/user-dashboard-main')
                ? 'bg-[#2E7D7D]/20'
                : ''
            )}
          >
            {isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
          </Button>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full p-2 text-[#A3BFFA] hover:bg-[#2E7D7D]/10 hover:text-white transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {loading ? (
            <span className="text-[#A3BFFA] text-sm">Loading...</span>
          ) : isAuthenticated ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full p-2 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
              aria-label="Sign out"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="bg-transparent border-[#E2E8F0] text-[#2E7D7D] hover:bg-[#2E7D7D]/10 hover:border-[#256363] px-4 py-2 text-sm font-semibold rounded-md shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => router.push('/sign-in')}
              >
                Login
              </Button>
              <Button
                className="bg-[#2E7D7D] text-white px-4 py-2 text-sm font-semibold rounded-md hover:bg-[#256363] shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => router.push('/sign-up')}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
        <HomeSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
    </header>
  );
};

export default Navbar;