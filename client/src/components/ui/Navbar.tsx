import React, { useEffect, useState } from "react";
declare global {
  interface Window {
    __dropdownTimeout?: ReturnType<typeof setTimeout>;
  }
}
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
import { FcGoogle } from "react-icons/fc";
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
        // TODO: Replace with real role from backend or user metadata
        const role = (data.user?.user_metadata?.role || 'USER').toUpperCase();
        setUser({
          id: data.user?.id || '',
          orgId: '',
          token,
          name: data.user?.user_metadata?.full_name || '',
          email: data.user?.email || '',
          role,
          plan: 'basic',
        });
        if (role === 'ADMIN') {
          navigate('/admin');
        } else {

          navigate('/dashboard');
        }
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

  // Google SSO handler (copied from SignUpPage)
  const handleGoogleSignup = async () => {
    setLoginLoading(true);
    setLoginError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    setLoginLoading(false);
    if (error) setLoginError(error.message);
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
          <div className="relative group">
            <button
              className={`px-6 py-2 rounded-full text-lg font-bold transition-all duration-150 border border-transparent shadow-sm flex items-center gap-2
                ${location.pathname === "/home" || location.pathname === "/solutions" || location.pathname === "/resources" || location.pathname === "/support"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg border border-cyan-500"
                  : "bg-[rgba(0,0,0,0.03)] text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white hover:shadow-lg border border-cyan-500"}
              `}
              style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', letterSpacing: '0.01em' }}
              type="button"
            >
              What We Do <ChevronDown className="w-5 h-5" />
            </button>
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-[900px] rounded-xl shadow-2xl z-50 hidden group-hover:block animate-fade-in flex"
              style={{
                background: 'linear-gradient(135deg, rgba(22, 163, 255, 0.85) 0%, rgba(59, 130, 246, 0.85) 50%, rgba(109, 40, 217, 0.85) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                width: '900px',
                minHeight: 'auto',
                transition: 'opacity 0.9s', // slower transition
                left: '50%',
                transform: 'translateX(-50%)',
              }}
              onMouseEnter={e => {
                clearTimeout(window.__dropdownTimeout);
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={e => {
                window.__dropdownTimeout = setTimeout(() => {
                  e.currentTarget.style.opacity = '0';
                }, 700); // increased delay before hiding
              }}
            >
              <div className="flex-1 py-4 px-6 grid grid-cols-3 gap-x-8 gap-y-2">
                <div>
                  <div className="text-indigo-200 font-bold mb-2 text-sm uppercase tracking-wider">What We Do</div>
                  <Link to="/solutions#ai-agents" className="block text-white hover:text-cyan-300 py-1 font-semibold transition flex items-center gap-2">
                    <span><svg width="20" height="20" fill="none"><path d="M10 2a8 8 0 1 1 0 16A8 8 0 0 1 10 2Zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 10 4Z" fill="#38bdf8"/></svg></span>AI Agent Ecosystems
                  </Link>
                  <Link to="/solutions#cloud-architecture" className="block text-white hover:text-cyan-300 py-1 font-semibold transition flex items-center gap-2">
                    <span><svg width="20" height="20" fill="none"><path d="M16 10a4 4 0 1 0-8 0H4a6 6 0 1 1 12 0h-2Z" fill="#0ea5e9"/></svg></span>Cloud-Native Architecture
                  </Link>
                  <Link to="/solutions#data-engineering" className="block text-white hover:text-cyan-300 py-1 font-semibold transition flex items-center gap-2">
                    <span><svg width="20" height="20" fill="none"><rect x="4" y="4" width="12" height="12" rx="3" fill="#6366f1"/></svg></span>Modern Data Engineering
                  </Link>
                  <Link to="/solutions#enterprise-chatbots" className="block text-white hover:text-cyan-300 py-1 font-semibold transition flex items-center gap-2">
                    <span><svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="8" fill="#a78bfa"/><rect x="7" y="7" width="6" height="6" rx="2" fill="#fff"/></svg></span>Enterprise Chatbot Systems
                  </Link>
                </div>
                <div>
                  <div className="text-indigo-200 font-bold mb-2 text-sm uppercase tracking-wider">More Services</div>
                  <Link to="/solutions#fullstack" className="block text-white hover:text-cyan-300 py-1 font-semibold transition flex items-center gap-2">
                    <span><svg width="20" height="20" fill="none"><rect x="3" y="3" width="14" height="14" rx="4" fill="#22d3ee"/></svg></span>Full-Stack Development
                  </Link>
                  <Link to="/solutions#api-integrations" className="block text-white hover:text-cyan-300 py-1 font-semibold transition flex items-center gap-2">
                    <span><svg width="20" height="20" fill="none"><rect x="5" y="5" width="10" height="10" rx="2" fill="#f59e42"/></svg></span>Enterprise API Integrations
                  </Link>
                  <Link to="/solutions#iot-cloud" className="block text-white hover:text-cyan-300 py-1 font-semibold transition flex items-center gap-2">
                    <span><svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="8" fill="#06b6d4"/><rect x="8" y="8" width="4" height="4" rx="1" fill="#fff"/></svg></span>IoT Cloud Platforms
                  </Link>
                  <Link to="/solutions#blockchain" className="block text-white hover:text-cyan-300 py-1 font-semibold transition flex items-center gap-2">
                    <span><svg width="20" height="20" fill="none"><rect x="6" y="6" width="8" height="8" rx="2" fill="#f472b6"/></svg></span>Blockchain Integration
                  </Link>
                </div>
                <div>
                  <div className="text-indigo-200 font-bold mb-2 text-sm uppercase tracking-wider">Resources</div>
                  <Link to="/resources#documentation" className="block text-white hover:text-yellow-300 py-1 font-semibold transition">Documentation</Link>
                  <Link to="/resources#api-reference" className="block text-white hover:text-yellow-300 py-1 font-semibold transition">API Reference</Link>
                  <Link to="/resources#guides" className="block text-white hover:text-yellow-300 py-1 font-semibold transition">Guides & Tutorials</Link>
                  <div className="text-indigo-200 font-bold mb-2 text-sm uppercase tracking-wider mt-4">Support</div>
                  <Link to="/what-we-do-support#support-center" className="block text-white hover:text-yellow-300 py-1 font-semibold transition">Support Center</Link>
                  <Link to="/what-we-do-support#help-center" className="block text-white hover:text-yellow-300 py-1 font-semibold transition">Help Center</Link>
                  <Link to="/what-we-do-support#contact" className="block text-white hover:text-yellow-300 py-1 font-semibold transition">Contact Us</Link>
                  <Link to="/what-we-do-support#community" className="block text-white hover:text-yellow-300 py-1 font-semibold transition">Community Forum</Link>
                  <Link to="/what-we-do-support#system-status" className="block text-white hover:text-yellow-300 py-1 font-semibold transition">System Status</Link>
                </div>
              </div>
            </div>
          </div>
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
                <div className="min-h-[400px] w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 p-0 relative">
                  {/* Overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-blue-900/70 to-purple-900/80 z-0" />
                  <div className="relative z-10 w-full flex flex-col items-center justify-center p-8">
                    <DialogHeader>
                      <DialogTitle className="text-blue-300 text-2xl font-extrabold mb-2">Login</DialogTitle>
                      <DialogDescription className="text-blue-100 text-base mb-4">Enter your credentials to sign in.</DialogDescription>
                    </DialogHeader>
                    <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
                      <input
                        type="email"
                        id="email"
                        placeholder="Email"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        required
                        className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
                      />
                      <input
                        type="password"
                        id="password"
                        placeholder="Password"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        required
                        className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
                      />
                      {loginError && <div className="text-red-400 text-sm text-center">{loginError}</div>}
                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="bg-gradient-to-r from-blue-400 to-teal-400 text-white font-bold py-2 rounded-lg shadow-lg hover:scale-105 transition text-base"
                      >
                        {loginLoading ? 'Logging in...' : 'Login'}
                      </button>
                      <div className="flex justify-end mt-1">
                        <button type="button" className="text-xs text-blue-300 hover:underline font-semibold">Forgot password?</button>
                      </div>
                    </form>
                    {/* OR divider */}
                    <div className="flex items-center my-2 w-full">
                      <div className="flex-1 h-px bg-blue-400" />
                      <span className="mx-2 text-blue-300 text-xs font-semibold">or</span>
                      <div className="flex-1 h-px bg-blue-400" />
                    </div>
                    {/* SSO Login with Google - styled like signup */}
                    <button
                      type="button"
                      onClick={handleGoogleSignup}
                      className="flex items-center justify-center gap-2 bg-white text-blue-900 font-bold py-2 rounded-lg shadow-lg hover:scale-105 transition border border-blue-400 text-base w-full"
                    >
                      <FcGoogle className="text-xl" /> Login with Google
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Signup Call-to-Action Button (links to full-page signup) */}
            <Link to="/signup">
              <Button
                className="rounded-full px-6 py-2 text-lg font-bold transition-all duration-150 border border-transparent shadow-sm bg-[rgba(0,0,0,0.03)] text-gray-700 dark:bg-[rgba(255,255,255,0.07)] dark:text-gray-200 hover:bg-[rgba(0,0,0,0.07)] dark:hover:bg-[rgba(255,255,255,0.15)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal,#1de9b6)]"
                style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
        {/* HomeSidebar overlay (mobile sidebar) */}
        <HomeSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
    </header>
  );
};

export default Navbar;
