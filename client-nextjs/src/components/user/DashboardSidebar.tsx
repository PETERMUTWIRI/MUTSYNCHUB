'use client';

import * as React from 'react';
import { useUser } from '@stackframe/stack';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BarChart2, DollarSign, Database, Bell, User, HelpCircle, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import dynamic from 'next/dynamic';
import { Toaster, toast } from 'react-hot-toast';

/* ---- dynamic imports ---- */
const Avatar        = dynamic(() => import('@/components/ui/avatar').then(m => m.Avatar), { ssr: false });
const AvatarFallback= dynamic(() => import('@/components/ui/avatar').then(m => m.AvatarFallback), { ssr: false });
const AvatarImage   = dynamic(() => import('@/components/ui/avatar').then(m => m.AvatarImage), { ssr: false });
const Button        = dynamic(() => import('@/components/ui/button').then(m => m.Button), { ssr: false });
const Chatbot       = dynamic(() => import('@/components/user/Chatbot'), { ssr: false });

/* ---- nav links ---- */
const navLinks = [
  { to: '/user-dashboard-main',            label: 'Home',        icon: <Home size={20} /> },
  { to: '/user-dashboard-main/analytics',  label: 'Analytics',   icon: <BarChart2 size={20} /> },
  { to: '/user-dashboard-main/billing',    label: 'Billing',     icon: <DollarSign size={20} /> },
  { to: '/user-dashboard-main/data-source',label: 'Data Source', icon: <Database size={20} /> },
  { to: '/user-dashboard-main/notification',label:'Notifications',icon:<Bell size={20} /> },
  { to: '/user-dashboard-main/profile',    label: 'Profile',     icon: <User size={20} /> },
  { to: '/user-dashboard-main/support',    label: 'Support',     icon: <HelpCircle size={20} /> },
  { to: '/user-dashboard-main/security',   label: 'Security',    icon: <Settings size={20} /> },
];

/* ---- types ---- */
type Profile = { firstName?: string; avatarUrl?: string };

export default function DashboardSidebar({ className = '', onToggle }: { className?: string; onToggle: (isOpen: boolean) => void }) {
  const user   = useUser({ or: 'redirect' });
  const router = useRouter();
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen]     = useState(false);
  const [profile, setProfile]             = useState<Profile | null>(null);

  /* ----------  fetch profile once  ---------- */
  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(setProfile)
      .catch(() => toast.error('Could not load profile'));
  }, []);

  /* ----------  helpers  ---------- */
  const displayName = profile?.firstName || user?.displayName || 'User';
  const avatarSrc   = profile?.avatarUrl || user?.profileImageUrl || '';

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    onToggle(newState);
  };

  const handleLogout = async () => {
    try {
      await user?.signOut();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch {
      toast.error('Failed to log out');
    }
  };

  /* ----------  render  ---------- */
  return (
    <>
      <motion.aside
        initial={{ x: 0 }}
        animate={{ x: 0, width: isSidebarOpen ? 260 : 60 }}
        transition={{ duration: 0.3 }}
        className={`fixed left-0 top-0 h-screen bg-[#1E2A44] text-white font-inter shadow-xl flex flex-col py-6 z-30 border-r border-[#2E7D7D]/30 ${className}`}
      >
        {/* ----  LOGO / USER AVATAR  ---- */}
        <div className={`flex flex-col ${isSidebarOpen ? 'items-center' : 'items-start'} gap-4 mb-8 px-4`}>
          <div className="flex items-center gap-4">
            <Avatar className="w-10 h-10 rounded-lg shadow-lg">
              {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayName} /> : <AvatarFallback className="bg-[#2E7D7D] text-white font-bold">{displayName[0].toUpperCase()}</AvatarFallback>}
            </Avatar>
            {isSidebarOpen && <span className="text-white font-sans font-extrabold text-lg tracking-wide">{displayName}</span>}
          </div>

          {!isSidebarOpen && (
            <Button
              onClick={toggleSidebar}
              className="flex items-center justify-center w-8 h-8 bg-[#2E7D7D]/20 border border-[#2E7D7D]/30 rounded-full shadow-lg hover:bg-[#2E7D7D]/80 transition-colors ml-1 mt-2"
              aria-label="Maximize Sidebar"
              data-tooltip-id="maximize-sidebar"
              data-tooltip-content="Maximize Sidebar"
            >
              <ChevronRight size={16} className="text-white" />
            </Button>
          )}
          <Tooltip id="maximize-sidebar" />
        </div>

        {/* ----  NAV  ---- */}
        <nav className={`flex flex-col gap-4 w-full ${isSidebarOpen ? 'items-center' : 'items-start'} mt-2 flex-grow`}>
          {navLinks.map((link, idx) => (
            <div key={link.to} className="relative group">
              <Link
                href={link.to}
                className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all duration-200 font-sans ${
                  pathname === link.to ? 'bg-[#2E7D7D] text-white' : 'text-gray-300 hover:bg-[#2E7D7D]/50 hover:text-white'
                }`}
                aria-label={link.label}
                data-tooltip-id={`nav-${idx}`}
                data-tooltip-content={isSidebarOpen ? '' : link.label}
              >
                <span className="text-xl">{link.icon}</span>
                {isSidebarOpen && <span className="font-semibold text-base">{link.label}</span>}
              </Link>
              {!isSidebarOpen && <Tooltip id={`nav-${idx}`} />}
            </div>
          ))}

          {/* ----  PROFILE + LOGOUT  ---- */}
          <div className="mt-auto px-4 py-3 w-full">
            <div className="flex items-center justify-between w-full">
              <div
                className={`flex items-center gap-4 ${isSidebarOpen ? 'cursor-pointer' : ''}`}
                onMouseEnter={() => isSidebarOpen && setProfileOpen(true)}
                onMouseLeave={() => isSidebarOpen && setProfileOpen(false)}
                aria-label="User Profile"
              >
                <Avatar className="w-9 h-9">
                  {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayName} /> : <AvatarFallback className="bg-[#2E7D7D] text-white font-bold">{displayName[0].toUpperCase()}</AvatarFallback>}
                </Avatar>
                {isSidebarOpen && <span className="text-white font-semibold">{displayName}</span>}
              </div>

              {isSidebarOpen ? (
                <Button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-300 hover:bg-red-900/50 hover:text-red-400" aria-label="Logout">
                  <LogOut size={18} />
                  <span>Logout</span>
                </Button>
              ) : (
                <Button onClick={handleLogout} className="p-2 rounded-xl text-gray-300 hover:bg-red-900/50 hover:text-red-400" aria-label="Logout" data-tooltip-id="logout-tip" data-tooltip-content="Logout">
                  <LogOut size={18} />
                </Button>
              )}
              <Tooltip id="logout-tip" />
            </div>

            {isSidebarOpen && profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full right-0 mb-2 w-48 bg-[#1E2A44] rounded-xl shadow-lg py-2 px-4 flex flex-col items-start border border-[#2E7D7D]/30 z-50"
              >
                <div className="text-white font-semibold mb-2">{displayName}</div>
                <Button onClick={handleLogout} className="w-full text-left text-red-400 font-bold py-1 px-2 rounded hover:bg-red-900/50 transition">Logout</Button>
              </motion.div>
            )}
          </div>
        </nav>

        {/* ----  TOGGLE CHEVRON  ---- */}
        {isSidebarOpen && (
          <>
            <Button
              onClick={toggleSidebar}
              className="absolute top-4 right-[-16px] bg-[#2E7D7D]/20 border border-[#2E7D7D]/30 rounded-full p-1 shadow-lg hover:bg-[#2E7D7D]/80 transition-colors"
              aria-label="Minimize Sidebar"
              data-tooltip-id="minimize-sidebar"
              data-tooltip-content="Minimize Sidebar"
            >
              <ChevronLeft size={16} className="text-white" />
            </Button>
            <Tooltip id="minimize-sidebar" />
          </>
        )}
      </motion.aside>

      {/* ----  CHATBOT POSITION  ---- */}
      <div className={`fixed bottom-4 ${isSidebarOpen ? 'left-[260px]' : 'left-[60px]'} z-40 transition-all duration-300`}>
        <Chatbot />
      </div>

      <Toaster position="top-right" />
    </>
  );
}