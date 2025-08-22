'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Chatbot from './user/Chatbot';


interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('userData'); // Clear cache on logout
    window.location.href = '/handler/sign-out';
  };

  return (
    <div className="min-h-screen w-full flex">
      <div className="flex-1 min-h-screen bg-gradient-to-b from-[#321F61] to-[#1F224D] ml-[260px] relative">
        <div className="absolute top-6 right-10 z-40">
          <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setProfileOpen(true)}
            onMouseLeave={() => setProfileOpen(false)}
          >
            <Avatar>
              <AvatarFallback className="bg-indigo-700 text-white font-bold text-lg">
                U
              </AvatarFallback>
            </Avatar>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 px-4 flex flex-col items-start animate-fade-in z-50">
                <div className="text-gray-800 font-semibold mb-2">User</div>
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
        <main className="max-w-5xl mx-auto pt-4 pb-8">{children}</main>
      </div>
      <Chatbot />
    </div>
  );
};

export default UserLayout;