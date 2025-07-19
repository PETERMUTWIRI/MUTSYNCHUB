import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartPie, FaChartBar, FaCreditCard, FaUser, FaLifeRing, FaBell, FaLock } from 'react-icons/fa';
import mutsynchLogo from '@/assets/images/mutsynchub-logo.png';

const navLinks = [
  { to: '/dashboard', label: 'Overview', icon: <FaChartPie /> },
  { to: '/dashboard/analytics', label: 'Analytics', icon: <FaChartBar /> },
  { to: '/dashboard/billing', label: 'Billing', icon: <FaCreditCard /> },
  { to: '/dashboard/profile', label: 'Profile', icon: <FaUser /> },
  { to: '/dashboard/support', label: 'Support', icon: <FaLifeRing /> },
  { to: '/dashboard/notifications', label: 'Notifications', icon: <FaBell /> },
  { to: '/dashboard/security', label: 'Security', icon: <FaLock /> },
];

interface DashboardSidebarProps {
  className?: string;
}

export default function DashboardSidebar({ className = '' }: DashboardSidebarProps) {
  const location = useLocation();
  return (
    <aside className={"fixed left-0 top-0 h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 backdrop-blur-lg shadow-xl flex flex-col py-6 z-30 w-[260px] border-none m-0 p-0"}>
      <div className="flex flex-col items-center gap-4 mb-8">
        <img src={mutsynchLogo} alt="MutSyncHub Logo" className="h-10 w-10 rounded-lg shadow-lg" />
        <span className="text-indigo-100 font-extrabold text-lg tracking-wide">MutSyncHub</span>
      </div>
      <nav className="flex flex-col gap-4 w-full items-center mt-2">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all duration-200 ${location.pathname === link.to ? 'bg-indigo-800/60 text-amber-400 shadow-lg scale-105' : 'text-slate-200 hover:bg-indigo-800/40 hover:text-white'}`}
            title={link.label}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="hidden md:inline-block font-semibold text-base transition-all duration-200">{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
