import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Menu, X, ChevronDown, Book, LifeBuoy } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";
import logo from "@/assets/images/mutsynchub-logo.png";
import { cn } from "@/lib/utils";
import SSOLogin from "@/components/ui/SSOLogin";
import HomeSidebar from "@/components/ui/HomeSidebar";
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { supabase } from '@/lib/supabase';

// Google "or" divider component
const OrDivider = () => (
  <div className="flex items-center my-2">
    <div className="flex-1 h-px bg-gray-300" />
    <span className="mx-2 text-gray-400 text-xs font-semibold">or</span>
    <div className="flex-1 h-px bg-gray-300" />
  </div>
);

const Navbar: React.FC = () => {
  // Dialog open state
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ✅ Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme");

    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  // ✅ Toggle dark mode and persist to localStorage
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, setUser, setToken } = useAuth();
  const navigate = useNavigate();
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Login handler with role-based redirection
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) {
        setLoginError(error.message);
        return;
      }
      const token = data.session?.access_token;
      if (token) {
        // No need to set jwt_token cookie manually; handled by Supabase session and Authorization header
        setToken(token);
        // Optionally fetch user profile from backend or supabase
        // For now, just set user as logged in
        setUser({
          id: data.user?.id || '',
          orgId: '',
          token,
          name: data.user?.user_metadata?.full_name || '',
          email: data.user?.email || '',
          role: 'USER', // Force admin for dev
          plan: 'basic',
        });
        navigate('/admin');
      } else {
        setLoginError('No session token received.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };
  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupOrg, setSignupOrg] = useState('');
  const [signupSubdomain, setSignupSubdomain] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  // Signup handler
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError(null);
    setSignupSuccess(null);
    try {
      // Split name into first and last
      const [firstName, ...rest] = signupName.trim().split(' ');
      const lastName = rest.join(' ');
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            firstName: firstName || '',
            lastName: lastName || '',
            organizationName: signupOrg,
            subdomain: signupSubdomain,
          }
        }
      });
      if (error) {
        setSignupError(error.message);
      } else {
        setSignupSuccess('Account created! Please check your email to verify.');
        setTimeout(() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }, 1200);
      }
    } catch (err: any) {
      setSignupError(err?.message || 'Signup failed');
    } finally {
      setSignupLoading(false);
    }
  };
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/10 dark:bg-zinc-900/50 border-b border-white/10 dark:border-zinc-800 transition-all duration-300">
      <div className="w-full px-4 py-3 flex justify-between items-center">
        {/* Sidebar Trigger (leftmost, before logo, always visible) */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className={
              `rounded-full p-2 transition-all duration-150 shadow-sm border border-transparent bg-[rgba(255,255,255,0.07)] hover:bg-[rgba(0,0,0,0.07)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal,#1de9b6)]`
            }
            style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}
            aria-label="Open sidebar"
          >
            <Menu className="h-7 w-7 text-gray-700 dark:text-gray-100" />
          </Button>
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="MutSyncHub Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              MutSyncHub
            </span>
          </Link>
        </div>

        {/* Desktop Navigation - Only Solutions (landing) and Analytics Engine, spaced apart */}
        <nav className="hidden md:flex items-center justify-center gap-8 flex-1">
          <Link
            to="/home"
            className={`px-6 py-2 rounded-full text-lg font-bold transition-all duration-150 border border-transparent shadow-sm
              ${location.pathname === "/home" || location.pathname === "/" 
                ? "bg-[var(--accent-teal,#1de9b6)] text-white hover:bg-[var(--accent-teal,#1de9b6)] hover:shadow-md"
                : "bg-[rgba(0,0,0,0.03)] text-gray-700 dark:text-gray-200 hover:bg-[rgba(0,0,0,0.07)] hover:shadow-md"}
            `}
            style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', letterSpacing: '0.01em' }}
          >
            Solutions
          </Link>
          <button
            onClick={() => {
              if (user) {
                navigate('/analytics');
              } else {
                setLoginOpen(true);
              }
            }}
            className={`px-6 py-2 rounded-full text-lg font-bold transition-all duration-150 border border-transparent shadow-sm
              ${location.pathname.startsWith("/analytics") 
                ? "bg-[var(--accent-teal,#1de9b6)] text-white hover:bg-[var(--accent-teal,#1de9b6)] hover:shadow-md"
                : "bg-[rgba(0,0,0,0.03)] text-gray-700 dark:text-gray-200 hover:bg-[rgba(0,0,0,0.07)] hover:shadow-md"}
            `}
            style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', letterSpacing: '0.01em' }}
          >
            Analytics Engine
          </button>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* 🔘 Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full p-2 transition-all duration-150 shadow-sm border border-transparent bg-[rgba(255,255,255,0.07)] hover:bg-[rgba(0,0,0,0.07)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal,#1de9b6)]"
            style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-gray-700 dark:text-gray-100" /> : <Moon className="h-5 w-5 text-gray-700 dark:text-gray-100" />}
          </Button>

          {/* Auth buttons (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {/* Login Dialog */}
            <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
              <DialogTrigger asChild>
                <Button
                  className="rounded-full px-6 py-2 text-lg font-bold transition-all duration-150 border border-transparent shadow-sm bg-[rgba(0,0,0,0.03)] text-gray-700 dark:bg-[rgba(255,255,255,0.07)] dark:text-gray-200 hover:bg-[rgba(0,0,0,0.07)] dark:hover:bg-[rgba(255,255,255,0.15)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal,#1de9b6)]"
                  style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}
                  onClick={() => setLoginOpen(true)}
                >
                  Login
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-3/4 md:w-[380px] rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                <DialogHeader>
                  <DialogTitle>Login</DialogTitle>
                  <DialogDescription>Enter your credentials to sign in.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4 mt-4" onSubmit={handleLogin}>
                  <div>
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">Password</Label>
                    <Input
                      type="password"
                      id="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  {loginError && <div className="text-red-500 text-sm">{loginError}</div>}
                  <div className="flex justify-between items-center">
                    <Button type="submit" className="w-full" disabled={loginLoading}>
                      {loginLoading ? 'Logging in...' : 'Login'}
                    </Button>
                  </div>
                  <div className="flex justify-end mt-1">
                    <button type="button" className="text-xs text-[var(--accent-teal,#1de9b6)] hover:underline font-semibold">Forgot password?</button>
                  </div>
                </form>
                <OrDivider />
                <SSOLogin />
              </DialogContent>
            </Dialog>

            {/* Signup Dialog */}
            <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
              <DialogTrigger asChild>
                <Button
                  className="rounded-full px-6 py-2 text-lg font-bold transition-all duration-150 border border-transparent shadow-sm bg-[rgba(0,0,0,0.03)] text-gray-700 dark:bg-[rgba(255,255,255,0.07)] dark:text-gray-200 hover:bg-[rgba(0,0,0,0.07)] dark:hover:bg-[rgba(255,255,255,0.15)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal,#1de9b6)]"
                  style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}
                  onClick={() => setSignupOpen(true)}
                >
                  Sign Up
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-3/4 md:w-[380px] rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 pb-8 mt-8">
                <DialogHeader>
                  <DialogTitle>Create Account</DialogTitle>
                  <DialogDescription>Fill in your details to get started.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4 mt-4" onSubmit={handleSignup}>
                  <div>
                    <Label htmlFor="name" className="text-gray-700 dark:text-gray-200">Full Name</Label>
                    <Input
                      type="text"
                      id="name"
                      placeholder="John Doe"
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="org" className="text-gray-700 dark:text-gray-200">Organization</Label>
                    <Input
                      type="text"
                      id="org"
                      placeholder="Your Company"
                      value={signupOrg}
                      onChange={e => setSignupOrg(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subdomain" className="text-gray-700 dark:text-gray-200">Subdomain</Label>
                    <Input
                      type="text"
                      id="subdomain"
                      placeholder="xx.com"
                      value={signupSubdomain}
                      onChange={e => setSignupSubdomain(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">Password</Label>
                    <Input
                      type="password"
                      id="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={e => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  {signupError && <div className="text-red-500 text-sm">{signupError}</div>}
                  {signupSuccess && <div className="text-green-500 text-sm">{signupSuccess}</div>}
                  <Button type="submit" className="w-full" disabled={signupLoading}>
                    {signupLoading ? 'Signing up...' : 'Sign Up'}
                  </Button>
                </form>
                <OrDivider />
                <SSOLogin />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* HomeSidebar overlay (mobile sidebar) */}
        <HomeSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
    </header>
  );
};

export default Navbar;
