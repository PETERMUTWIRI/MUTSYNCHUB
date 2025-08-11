"use client";
import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
// Removed useNeonUser import
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import mutsynchLogo from '@/assets/images/mutsynchub-logo.png';
import Chatbot from './user/Chatbot';
import DashboardSidebar from './user/DashboardSidebar';

const navLinks = [
	{ to: '/dashboard', label: 'Overview' },
	{ to: '/dashboard/analytics', label: 'Analytics' },
	{ to: '/dashboard/billing', label: 'Billing' },
	{ to: '/dashboard/profile', label: 'Profile' },
	{ to: '/dashboard/support', label: 'Support' },
	{ to: '/dashboard/notifications', label: 'Notifications' },
	{ to: '/dashboard/security', label: 'Security' },
];


interface UserLayoutProps {
	user?: any;
	children?: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ user, children }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const [profileOpen, setProfileOpen] = React.useState(false);

  const handleLogout = () => {
	// For Stack Auth, you may need to clear cookies or call a logout endpoint
	// Example: window.location.href = '/handler/sign-out';
	window.location.href = '/handler/sign-out';
  }

  return (
	<div className="min-h-screen w-full flex">
	  {/* Sidebar */}
	  <DashboardSidebar className="w-[260px] flex-shrink-0" />
	  {/* Main Content */}
	  <div className="flex-1 min-h-screen bg-gradient-to-b from-[#321F61] to-[#1F224D] ml-[260px] relative">
		{/* User avatar top right */}
		<div className="absolute top-6 right-10 z-40">
		  <div
			className="relative group cursor-pointer"
			onMouseEnter={() => setProfileOpen(true)}
			onMouseLeave={() => setProfileOpen(false)}
		  >
			<Avatar>
			  <AvatarFallback className="bg-indigo-700 text-white font-bold text-lg">
				{user?.primaryEmail ? user.primaryEmail[0].toUpperCase() : 'U'}
			  </AvatarFallback>
			</Avatar>
			{/* Dropdown */}
			{profileOpen && (
			  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 px-4 flex flex-col items-start animate-fade-in z-50">
				<div className="text-gray-800 font-semibold mb-2">{user?.primaryEmail || 'User'}</div>
				<button
				  className="w-full text-left text-red-600 font-bold py-1 px-2 rounded hover:bg-red-50 transition"
				  onClick={handleLogout}
				>
				  Logout
				</button>
			  </div>
			)}
		  </div>
		</div>
			<main className="max-w-5xl mx-auto pt-4 pb-8">
				{children}
			</main>
	  </div>
	  <Chatbot />
	</div>
  );
};

export default UserLayout;
