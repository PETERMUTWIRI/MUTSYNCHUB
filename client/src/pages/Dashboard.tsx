import React from "react";
// Import your logo and icons here
// import Logo from "../assets/images/mutsynchub-logo.png";
// import { ... } from "lucide-react";
import DataSources from '../components/admin/DataSources';
import NLQueries from '../components/admin/NLQueries';
import Schedules from '../components/admin/Schedules';

const amber = "#FFA500";
const sidebarBg = "#232347";
const cardBg = "#1A1A2E";
const mainGradient = "bg-gradient-to-b from-[#321F61] to-[#1F224D]";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[220px] flex flex-col justify-between bg-[#232347] shadow-lg z-30">
        <div>
          <div className="flex items-center gap-3 px-6 py-8">
            {/* <img src={Logo} alt="MutSyncHub Logo" className="h-10 w-10" /> */}
            <span className="text-2xl font-extrabold text-white tracking-wide">MH <span className="text-[var(--accent-amber,#FFA500)]">MutSyncHub</span></span>
          </div>
          <nav className="flex flex-col gap-2 mt-6 px-2">
            {/* Map nav items here, highlight Dashboard in amber */}
            {/* ... */}
          </nav>
        </div>
        <div className="px-6 py-6 border-t border-[#282A36] flex items-center gap-3">
          {/* User avatar and info */}
          <div className="h-10 w-10 rounded-full bg-gray-600" />
          <div>
            <div className="text-white font-semibold">John Doe</div>
            <div className="text-xs text-gray-400">Business User</div>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <div className={`flex-1 ml-[220px] min-h-screen ${mainGradient} transition-all duration-300`}>
        {/* Header */}
        <header className="fixed left-[220px] right-0 top-0 h-[76px] flex items-center px-12 bg-transparent z-20" style={{backdropFilter: 'blur(8px)'}}>
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white mr-8">Dashboard</h1>
          </div>
        </header>
        {/* Feature Components */}
        <main className="pt-[100px] pb-12 px-12 w-full min-h-screen flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-1">
              <DataSources />
            </div>
            <div className="col-span-1 md:col-span-1">
              <NLQueries />
            </div>
            <div className="col-span-1 md:col-span-1">
              <Schedules />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
