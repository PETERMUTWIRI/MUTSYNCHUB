'use client';

import * as React from 'react';
import { useUser } from '@stackframe/stack';
import { useEffect, useState } from 'react';

export default function DashboardSidebar({ className = '' }) {
  const user = useUser({ or: 'redirect' } as any); // Redirects to login if not authenticated
  const [navLinks, setNavLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchLinks = async () => {
      if (!user || !mounted) return;

      setLoading(true);
      setError(null);
      try {
        const { accessToken } = await user.getAuthJson();
        const res = await fetch('/api/sidebar/links', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch sidebar links');
        const data = await res.json();
        if (mounted) setNavLinks(data.links || []);
      } catch (err: any) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLinks();

    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) return <div className="text-center text-gray-400">Loading sidebar...</div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 backdrop-blur-lg shadow-xl flex flex-col py-6 z-30 w-[260px] border-none m-0 p-0 ${className}`}
    >
      <div className="flex flex-col items-center gap-4 mb-8">
        <img
          src="/assets/images/mutsynchub-logo.png"
          alt="MutSyncHub Logo"
          className="h-10 w-10 rounded-lg shadow-lg"
        />
        <span className="text-indigo-100 font-extrabold text-lg tracking-wide">MutSyncHub</span>
      </div>
      <nav className="flex flex-col gap-4 w-full items-center mt-2">
        {navLinks.map((link) => (
          <a
            key={link.to}
            href={link.to}
            className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
              location.pathname === link.to ? 'bg-indigo-800 text-white' : 'text-gray-300 hover:bg-indigo-800 hover:text-white'
            }`}
            title={link.label}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="hidden md:inline-block font-semibold text-base transition-all duration-200">
              {link.label}
            </span>
          </a>
        ))}
      </nav>
    </aside>
  );
}