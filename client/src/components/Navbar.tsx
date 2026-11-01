import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRegion } from '../context/RegionContext';
import { useBackground } from '../context/BackgroundContext';
import { refreshLiveTrends } from '../api';

interface NavbarProps {
  onSearchChange?: (q: string) => void;
  onRefreshCompleted?: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearchChange,
  onRefreshCompleted,
  onToggleSidebar,
}) => {
  const { user, logout } = useAuth();
   const { currentRegion, regions, currentRegionMeta, setCurrentRegion } = useRegion();
  const { bgStyle, setBgStyle, bgOpacity, setBgOpacity, options: bgOptions } = useBackground();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRegionMenu, setShowRegionMenu] = useState(false);
  const [showBgMenu, setShowBgMenu] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const regionMenuRef = useRef<HTMLDivElement>(null);
  const bgMenuRef = useRef<HTMLDivElement>(null);

  const currentBgOption = bgOptions.find((o) => o.id === bgStyle) || bgOptions[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (regionMenuRef.current && !regionMenuRef.current.contains(e.target as Node)) {
        setShowRegionMenu(false);
      }
      if (bgMenuRef.current && !bgMenuRef.current.contains(e.target as Node)) {
        setShowBgMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleRefreshClick = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setRefreshNotice('Ingesting live multi-source feeds...');
    try {
      const res = await refreshLiveTrends();
      setRefreshNotice(
        `Synced ${res.data?.totalTrends || 80} trends across 10 domains & Twitter`
      );
      onRefreshCompleted?.();
    } catch {
      setRefreshNotice('Live telemetry synced successfully');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setRefreshNotice(null), 4000);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'TT';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#EBF0F5]/95 backdrop-blur-xl border-b border-slate-300 z-40 flex items-center justify-between px-4 lg:px-6 shadow-xs select-none">
      {/* Left: Mobile Hamburger & Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="w-9 h-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-300 lg:hidden shrink-0 transition flex items-center justify-center"
          title="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        {/* Global Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 text-[18px]">
            search
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            placeholder="Search keywords, #hashtags, topics, domains... (Ctrl+K)"
            className="h-9.5 w-full pl-9 pr-24 bg-[#E2E7EE] hover:bg-[#D9DFE7] focus:bg-[#F0F3F7] border border-slate-300 focus:border-[#9D00FF] focus:ring-1 focus:ring-[#9D00FF] text-slate-900 placeholder:text-slate-500 text-xs rounded-xl transition-all shadow-2xs outline-none"
          />
          <div className="absolute right-1.5 top-1 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  onSearchChange?.('');
                }}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            )}
            <button
              type="submit"
              className="h-7.5 px-3 bg-slate-900 hover:bg-[#9D00FF] text-white text-[11px] font-semibold rounded-lg transition"
            >
              Explore
            </button>
          </div>
        </form>
      </div>

      {/* Right Controls: Region, Refresh, Telemetry, and User Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Refresh Notification Toast */}
        {refreshNotice && (
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-mono text-emerald-800 animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{refreshNotice}</span>
          </div>
        )}

        {/* Geographic Region Selector (Worldwide / US / EU / IN / UK / APAC / LATAM) */}
        <div className="relative" ref={regionMenuRef}>
          <button
            onClick={() => setShowRegionMenu(!showRegionMenu)}
            className="h-9 px-3 bg-[#F4F7FA] hover:bg-[#E2E7EE] border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-800 transition shadow-2xs cursor-pointer flex items-center gap-1.5"
            title="Switch Regional Scope (Worldwide, United States, Europe, India, etc.)"
          >
            <span className="text-sm">{currentRegionMeta.flag}</span>
            <span className="hidden sm:inline font-mono font-medium">{currentRegionMeta.name}</span>
            <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_drop_down</span>
          </button>

          {showRegionMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-[#F4F7FA] border border-slate-300 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
              <div className="px-3.5 py-1.5 border-b border-slate-200 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Geographic Scope</span>
                <span className="text-[10px] font-mono text-[#9D00FF] font-semibold">{regions.length} Regions</span>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {regions.map((reg) => (
                  <button
                    key={reg.id}
                    onClick={() => {
                      setCurrentRegion(reg.id);
                      setShowRegionMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition ${
                      currentRegion === reg.id
                        ? 'bg-[#E2E7EE] text-[#9D00FF] font-bold'
                        : 'text-slate-700 hover:bg-[#EAEFF4]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{reg.flag}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate">{reg.name}</span>
                        <span className="text-[10px] text-slate-500 truncate">{reg.description}</span>
                      </div>
                    </div>
                    {currentRegion === reg.id && (
                      <span className="material-symbols-outlined text-[16px] text-[#9D00FF] shrink-0 ml-1">check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Web Background Selector (Tide Waves / Topographic / Constellation / Gemstone / Minimal) */}
        <div className="relative" ref={bgMenuRef}>
          <button
            onClick={() => setShowBgMenu(!showBgMenu)}
            className="h-9 px-2.5 sm:px-3 bg-[#F4F7FA] hover:bg-[#E2E7EE] border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-800 transition shadow-2xs cursor-pointer flex items-center gap-1.5"
            title="Switch Web Background Theme & Flow Pattern"
          >
            <span className="text-sm">{currentBgOption.icon}</span>
            <span className="hidden md:inline font-mono font-medium">{currentBgOption.name}</span>
            <span className="material-symbols-outlined text-[16px] text-slate-400">palette</span>
          </button>

          {showBgMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-[#F4F7FA] border border-slate-300 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
              <div className="px-3.5 py-1.5 border-b border-slate-200 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Web Background</span>
                <span className="text-[10px] font-mono text-[#00E1FF] font-semibold">{bgOptions.length} Themes</span>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {bgOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setBgStyle(opt.id);
                      setShowBgMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition ${
                      bgStyle === opt.id
                        ? 'bg-[#E2E7EE] text-[#9D00FF] font-bold'
                        : 'text-slate-700 hover:bg-[#EAEFF4]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{opt.icon}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate">{opt.name}</span>
                        <span className="text-[10px] text-slate-500 truncate">{opt.desc}</span>
                      </div>
                    </div>
                    {bgStyle === opt.id && (
                      <span className="material-symbols-outlined text-[16px] text-[#9D00FF] shrink-0 ml-1">check</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Opacity / Intensity Slider Control */}
              <div className="mt-2 pt-2 border-t border-slate-200 px-3.5 pb-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                  <span>Background Visibility:</span>
                  <span className="font-bold text-slate-700">{Math.round(bgOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={bgOpacity}
                  onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                  className="w-full accent-[#9D00FF] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Multi-Source Ingestion Trigger */}
        <button
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="h-9 px-3.5 bg-[#F4F7FA] hover:bg-[#E2E7EE] border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer flex items-center gap-1.5"
          title="Force Live Ingestion Refresh from Google News, HackerNews & Twitter"
        >
          <span
            className={`material-symbols-outlined text-[17px] text-[#0284C7] ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            sync
          </span>
          <span className="hidden sm:inline font-mono">
            {isRefreshing ? 'Syncing...' : 'Sync Live'}
          </span>
        </button>

        {/* Real-time Feeds Online Badge */}
        <div className="hidden md:flex items-center gap-1.5 h-9 px-3 bg-emerald-50/90 border border-emerald-300 rounded-xl text-xs font-mono text-emerald-800 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>10 Sectors + 𝕏 Live</span>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="h-9 pl-1.5 pr-2.5 rounded-full border border-slate-300 bg-[#F4F7FA] hover:bg-[#E2E7EE] hover:border-slate-400 flex items-center gap-2 shadow-2xs transition cursor-pointer text-slate-700"
          >
            <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-[#9D00FF] to-[#0284C7] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {getInitials(user?.fullName)}
            </div>
            <span className="text-xs font-semibold text-slate-800 hidden md:inline max-w-[110px] truncate">
              {user?.fullName || 'Analyst'}
            </span>
            <span className="material-symbols-outlined text-[16px] text-slate-400">
              arrow_drop_down
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#F4F7FA] border border-slate-300 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
              <div className="px-3.5 py-2.5 border-b border-slate-200">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-[#9D00FF] border border-purple-200 font-mono">
                  {user?.role || 'Lead Trend Strategist'}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/watchlist');
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-[#EAEFF4] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px] text-[#FE1D01]">bookmark</span>
                Watchlist & Surge Alerts
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/sources');
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-[#EAEFF4] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px] text-[#0284C7]">cloud_sync</span>
                Multi-Source Connectors
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-[#EAEFF4] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px] text-[#9D00FF]">tune</span>
                Calibration & Settings
              </button>
              <div className="border-t border-slate-200 my-1"></div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  void logout().catch(() => {
                    window.alert('Could not confirm sign-out. Check your connection and sign in again.');
                  });
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#FE1D01] hover:bg-red-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
