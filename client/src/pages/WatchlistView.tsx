import React, { useState, useEffect } from 'react';
import { WatchlistItem, TrendItem, fetchUserWatchlist, toggleWatchlist } from '../api';
import { TrendCard } from '../components/TrendCard';
import { TrendDetailDrawer } from '../components/TrendDetailDrawer';

export const WatchlistView: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [selectedTrendId, setSelectedTrendId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadWatchlist = () => {
    setIsLoading(true);
    fetchUserWatchlist()
      .then((items) => {
        setWatchlist(items);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const handleToggle = async (trend: TrendItem) => {
    try {
      await toggleWatchlist(trend.id);
      loadWatchlist();
    } catch (err) {
      console.error(err);
    }
  };

  const surgeAlerts = watchlist.filter((w) => w.hasSurgeAlert);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header Card */}
      <div className="bg-[#F4F7FA]/90 backdrop-blur-md border border-slate-300/90 rounded-2xl p-6 shadow-2xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#FE1D01] text-2xl">bookmark</span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Watchlist & Surge Alerts
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Proactively monitor high-conviction trends across domains. Receive automated surge alerts when velocity accelerates above your thresholds.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-[#E2E7EE] px-4 py-2 rounded-xl border border-slate-300 text-center">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Followed</span>
            <span className="text-sm font-bold text-slate-900">{watchlist.length}</span>
          </div>

          <div className="bg-red-50 px-4 py-2 rounded-xl border border-red-200 text-center">
            <span className="text-[10px] text-red-600 uppercase block font-semibold">Surge Alerts</span>
            <span className="text-sm font-bold text-[#FE1D01]">{surgeAlerts.length}</span>
          </div>
        </div>
      </div>

      {/* Surge Alert Banner if alerts active */}
      {surgeAlerts.length > 0 && (
        <div className="bg-red-50/90 border border-red-200 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-[#FE1D01] shrink-0">
            <span className="material-symbols-outlined text-xl animate-pulse">crisis_alert</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-red-900">
              {surgeAlerts.length} Surge Alert{surgeAlerts.length > 1 ? 's' : ''} Triggered
            </h3>
            <p className="text-xs text-red-700/90 mt-0.5">
              The following followed trends have exceeded your target surge velocity threshold:
              <span className="font-semibold ml-1">
                {surgeAlerts.map((s) => s.trend?.hashtag).join(', ')}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Watchlist Items */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 gap-3">
          <span className="material-symbols-outlined text-4xl text-[#9D00FF] animate-spin">sync</span>
          <span className="text-xs font-mono text-slate-600">Loading followed trends...</span>
        </div>
      ) : watchlist.length > 0 ? (
        <div className="flex flex-col gap-3">
          {watchlist.map((item) => (
            <div key={item.id} className="relative">
              {item.hasSurgeAlert && (
                <div className="absolute -top-2 right-4 z-10 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#FE1D01] text-white shadow-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  Surge Alert Triggered (+{item.trend?.velocity}% &gt; +{item.alertThreshold}%)
                </div>
              )}
              {item.trend && (
                <TrendCard
                  trend={item.trend}
                  onSelect={(trend) => setSelectedTrendId(trend.id)}
                  isBookmarked={true}
                  onToggleBookmark={handleToggle}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#F4F7FA] border border-slate-300 rounded-2xl p-16 text-center text-slate-500 flex flex-col items-center gap-2 shadow-2xs">
          <span className="material-symbols-outlined text-4xl text-slate-400">bookmark_border</span>
          <p className="text-sm font-semibold text-slate-800">Your Watchlist is empty.</p>
          <p className="text-xs text-slate-500 max-w-sm">
            Click the bookmark icon on any trend card in "What's Happening" or "Search & Explore" to follow its trajectory and set surge alerts.
          </p>
        </div>
      )}

      {/* Trend Detail Drawer */}
      <TrendDetailDrawer
        trendId={selectedTrendId}
        onClose={() => setSelectedTrendId(null)}
        isBookmarked={true}
        onToggleBookmark={handleToggle}
      />
    </div>
  );
};
