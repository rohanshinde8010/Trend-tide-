import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import {
  TrendItem,
  Domain,
  fetchLiveTrends,
  fetchDomainTrends,
  fetchDomains,
  toggleWatchlist,
  fetchUserWatchlist,
} from '../api';
import { TrendCard } from '../components/TrendCard';
import { TrendDetailDrawer } from '../components/TrendDetailDrawer';

export const TrendingFeed: React.FC = () => {
  const { domainId } = useParams<{ domainId?: string }>();
  const location = useLocation();
  const isXRoute = location.pathname === '/x';
  const { currentRegion, regions, currentRegionMeta, setCurrentRegion } = useRegion();

  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [spotlight, setSpotlight] = useState<TrendItem | null>(null);
  const [, setDomains] = useState<Domain[]>([]);
  const [currentDomain, setCurrentDomain] = useState<Domain | null>(null);
  const [activeSort, setActiveSort] = useState<'ranked' | 'velocity' | 'breaking' | 'volume'>('ranked');
  const [activePlatform, setActivePlatform] = useState<'all' | 'x' | 'news' | 'hackernews'>(
    isXRoute ? 'x' : 'all'
  );
  const [selectedTrendId, setSelectedTrendId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [, setLastUpdated] = useState<string>('');

  useEffect(() => {
    if (isXRoute) {
      setActivePlatform('x');
    }
  }, [isXRoute]);

  useEffect(() => {
    fetchDomains().then(setDomains).catch(console.error);
    fetchUserWatchlist()
      .then((items) => {
        setBookmarkedIds(new Set(items.map((i) => i.trendId)));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    if (domainId) {
      fetchDomainTrends(domainId)
        .then((res) => {
          if (isMounted) {
            setCurrentDomain(res.domain);
            let filtered = [...res.trends];
            if (activePlatform !== 'all') {
              filtered = filtered.filter((t) => t.sourcePlatform === activePlatform);
            }
            if (currentRegion !== 'worldwide') {
              filtered = filtered.filter(
                (t) => !t.region || t.region === currentRegion || t.region === 'worldwide'
              );
            }
            if (activeSort === 'velocity') {
              filtered.sort((a, b) => b.velocity - a.velocity);
            } else if (activeSort === 'volume') {
              filtered.sort((a, b) => b.volumeCount - a.volumeCount);
            } else if (activeSort === 'breaking') {
              filtered = filtered.filter((t) => t.isBreaking);
            }
            setTrends(filtered);
            setSpotlight(filtered[0] || null);
            setLastUpdated(res.lastUpdated);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error(err);
          if (isMounted) setIsLoading(false);
        });
    } else {
      setCurrentDomain(null);
      fetchLiveTrends({
        sort: activeSort,
        platform: activePlatform !== 'all' ? activePlatform : undefined,
        region: currentRegion,
        limit: 80,
      })
        .then((res) => {
          if (isMounted) {
            setTrends(res.trends);
            setSpotlight(res.spotlight);
            setLastUpdated(res.lastUpdated);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error(err);
          if (isMounted) setIsLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [domainId, activeSort, activePlatform, currentRegion]);

  const handleToggleBookmark = async (trend: TrendItem) => {
    try {
      const res = await toggleWatchlist(trend.id);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (res.action === 'added') {
          next.add(trend.id);
        } else {
          next.delete(trend.id);
        }
        return next;
      });
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    }
  };

  const getDomainIcon = (iconName?: string) => {
    return iconName || 'trending_up';
  };

  const getHeaderTitle = () => {
    if (isXRoute || activePlatform === 'x') {
      return '𝕏 Twitter Live Trending Feed';
    }
    if (currentDomain) {
      return currentDomain.name;
    }
    return "What's Happening – Live Trends";
  };

  const getHeaderSubtitle = () => {
    if (isXRoute || activePlatform === 'x') {
      return 'Real-time trending hashtags, viral topics, and discussions streaming directly from X (formerly Twitter).';
    }
    if (currentDomain) {
      return currentDomain.description;
    }
    return 'Real-time trending topics, breaking news, hashtags, and discussions across 10 global domains & Twitter.';
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Desk Header Card */}
      <div className="bg-[#F4F7FA]/90 backdrop-blur-md border border-slate-300/90 rounded-2xl p-6 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#9D00FF]">
              <span className="material-symbols-outlined text-2xl">
                {isXRoute || activePlatform === 'x' ? 'tag' : currentDomain ? getDomainIcon(currentDomain.icon) : 'bolt'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {getHeaderTitle()}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Stream
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E2E7EE] text-slate-800 border border-slate-300 flex items-center gap-1">
                  <span>{currentRegionMeta.flag}</span>
                  <span>{currentRegionMeta.name}</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {getHeaderSubtitle()}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end text-xs text-slate-500 font-mono">
            <span className="text-[#9D00FF] font-bold text-sm">
              {trends.length} Signals Monitored
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">
              Multi-Source Ingestion Active · {currentRegionMeta.name}
            </span>
          </div>
        </div>

        {/* Geographic Region Filter Bar with Worldwide & Global Regions */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 flex-wrap text-xs">
          <span className="font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#9D00FF]">public</span>
            Region:
          </span>

          {regions.map((reg) => (
            <button
              key={reg.id}
              onClick={() => setCurrentRegion(reg.id)}
              className={`h-8 px-2.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                currentRegion === reg.id
                  ? 'bg-slate-900 text-white font-bold shadow-2xs'
                  : 'bg-[#E2E7EE] hover:bg-[#D9DFE7] text-slate-700 border border-slate-300'
              }`}
              title={reg.description}
            >
              <span>{reg.flag}</span>
              <span>{reg.name}</span>
            </button>
          ))}
        </div>

        {/* Source Stream Filter Buttons - Uniform h-8 buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 flex-wrap text-xs">
          <span className="font-semibold text-slate-500 mr-1">Stream Source:</span>

          <button
            onClick={() => setActivePlatform('all')}
            className={`h-8 px-3 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activePlatform === 'all'
                ? 'bg-slate-900 text-white font-bold shadow-2xs'
                : 'bg-[#E2E7EE] hover:bg-[#D9DFE7] text-slate-700 border border-slate-300'
            }`}
          >
            All Streams
          </button>

          <button
            onClick={() => setActivePlatform('x')}
            className={`h-8 px-3 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activePlatform === 'x'
                ? 'bg-slate-900 text-white font-bold shadow-2xs'
                : 'bg-[#E2E7EE] hover:bg-[#D9DFE7] text-slate-700 border border-slate-300'
            }`}
          >
            <span className="font-serif font-black text-xs">𝕏</span>
            Twitter / X
          </button>

          <button
            onClick={() => setActivePlatform('news')}
            className={`h-8 px-3 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activePlatform === 'news'
                ? 'bg-slate-900 text-white font-bold shadow-2xs'
                : 'bg-[#E2E7EE] hover:bg-[#D9DFE7] text-slate-700 border border-slate-300'
            }`}
          >
            Google News RSS
          </button>

          <button
            onClick={() => setActivePlatform('hackernews')}
            className={`h-8 px-3 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activePlatform === 'hackernews'
                ? 'bg-slate-900 text-white font-bold shadow-2xs'
                : 'bg-[#E2E7EE] hover:bg-[#D9DFE7] text-slate-700 border border-slate-300'
            }`}
          >
            Hacker News
          </button>
        </div>

        {/* Sort by Filter Buttons - Uniform h-8 buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 flex-wrap text-xs">
          <span className="font-semibold text-slate-500 mr-1">Sort Feed:</span>

          <button
            onClick={() => setActiveSort('ranked')}
            className={`h-8 px-3 rounded-lg font-medium transition ${
              activeSort === 'ranked'
                ? 'bg-[#9D00FF] text-white font-bold shadow-xs'
                : 'bg-[#E2E7EE] hover:bg-[#D9DFE7] text-slate-700 border border-slate-300'
            }`}
          >
            Top Ranked
          </button>

          <button
            onClick={() => setActiveSort('velocity')}
            className={`h-8 px-3 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeSort === 'velocity'
                ? 'bg-[#9D00FF] text-white font-bold shadow-xs'
                : 'bg-[#E2E7EE] hover:bg-[#D9DFE7] text-slate-700 border border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">trending_up</span>
            Highest Velocity (Surge)
          </button>

          <button
            onClick={() => setActiveSort('breaking')}
            className={`h-8 px-3 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeSort === 'breaking'
                ? 'bg-[#FE1D01] text-white font-bold shadow-xs'
                : 'bg-[#E2E7EE] hover:bg-[#D9DFE7] text-slate-700 border border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">bolt</span>
            Breaking News
          </button>

          <button
            onClick={() => setActiveSort('volume')}
            className={`h-8 px-3 rounded-lg font-medium transition ${
              activeSort === 'volume'
                ? 'bg-[#9D00FF] text-white font-bold shadow-xs'
                : 'bg-[#E2E7EE] hover:bg-[#D9DFE7] text-slate-700 border border-slate-300'
            }`}
          >
            Total Mentions
          </button>
        </div>
      </div>

      {/* Breaking Spotlight Hero */}
      {spotlight && !domainId && activeSort === 'ranked' && (
        <div
          onClick={() => setSelectedTrendId(spotlight.id)}
          className="relative overflow-hidden bg-slate-900 text-white rounded-2xl p-5.5 shadow-md cursor-pointer hover:bg-slate-850 transition group border border-slate-800"
        >
          <div className="flex items-center justify-between text-xs mb-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
              Breaking Spotlight
            </span>
            <span className="font-mono text-emerald-400 text-xs font-bold">
              +{spotlight.velocity}% Velocity Surge
            </span>
          </div>

          <h2 className="text-xl font-bold text-white group-hover:text-[#00E1FF] transition-colors">
            {spotlight.hashtag} — {spotlight.title}
          </h2>
          <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 max-w-3xl leading-relaxed">
            {spotlight.summary}
          </p>

          <div className="flex items-center justify-between mt-3.5 text-xs text-slate-400 pt-2.5 border-t border-slate-800">
            <span className="font-mono text-slate-300 font-semibold">{spotlight.volumeDisplay}</span>
            <span className="inline-flex items-center gap-1 text-[#00E1FF] font-semibold group-hover:underline">
              View AI Trend Forecast
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </span>
          </div>
        </div>
      )}

      {/* Main Trending Feed Cards List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 gap-3">
          <span className="material-symbols-outlined text-4xl text-[#9D00FF] animate-spin">sync</span>
          <span className="text-xs font-mono text-slate-600">Aggregating live multi-source signals...</span>
        </div>
      ) : trends.length > 0 ? (
        <div className="flex flex-col gap-3">
          {trends.map((t, idx) => (
            <TrendCard
              key={t.id}
              trend={t}
              rankIndex={idx}
              onSelect={(trend) => setSelectedTrendId(trend.id)}
              isBookmarked={bookmarkedIds.has(t.id)}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#F4F7FA] border border-slate-300 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center gap-2 shadow-2xs">
          <span className="material-symbols-outlined text-4xl text-slate-400">search_off</span>
          <p className="text-sm font-semibold text-slate-800">No trends matched the active filter.</p>
          <p className="text-xs text-slate-500">Try switching to 'All Streams' or 'Top Ranked' to explore all signals.</p>
        </div>
      )}

      {/* Analytical Detail & AI Forecast Drawer */}
      <TrendDetailDrawer
        trendId={selectedTrendId}
        onClose={() => setSelectedTrendId(null)}
        isBookmarked={selectedTrendId ? bookmarkedIds.has(selectedTrendId) : false}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
};
