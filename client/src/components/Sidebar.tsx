import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const coreNav = [
  { name: "What's Happening", path: '/', icon: 'bolt', color: '#62FF00' },
  { name: '𝕏 Twitter Trends', path: '/x', icon: 'tag', color: '#00E1FF' },
  { name: 'Search & Explore', path: '/explore', icon: 'search', color: '#9D00FF' },
  { name: 'Watchlist & Alerts', path: '/watchlist', icon: 'bookmark', color: '#FE1D01' },
  { name: 'Data Connectors', path: '/sources', icon: 'cloud_sync', color: '#00E1FF' },
];

const domains = [
  { id: 'tech-ai', name: 'Technology & AI', path: '/domain/tech-ai', icon: 'memory' },
  { id: 'cybersecurity', name: 'Cybersecurity', path: '/domain/cybersecurity', icon: 'security' },
  { id: 'business-startups', name: 'Business & Startups', path: '/domain/business-startups', icon: 'rocket_launch' },
  { id: 'finance-market', name: 'Finance & Stock Market', path: '/domain/finance-market', icon: 'monitoring' },
  { id: 'politics-world', name: 'Politics & World Affairs', path: '/domain/politics-world', icon: 'public' },
  { id: 'sports', name: 'Sports', path: '/domain/sports', icon: 'sports_soccer' },
  { id: 'entertainment-gaming', name: 'Entertainment & Gaming', path: '/domain/entertainment-gaming', icon: 'sports_esports' },
  { id: 'science-space', name: 'Science & Space', path: '/domain/science-space', icon: 'science' },
  { id: 'fashion-lifestyle', name: 'Fashion & Lifestyle', path: '/domain/fashion-lifestyle', icon: 'apparel' },
  { id: 'health-education', name: 'Health & Education', path: '/domain/health-education', icon: 'health_and_safety' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Pane */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#EBF0F5]/90 backdrop-blur-md border-r border-slate-300 z-50 flex flex-col justify-between shadow-xs select-none transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* 4-Color Gemstone Bar (Violet -> Red -> Green -> Cyan) */}
          <div className="h-1 w-full gemstone-bar shrink-0"></div>

          {/* TrendTide Official Logo & Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-300 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-slate-300 shadow-xs shrink-0 bg-[#E2E7EE]">
                <img
                  src="/trendtide-logo.jpg"
                  alt="TrendTide Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-base text-slate-900 leading-tight tracking-tight">
                  TrendTide
                </span>
                <span className="text-[10px] text-[#9D00FF] font-bold uppercase tracking-wider font-mono">
                  Live Intelligence
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-[#E2E7EE] lg:hidden"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Core Navigation */}
          <div className="px-4 pt-4 pb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Feed Desks
            </span>
          </div>
          <nav className="flex flex-col gap-1 px-3">
            {coreNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `h-9.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-[#9D00FF] text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-[#E2E7EE] hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className="material-symbols-outlined text-[19px] shrink-0"
                      style={{ color: isActive ? '#FFFFFF' : item.color }}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Domain-wise Trending Sections */}
          <div className="px-4 pt-5 pb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Domains & Sectors
            </span>
          </div>
          <nav className="flex flex-col gap-0.5 px-3 pb-6">
            {domains.map((dom) => (
              <NavLink
                key={dom.id}
                to={dom.path}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `h-8.5 px-3 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors ${
                    isActive
                      ? 'bg-[#E2E7EE] text-[#9D00FF] font-bold border-l-2 border-[#9D00FF] pl-2.5'
                      : 'text-slate-700 hover:bg-[#E2E7EE] hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[17px] text-slate-500 group-hover:text-slate-800 shrink-0">
                  {dom.icon}
                </span>
                <span className="truncate">{dom.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Session & Status in Sidebar Footer */}
        <div className="p-3 m-3 bg-[#E2E7EE] border border-slate-300 rounded-xl flex flex-col gap-2 shrink-0">
          {user && (
            <div className="flex items-center justify-between pb-2 border-b border-slate-300">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-[#9D00FF] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate leading-tight">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate leading-tight">
                    {user.role || 'Trend Analyst'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  void logout().catch(() => {
                    window.alert('Could not confirm sign-out. Check your connection and sign in again.');
                  });
                }}
                title="Sign Out"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-[#FE1D01] hover:bg-red-50 transition shrink-0"
              >
                <span className="material-symbols-outlined text-[17px]">logout</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-[10px] text-slate-600 font-medium">Live Telemetry Active</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">v4.2</span>
          </div>
        </div>
      </aside>
    </>
  );
};
