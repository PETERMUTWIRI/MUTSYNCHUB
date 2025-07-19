import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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

const UserLayout: React.FC = () => {
	const location = useLocation();
	const { user, setUser, setToken } = useAuth();
	const navigate = useNavigate();
	const [profileOpen, setProfileOpen] = React.useState(false);

	const handleLogout = () => {
		setUser(null);
		setToken(null);
		navigate('/');
	};

	return (
		<div className="min-h-screen w-full flex">
			{/* Sidebar */}
			<DashboardSidebar className="w-[260px] flex-shrink-0" />
			{/* Main Content */}
			<div className="flex-1 min-h-screen bg-gradient-to-b from-[#321F61] to-[#1F224D] ml-[260px]">
				<main className="max-w-5xl mx-auto pt-4 pb-8">
					<Outlet />
				</main>
			</div>
			<Chatbot />
		</div>
	);
};

export default UserLayout;
